# Selected Work — portfolio.benjaminkrakauer.com

A single-page, password-gated portfolio. Seven project tiles that expand in place
(accordion) to reveal a longer story and live links. Static HTML/CSS/vanilla JS,
served from S3 behind CloudFront, gated with an HTTP Basic Auth CloudFront Function.

- **Live (CloudFront):** https://d3n3019f8cwaj.cloudfront.net/
- **Custom domain (pending DNS):** https://portfolio.benjaminkrakauer.com/
- **Gate:** username `portfolio`, password `BJKPortfolio`

```
src/
  index.html            The page (header + six accordion tiles, verbatim copy)
  styles.css            Slate neutrals + one muted-amber accent; responsive grid
  app.js                Accordion toggle (aria-expanded + inert, keyboard-friendly)
  assets/images/*.webp  One optimized screenshot per tile (~11–37 KB each)
infra/
  basic-auth.js                    CloudFront Function (viewer-request) — the gate
  cloudfront-distribution.json     Distribution config used to create the CDN
  cache-policy-index-short.json    Short-TTL cache policy for index.html
  bucket-policy.json               S3 policy granting the distribution OAC read
  dns-records-to-add.txt           The two external DNS records the owner must add
tools/
  capture.mjs / capture2.mjs       Playwright scripts that captured the screenshots
  verify.mjs                       Local render + accordion a11y check
deploy.sh               deploy | rotate | attach-domain | status | verify
```

## Deploying

```bash
./deploy.sh deploy     # sync src/ to S3 + invalidate CloudFront
./deploy.sh verify     # 401 without creds, 200 with portfolio:BJKPortfolio
./deploy.sh status     # distribution / cert / function state
```

Requires AWS CLI v2 with credentials for account `212275623655` (`us-east-1`).

## Editing tile copy

All copy lives directly in `src/index.html`, one `<li class="tile">` per project.
Each tile has a `.tile-headline`, a `.tile-oneliner`, a `.tile-story`, and one or
more links in `.tile-links`. Edit the text in place, then `./deploy.sh deploy`.

## Swapping a tile image

1. Drop the new image in `src/assets/images/` (keep it ~1200 px wide, 16:10, WebP).
   To re-optimize a PNG/screenshot to the same spec:
   ```bash
   python3 - <<'PY'
   from PIL import Image
   im = Image.open('new-shot.png').convert('RGB')
   # center-crop to 16:10 if needed, then resize to 1200 wide
   w,h = im.size; r = 16/10
   if w/h > r: nw=int(h*r); im=im.crop(((w-nw)//2,0,(w-nw)//2+nw,h))
   else:       nh=int(w/r); im=im.crop((0,0,w,nh))
   im.resize((1200, int(1200*im.size[1]/im.size[0])), Image.LANCZOS)\
     .save('src/assets/images/<name>.webp','WEBP',quality=80,method=6)
   PY
   ```
2. Point the tile's `<img src="assets/images/<name>.webp">` at it (if the name changed).
3. `./deploy.sh deploy`.

## Rotating the password

The credential is a single constant at the top of `infra/basic-auth.js`:

```js
var EXPECTED_AUTH = 'Basic cG9ydGZvbGlvOkJKS1BvcnRmb2xpbw=='; // base64("portfolio:BJKPortfolio")
```

1. Compute the new value: `printf 'portfolio:NEWPASSWORD' | base64`
2. Paste it into `EXPECTED_AUTH`.
3. Re-publish the function: `./deploy.sh rotate` (allow ~1 min to propagate, then
   `./deploy.sh verify`).

### This gate is NOT real security

The password is embedded in the CloudFront Function's code and is trivially
recoverable by anyone determined — it only keeps casual visitors out. Nothing
sensitive lives on this site; it only links out to the apps, each of which has its
own gate. Do not put anything private here.

## DNS records the owner must add (external — GoDaddy / Google, not AWS)

`benjaminkrakauer.com` is **not** in Route 53 — it is registered at GoDaddy with DNS
managed externally (Google). So both the ACM validation record and the final
CNAME must be created **by hand at the DNS host**. AWS cannot create them.

**Record 1 — ACM certificate validation (add first).** This lets the TLS certificate
for `portfolio.benjaminkrakauer.com` issue.

| Field | Value |
|-------|-------|
| Type  | `CNAME` |
| Host / Name | `_bd0dbfea47c49ee939cf8194f5595460.portfolio` |
| Value / Points to | `_0f7c0cafeff5e3cac3bf62b0cfa99b90.jkddzztszm.acm-validations.aws` |
| TTL | 1 hour (default fine) |

**Record 2 — the portfolio hostname.** This points the site at CloudFront.

| Field | Value |
|-------|-------|
| Type  | `CNAME` |
| Host / Name | `portfolio` |
| Value / Points to | `d3n3019f8cwaj.cloudfront.net` |
| TTL | 1 hour |

### How to add a CNAME

**GoDaddy (registrar-managed DNS):** My Products → the domain → **DNS** →
**Add New Record** → Type `CNAME` → **Name** = the Host value above (GoDaddy appends
`.benjaminkrakauer.com` automatically, so enter just `portfolio` or
`_bd0dbfea47c49ee939cf8194f5595460.portfolio`) → **Value** = the Points-to value →
Save.

**Google Cloud DNS (if the zone is delegated to Google):** the Cloud DNS zone →
**Add record set** → DNS name = `portfolio` (or the `_bd0d…portfolio` label) →
Resource record type `CNAME` → TTL 1 h → **Canonical name** = the value above → Create.
*(Google Domains has since moved to Squarespace; if DNS is there, use its DNS editor —
same three fields: type CNAME, host, value.)*

After **Record 1** is added and the cert shows `ISSUED` (`./deploy.sh status`), run
`./deploy.sh attach-domain` to attach the alias + certificate to the distribution,
then add **Record 2**. `https://portfolio.benjaminkrakauer.com/` will resolve once
that CNAME propagates (minutes to a couple of hours).

## Per-tile image provenance

Every image is a **real screenshot** of the running app — captured with a headless
browser (Playwright/Chromium) against the live URL, passing the known `NYCEM30` gate
where that was the wall. No image is imagined, and none is an unlabeled mock-up. None
required the "labeled preview" or "placeholder" fallback.

| # | Tile | Image | Provenance | View captured |
|---|------|-------|-----------|---------------|
| 1 | NYC Emergency Plan Assistant | `emergencyplan.webp` | **Real screenshot** | Post-gate conversation view (assistant welcome, "chat in any language" banner) |
| 2 | Procurement Agent | `procurement.webp` | **Real screenshot** | Post-gate "What are you buying?" category step |
| 3 | Document Translation Service | `translate.webp` | **Real screenshot** | Public landing / upload screen |
| 4 | TravelReceipt | `travelreceipt.webp` | **Real screenshot** | Public landing (upload + target language + pricing) |
| 5 | SnowCorps | `snowcorps.webp` | **Real screenshot** | Admin **Demo Mode** dashboard (KPIs, live claims feed, borough breakdown) |
| 6 | IAD 2.0 — Interagency Directory | `iad.webp` | **Real screenshot** | Authenticated directory dashboard — KPI cards, alert queue, and recently-updated contacts (seeded demo data; fictional names + 555 numbers) |
| 7 | Hazard Intelligence (dashboard + admin) | `hazardintel.webp` | **Real screenshot** | Post-gate Situational Dashboard (`inteldash`) — briefing products, hazard outlook, 5-day forecast, live alert/grid panels |

Note on #6: IAD 2.0 uses a genuine email+password login (not a shared password wall).
Captured by signing in with an owner-provided demo credential; the directory shown is
seeded demo data (fictional contact names, 555 phone numbers), consistent with the app's
own "PROTOTYPE — NOT CLEARED FOR PII" banner.

## Infrastructure (created for this site only)

| Resource | Value |
|----------|-------|
| Account / region | `212275623655` / `us-east-1` |
| S3 bucket (private, OAC-only) | `portfolio-benjaminkrakauer-com` |
| CloudFront distribution | `E2W79PKQYJZFQP` → `d3n3019f8cwaj.cloudfront.net` |
| Origin Access Control | `E3W0QCGSIMFA4I` |
| CloudFront Function (viewer-request) | `portfolio-basic-auth` (runtime `cloudfront-js-2.0`) |
| Cache policy (index.html) | `portfolio-index-short` (default 60 s / max 300 s) |
| Cache policy (`/assets/*`) | managed `CachingOptimized` |
| Price class | `PriceClass_100` |
| ACM certificate | `…certificate/c89ec742-980d-4c93-9c8f-d8e5844234c8` (us-east-1, DNS-validated) |

The bucket blocks all public access; only the distribution can read it (OAC + a bucket
policy scoped to this distribution's ARN). No existing production resources were
modified — everything above was newly created for this site.
