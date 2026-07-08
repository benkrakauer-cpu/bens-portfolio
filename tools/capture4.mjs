import { chromium } from 'playwright';
import path from 'path';
const OUT = path.resolve('captures');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY = process.env.HTTPS_PROXY || 'http://127.0.0.1:42213';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', `--proxy-server=${PROXY}`, '--ssl-version-max=tls1.2', '--disable-http2'] });

// 1) Situational Dashboard — pass gate, wait for panels to populate, then shoot.
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, ignoreHTTPSErrors: true });
  const p = await ctx.newPage();
  await p.goto('https://inteldash.benjaminkrakauer.com/', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await sleep(2500);
  const pw = p.locator('input[type="password"]').first();
  if (await pw.count() > 0) { await pw.fill('NYCEM30'); await pw.press('Enter').catch(() => {}); const btn = p.locator('button:has-text("Enter"),button:has-text("Sign"),button[type="submit"]').first(); if (await btn.count()>0) await btn.click({timeout:3000}).catch(()=>{}); }
  await sleep(13000); // let the 90s-refresh panels fetch their first data
  await p.screenshot({ path: path.join(OUT, 'inteldash_v2.png') });
  console.log('inteldash_v2 done, title=', await p.title().catch(() => null));
  await ctx.close();
}

// 2) IAD — strategy A: leave the pre-filled password, just supply an email; capture any error text.
for (const [tag, email, overwritePw] of [['A', 'demo@nyc.gov', false], ['B', 'admin@nyc.gov', true]]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, ignoreHTTPSErrors: true });
  const p = await ctx.newPage();
  await p.goto('https://iad.benjaminkrakauer.com/', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await sleep(2500);
  const em = p.locator('input[type="email"], input[type="text"]').first();
  if (await em.count() > 0) await em.fill(email);
  const pw = p.locator('input[type="password"]').first();
  if (overwritePw && await pw.count() > 0) { await pw.fill('NYCEM30'); }
  const btn = p.locator('button:has-text("Sign In"), button[type="submit"]').first();
  if (await btn.count() > 0) await btn.click({ timeout: 4000 }).catch(() => {});
  await sleep(4000);
  const bodyText = (await p.evaluate(() => document.body.innerText).catch(() => '')).replace(/\s+/g, ' ').slice(0, 400);
  const stillLogin = (await p.locator('input[type="password"]').count()) > 0;
  await p.screenshot({ path: path.join(OUT, `iad_try${tag}.png`) });
  console.log(`IAD try ${tag} (email=${email}, overwritePw=${overwritePw}): stillLogin=${stillLogin} title=${await p.title().catch(()=>null)}`);
  console.log(`  bodyText: ${bodyText}`);
  await ctx.close();
}
await b.close();
