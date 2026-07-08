#!/usr/bin/env bash
# Deploy / manage the password-gated portfolio site (S3 + CloudFront).
#
# Usage:
#   ./deploy.sh deploy          Sync src/ to S3 and invalidate CloudFront (default)
#   ./deploy.sh rotate          Re-publish the CloudFront basic-auth function after
#                               editing infra/basic-auth.js (rotate the password)
#   ./deploy.sh attach-domain   Once the ACM cert is ISSUED, add the custom domain
#                               alias + certificate to the distribution
#   ./deploy.sh status          Print key resource state (dist, cert, function)
#   ./deploy.sh verify          Curl the gate: expect 401 without creds, 200 with
#
# Requires: AWS CLI v2 with credentials for account 212275623655, region us-east-1.
set -euo pipefail

# ---- Configuration (edit here if resources change) ----
REGION="us-east-1"
BUCKET="portfolio-benjaminkrakauer-com"
DIST_ID="E2W79PKQYJZFQP"
DIST_DOMAIN="d3n3019f8cwaj.cloudfront.net"
FUNCTION_NAME="portfolio-basic-auth"
CERT_ARN="arn:aws:acm:us-east-1:212275623655:certificate/c89ec742-980d-4c93-9c8f-d8e5844234c8"
CUSTOM_DOMAIN="portfolio.benjaminkrakauer.com"
SRC_DIR="src"
AUTH_USER="portfolio"
AUTH_PASS="BJKPortfolio"   # for `verify` only; the real gate lives in infra/basic-auth.js

export AWS_DEFAULT_REGION="$REGION"
CMD="${1:-deploy}"

deploy() {
  echo ">> Syncing $SRC_DIR/ to s3://$BUCKET ..."
  aws s3 cp "$SRC_DIR/index.html" "s3://$BUCKET/index.html" \
    --content-type "text/html; charset=utf-8" --cache-control "public,max-age=60,must-revalidate"
  aws s3 cp "$SRC_DIR/styles.css" "s3://$BUCKET/styles.css" \
    --content-type "text/css; charset=utf-8" --cache-control "public,max-age=300"
  aws s3 cp "$SRC_DIR/app.js" "s3://$BUCKET/app.js" \
    --content-type "application/javascript; charset=utf-8" --cache-control "public,max-age=300"
  aws s3 cp "$SRC_DIR/assets/images/" "s3://$BUCKET/assets/images/" --recursive \
    --content-type "image/webp" --cache-control "public,max-age=31536000,immutable"
  echo ">> Invalidating CloudFront ..."
  aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" \
    --query 'Invalidation.{Id:Id,Status:Status}' --output table
  echo ">> Done. Live (with creds) at https://$DIST_DOMAIN/"
}

rotate() {
  echo ">> Re-publishing $FUNCTION_NAME from infra/basic-auth.js ..."
  ETAG=$(aws cloudfront describe-function --name "$FUNCTION_NAME" --query 'ETag' --output text)
  aws cloudfront update-function --name "$FUNCTION_NAME" \
    --function-config Comment="Basic auth gate for portfolio site",Runtime="cloudfront-js-2.0" \
    --function-code "fileb://infra/basic-auth.js" --if-match "$ETAG" >/dev/null
  ETAG=$(aws cloudfront describe-function --name "$FUNCTION_NAME" --query 'ETag' --output text)
  aws cloudfront publish-function --name "$FUNCTION_NAME" --if-match "$ETAG" >/dev/null
  echo ">> Published. Allow a minute for propagation, then: ./deploy.sh verify"
}

attach_domain() {
  local status
  status=$(aws acm describe-certificate --certificate-arn "$CERT_ARN" \
    --query 'Certificate.Status' --output text)
  if [ "$status" != "ISSUED" ]; then
    echo "!! ACM cert is '$status', not ISSUED. Add the validation CNAME (see"
    echo "   infra/dns-records-to-add.txt) and wait for it to validate first."
    exit 1
  fi
  echo ">> Cert ISSUED. Adding alias $CUSTOM_DOMAIN + certificate to distribution ..."
  TMP=$(mktemp -d)
  aws cloudfront get-distribution-config --id "$DIST_ID" --output json > "$TMP/full.json"
  ETAG=$(python3 -c "import json;print(json.load(open('$TMP/full.json'))['ETag'])")
  python3 - "$TMP/full.json" "$TMP/new.json" "$CUSTOM_DOMAIN" "$CERT_ARN" <<'PY'
import json, sys
full, out, domain, cert = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
cfg = json.load(open(full))['DistributionConfig']
cfg['Aliases'] = {'Quantity': 1, 'Items': [domain]}
cfg['ViewerCertificate'] = {
    'ACMCertificateArn': cert, 'SSLSupportMethod': 'sni-only',
    'MinimumProtocolVersion': 'TLSv1.2_2021', 'Certificate': cert,
    'CertificateSource': 'acm'
}
json.dump(cfg, open(out, 'w'))
PY
  aws cloudfront update-distribution --id "$DIST_ID" \
    --distribution-config "file://$TMP/new.json" --if-match "$ETAG" \
    --query 'Distribution.Status' --output text
  rm -rf "$TMP"
  echo ">> Alias attached. Add the portfolio CNAME (record #2 in"
  echo "   infra/dns-records-to-add.txt), then browse https://$CUSTOM_DOMAIN/"
}

status() {
  echo "== Distribution =="
  aws cloudfront get-distribution --id "$DIST_ID" \
    --query 'Distribution.{Status:Status,Domain:DomainName,Aliases:DistributionConfig.Aliases.Items}' --output table
  echo "== ACM certificate =="
  aws acm describe-certificate --certificate-arn "$CERT_ARN" \
    --query 'Certificate.{Status:Status,Domain:DomainName}' --output table
  echo "== Function =="
  aws cloudfront describe-function --name "$FUNCTION_NAME" \
    --query 'FunctionSummary.{Name:Name,Stage:FunctionMetadata.Stage,Runtime:FunctionConfig.Runtime}' --output table
}

verify() {
  echo "-- no creds (expect 401) --"
  curl -sS -o /dev/null -w "  status=%{http_code}\n" "https://$DIST_DOMAIN/"
  echo "-- wrong creds (expect 401) --"
  curl -sS -o /dev/null -w "  status=%{http_code}\n" -u "$AUTH_USER:nope" "https://$DIST_DOMAIN/"
  echo "-- correct creds (expect 200) --"
  curl -sS -o /dev/null -w "  status=%{http_code} type=%{content_type}\n" -u "$AUTH_USER:$AUTH_PASS" "https://$DIST_DOMAIN/"
}

case "$CMD" in
  deploy)        deploy ;;
  rotate)        rotate ;;
  attach-domain) attach_domain ;;
  status)        status ;;
  verify)        verify ;;
  *) echo "Unknown command: $CMD"; echo "Use: deploy | rotate | attach-domain | status | verify"; exit 1 ;;
esac
