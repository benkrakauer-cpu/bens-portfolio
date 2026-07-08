// Targeted deeper captures: drive gated/demo apps one level past the entry
// screen to a more representative view. Same proxy/TLS workaround as capture.mjs.
import { chromium } from 'playwright';
import path from 'path';

const OUT = path.resolve('captures');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickByText(page, text, timeout = 6000) {
  const el = page.getByText(text, { exact: false }).first();
  await el.waitFor({ state: 'visible', timeout }).catch(() => {});
  await el.click({ timeout: 4000 }).catch(() => {});
}

async function run() {
  const browser = await chromium.launch({
    executablePath: EXE,
    args: ['--no-sandbox', '--proxy-server=http://127.0.0.1:42213', '--ssl-version-max=tls1.2', '--disable-http2'],
  });

  // 1. Emergency Plan — pass gate, choose English, reach the conversation.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, ignoreHTTPSErrors: true });
    const page = await ctx.newPage();
    await page.goto('https://emergencyplanagent.benjaminkrakauer.com/', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
    await sleep(2500);
    const pw = page.locator('input[type="password"]').first();
    if (await pw.count() > 0) { await pw.fill('NYCEM30'); await pw.press('Enter'); await sleep(3000); }
    await clickByText(page, 'English');
    await sleep(5000);
    await page.screenshot({ path: path.join(OUT, 'emergencyplan_convo.png') });
    console.log('emergencyplan_convo done, title=', await page.title().catch(() => null));
    await ctx.close();
  }

  // 2. SnowCorps worker — mobile viewport, Demo Mode.
  {
    const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ignoreHTTPSErrors: true });
    const page = await ctx.newPage();
    await page.goto('https://snowcorps.benjaminkrakauer.com/', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
    await sleep(3000);
    await clickByText(page, 'Demo Mode');
    await sleep(5000);
    await page.screenshot({ path: path.join(OUT, 'snowcorps_demo.png') });
    console.log('snowcorps_demo done, title=', await page.title().catch(() => null));
    await ctx.close();
  }

  // 3. SnowCorps admin — desktop, Demo Mode (landscape dashboard).
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, ignoreHTTPSErrors: true });
    const page = await ctx.newPage();
    await page.goto('https://admin.snowcorps.benjaminkrakauer.com/', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
    await sleep(3000);
    await clickByText(page, 'Demo Mode');
    await sleep(5000);
    await page.screenshot({ path: path.join(OUT, 'snowcorps_admin_demo.png') });
    console.log('snowcorps_admin_demo done, title=', await page.title().catch(() => null));
    await ctx.close();
  }

  await browser.close();
}
run().catch((e) => { console.error(e); process.exit(1); });
