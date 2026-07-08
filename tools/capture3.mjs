// Capture Hazard Intel (dashboard + admin) past NYCEM30, and re-capture IAD 2.0
// by actually logging in (email + NYCEM30) to reach the directory itself.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const OUT = path.resolve('captures');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const GATE = 'NYCEM30';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function passGate(page, { email } = {}) {
  // Fill an email/username field if present, then the password, then submit.
  const emailSel = 'input[type="email"], input[name*="mail" i], input[placeholder*="mail" i], input[type="text"]';
  const em = page.locator(emailSel).first();
  if (email && await em.count() > 0 && await em.isVisible().catch(() => false)) {
    await em.fill(email).catch(() => {});
  }
  const pw = page.locator('input[type="password"]').first();
  if (await pw.count() > 0) {
    await pw.fill(''); await pw.fill(GATE);
  }
  // Prefer an explicit submit/sign-in button, else Enter.
  const btn = page.locator('button:has-text("Sign In"), button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Continue"), button:has-text("Enter"), button[type="submit"], input[type="submit"]').first();
  if (await btn.count() > 0) { await btn.click({ timeout: 4000 }).catch(() => {}); }
  else if (await pw.count() > 0) { await pw.press('Enter').catch(() => {}); }
  await sleep(4500);
}

async function shoot(browser, key, url, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 }, deviceScaleFactor: 2, ignoreHTTPSErrors: true, ...(opts.ctx || {}) });
  const page = await ctx.newPage();
  const rec = { key, url, status: null, title: null };
  try {
    let r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((e) => { rec.gotoErr = e.message.slice(0, 70); return null; });
    if (!r) { await sleep(1500); r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((e) => { rec.gotoErr2 = e.message.slice(0, 70); return null; }); }
    rec.status = r ? r.status() : null;
    await sleep(2800);
    await page.screenshot({ path: path.join(OUT, `${key}_raw.png`) });
    fs.writeFileSync(path.join(OUT, `${key}.html`), await page.content());
    await passGate(page, opts);
    rec.title = await page.title().catch(() => null);
    await page.screenshot({ path: path.join(OUT, `${key}_after.png`) });
    // Report visible input inventory for diagnosis
    rec.inputs = await page.$$eval('input', els => els.map(e => e.type + (e.placeholder ? `(${e.placeholder})` : '')));
  } catch (e) { rec.err = e.message.slice(0, 120); }
  console.log(JSON.stringify(rec));
  await ctx.close();
}

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', `--proxy-server=${process.env.HTTPS_PROXY || 'http://127.0.0.1:42213'}`, '--ssl-version-max=tls1.2', '--disable-http2'] });
await shoot(browser, 'inteldash', 'https://inteldash.benjaminkrakauer.com/');
await shoot(browser, 'hazardintel', 'https://hazardintel.benjaminkrakauer.com/');
await shoot(browser, 'iad_login', 'https://iad.benjaminkrakauer.com/', { email: 'demo@nyc.gov' });
await browser.close();
