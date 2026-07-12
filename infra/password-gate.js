// CloudFront Function (viewer-request) — single-password gate for the whole site.
//
// Presents a password-ONLY sign-in page (no username). On success the browser
// stores the password in a cookie, which this function checks on every request;
// unauthenticated requests (including assets) get the sign-in page instead of
// the site, so content is never served without the password.
//
// NOT real security: the password lives in this function and the cookie is
// trivially recoverable by anyone determined. It only keeps casual visitors out.
// Nothing sensitive lives on this site; it links out to apps with their own gates.
//
// Rotate the password:
//   1. Change PASSWORD below (keep it URL/cookie-safe — letters/digits).
//   2. ./deploy.sh rotate   (updates + publishes the function; ~1 min to propagate)
//
// Runtime: cloudfront-js-2.0. Keep this ES5-compatible (no template literals).

var PASSWORD = 'BJKPortfolio';
var COOKIE = 'pf_auth';

function signInResponse(showError) {
    var err = showError ? '<p class="err">Incorrect password.</p>' : '';
    var html =
        '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<meta name="robots" content="noindex,nofollow"><title>Selected Work</title><style>' +
        '*{box-sizing:border-box}html,body{height:100%}' +
        'body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;' +
        'background:#faf8f4;color:#1f2937;display:flex;align-items:center;justify-content:center;padding:20px}' +
        '.card{background:#fff;border:1px solid #e7e2d8;border-radius:14px;' +
        'box-shadow:0 1px 2px rgba(31,41,55,.04),0 8px 24px rgba(31,41,55,.06);padding:36px 32px;width:min(92vw,380px);text-align:center}' +
        'h1{font-family:Georgia,"Times New Roman",serif;font-weight:600;font-size:26px;margin:0}' +
        '.rule{height:3px;width:44px;background:#b0762a;border-radius:2px;margin:14px auto 22px}' +
        'label{display:block;text-align:left;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#52606d;margin:0 0 6px}' +
        'input{width:100%;padding:11px 12px;font-size:15px;border:1px solid #d9d3c7;border-radius:9px;background:#fdfcfa;color:#1f2937}' +
        'input:focus{outline:2px solid #b0762a;outline-offset:1px;border-color:#b0762a}' +
        'button{width:100%;margin-top:16px;padding:11px 12px;font-size:15px;font-weight:600;color:#fff;background:#b0762a;border:0;border-radius:9px;cursor:pointer}' +
        'button:hover{background:#9a6522}' +
        '.err{color:#b4232a;font-size:13px;margin:10px 0 0;text-align:left}' +
        '.hint{color:#7a8592;font-size:12px;margin:20px 0 0}' +
        '</style></head><body><form class="card" id="f">' +
        '<h1>Selected Work</h1><div class="rule"></div>' +
        '<label for="p">Password</label>' +
        '<input id="p" type="password" autocomplete="current-password" autofocus>' +
        err +
        '<button type="submit">Enter</button>' +
        '<p class="hint">Applied civic technology · New York City</p></form>' +
        '<script>document.getElementById("f").addEventListener("submit",function(e){e.preventDefault();' +
        'document.cookie="' + COOKIE + '="+document.getElementById("p").value+"; path=/; max-age=604800; secure; samesite=lax";' +
        'location.reload();});</script></body></html>';
    return {
        statusCode: 401,
        statusDescription: 'Unauthorized',
        headers: {
            'content-type': { value: 'text/html; charset=utf-8' },
            'cache-control': { value: 'no-store' }
        },
        body: html
    };
}

function handler(event) {
    var request = event.request;
    var cookies = request.cookies;
    if (cookies && cookies[COOKIE] && cookies[COOKIE].value === PASSWORD) {
        return request;
    }
    // Show an error only once they've submitted a (wrong) password.
    return signInResponse(cookies && cookies[COOKIE] ? true : false);
}
