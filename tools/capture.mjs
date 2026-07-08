// Screenshot capture for the six live portfolio apps.
// Loads each URL, screenshots the raw landing, then — if a password wall is
// detected — types the known gate value (NYCEM30), submits, and screenshots
// again. Dumps page HTML for source inspection. No AWS access required.
//
// Run: NODE_PATH=/opt/node22/lib/node_modules node tools/capture.mjs
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT = path.resolve('captures');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const GATE = 'NYCEM30';

const TARGETS = [
  { key: 'emergencyplan', url: 'https://emergencyplanagent.benjaminkrakauer.com/', gated: true },
  { key: 'procurement',   url: 'https://procurementagent.benjaminkrakauer.com/',   gated: true },
  { key: 'translate',     url: 'https://translate.benjaminkrakauer.com/',          gated: false },
  { key: 'travelreceipt', url: 'https://www.travelreceipt.com/',                   gated: false },
  { key: 'snowcorps',     url: 'https://snowcorps.benjaminkrakauer.com/',          gated: true },
  { key: 'snowcorps_admin', url: 'https://admin.snowcorps.benjaminkrakauer.com/',  gated: true },
  { key: 'iad',           url: 'https://iad.benjaminkrakauer.com/',                gated: true },
  { key: 'iad_update',    url: 'https://update.iad.benjaminkrakauer.com/',         gated: true },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tryGate(page) {
  // Find a password field (or any single visible text/password input) and submit GATE.
  const selectors = [
    'input[type="password"]',
    'input[name*="pass" i]',
    'input[placeholder*="password" i]',
    'input[type="text"]',
  ];
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    try {
      if (await el.count() > 0 && await el.isVisible()) {
        await el.fill(GATE);
        // Try Enter, then any submit-ish button.
        await el.press('Enter').catch(() => {});
        await sleep(1200);
        const btn = page.locator('button:visible, input[type="submit"]:visible').first();
        if (await btn.count() > 0) { await btn.click({ timeout: 2000 }).catch(() => {}); }
        await sleep(2500);
        return sel;
      }
    } catch { /* keep trying */ }
  }
  return null;
}

async function run() {
  // The session's egress proxy resets Chromium's TLS 1.3 handshakes; forcing TLS 1.2
  // + disabling HTTP/2 through the proxy is what makes navigations succeed here.
  const browser = await chromium.launch({
    executablePath: EXE,
    args: [
      '--no-sandbox',
      `--proxy-server=${process.env.HTTPS_PROXY || 'http://127.0.0.1:42213'}`,
      '--ssl-version-max=tls1.2',
      '--disable-http2',
    ],
  });
  const report = [];
  for (const t of TARGETS) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, ignoreHTTPSErrors: true });
    const page = await ctx.newPage();
    const rec = { key: t.key, url: t.url, status: null, gatedInput: null, title: null, err: null };
    try {
      const resp = await page.goto(t.url, { waitUntil: 'networkidle', timeout: 45000 }).catch(async (e) => {
        // networkidle can hang on polling SPAs; fall back to domcontentloaded
        rec.err = 'networkidle_timeout:' + e.message.slice(0, 80);
        return page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      });
      rec.status = resp ? resp.status() : null;
      await sleep(3000);
      rec.title = await page.title().catch(() => null);
      await page.screenshot({ path: path.join(OUT, `${t.key}_raw.png`), fullPage: false });
      fs.writeFileSync(path.join(OUT, `${t.key}.html`), await page.content());
      if (t.gated) {
        const used = await tryGate(page);
        rec.gatedInput = used;
        if (used) {
          await sleep(3500);
          rec.title = await page.title().catch(() => rec.title);
          await page.screenshot({ path: path.join(OUT, `${t.key}_after.png`), fullPage: false });
          fs.writeFileSync(path.join(OUT, `${t.key}_after.html`), await page.content());
        }
      }
    } catch (e) {
      rec.err = (rec.err ? rec.err + ' | ' : '') + e.message.slice(0, 120);
    }
    report.push(rec);
    console.log(JSON.stringify(rec));
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
}
run().catch((e) => { console.error(e); process.exit(1); });
