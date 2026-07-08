// CloudFront Function (viewer-request) — HTTP Basic Auth gate for the whole site.
//
// NOT real security: the credential below is embedded in this function's code and
// is trivially recoverable by anyone determined. It only keeps casual visitors out.
// Nothing sensitive lives on this site; it links out to apps that have their own gates.
//
// Rotate the password:
//   1. Compute base64 of "username:password", e.g.:  printf 'portfolio:NEWPASS' | base64
//   2. Replace the string in EXPECTED_AUTH below.
//   3. Redeploy the function + publish + wait for propagation:
//        ./deploy.sh rotate     (see README)
//
// Runtime: cloudfront-js-2.0. Keep this ES5-compatible.

var EXPECTED_AUTH = 'Basic cG9ydGZvbGlvOkJKS1BvcnRmb2xpbw=='; // base64("portfolio:BJKPortfolio")

function handler(event) {
    var request = event.request;
    var headers = request.headers;

    if (!headers.authorization || headers.authorization.value !== EXPECTED_AUTH) {
        return {
            statusCode: 401,
            statusDescription: 'Unauthorized',
            headers: {
                'www-authenticate': { value: 'Basic realm="Selected Work", charset="UTF-8"' },
                'cache-control': { value: 'no-store' }
            }
        };
    }

    return request;
}
