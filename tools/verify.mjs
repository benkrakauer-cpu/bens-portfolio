// Local render + accordion verification. Localhost bypasses the proxy.
import { chromium } from 'playwright';
import path from 'path';
const OUT = path.resolve('captures');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = 'http://127.0.0.1:8099/index.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });

// Desktop collapsed
const d = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
const p = await d.newPage();
const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(URL, { waitUntil: 'networkidle' });
await sleep(500);
await p.screenshot({ path: path.join(OUT, 'site_desktop.png'), fullPage: true });

// Expand tile 1 and check aria + focus semantics
const btn = p.locator('#tab-1');
await btn.click();
await sleep(600);
const expanded = await btn.getAttribute('aria-expanded');
const panelInert = await p.locator('#panel-1').getAttribute('inert');
const panel4Inert = await p.locator('#panel-4').getAttribute('inert');
// Link focusability when collapsed vs expanded
const linkVisibleInOpen = await p.locator('#panel-1 a').first().isVisible();
await p.screenshot({ path: path.join(OUT, 'site_expanded.png'), fullPage: true });
console.log('tile1 aria-expanded=', expanded, '| panel1 inert=', panelInert, '| panel4 inert=', panel4Inert, '| open link visible=', linkVisibleInOpen);
console.log('console errors:', errs.length ? errs : 'none');
await d.close();

// Mobile
const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
const pm = await m.newPage();
await pm.goto(URL, { waitUntil: 'networkidle' });
await sleep(400);
await pm.locator('#tab-2').click();
await sleep(500);
await pm.screenshot({ path: path.join(OUT, 'site_mobile.png'), fullPage: true });
await m.close();

await b.close();
console.log('done');
