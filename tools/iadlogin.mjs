// Log into IAD 2.0 with a supplied demo credential (read from env — never hardcoded)
// and capture the directory itself. Run:
//   IAD_EMAIL=... IAD_PASS=... node tools/iadlogin.mjs
import { chromium } from 'playwright';
import path from 'path';
const OUT = path.resolve('captures');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY = process.env.HTTPS_PROXY || 'http://127.0.0.1:42213';
const EMAIL = process.env.IAD_EMAIL, PASS = process.env.IAD_PASS;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!EMAIL || !PASS) { console.error('set IAD_EMAIL and IAD_PASS'); process.exit(2); }

const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', `--proxy-server=${PROXY}`, '--ssl-version-max=tls1.2', '--disable-http2'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, ignoreHTTPSErrors: true });
const p = await ctx.newPage();
await p.goto('https://iad.benjaminkrakauer.com/', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
await sleep(2500);
await p.locator('input[type="email"], input[type="text"]').first().fill(EMAIL);
const pw = p.locator('input[type="password"]').first();
await pw.fill(''); await pw.fill(PASS);
await p.locator('button:has-text("Sign In"), button[type="submit"]').first().click({ timeout: 5000 }).catch(() => {});
await sleep(6000);

const stillLogin = (await p.locator('input[type="password"]').count()) > 0;
const bodyText = (await p.evaluate(() => document.body.innerText).catch(() => '')).replace(/\s+/g, ' ').slice(0, 500);
console.log('stillLogin=', stillLogin, '| title=', await p.title().catch(() => null));
console.log('bodyText:', bodyText);
await p.screenshot({ path: path.join(OUT, 'iad_in.png'), fullPage: false });

// If there's a nav to a directory/contacts list, try to land on the richest view.
for (const label of ['Directory', 'Contacts', 'Agencies']) {
  const link = p.getByText(label, { exact: false }).first();
  if (await link.count() > 0 && await link.isVisible().catch(() => false)) {
    await link.click({ timeout: 3000 }).catch(() => {});
    await sleep(3500);
    await p.screenshot({ path: path.join(OUT, `iad_in_${label.toLowerCase()}.png`) });
    console.log('captured view:', label);
    break;
  }
}
await b.close();
