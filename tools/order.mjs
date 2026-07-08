import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: EXE, args:['--no-sandbox'] });
const p = await (await b.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1.5})).newPage();
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
await p.goto('http://127.0.0.1:8099/index.html',{waitUntil:'networkidle'});
const order = await p.$$eval('.tile-kicker', els=>els.map(e=>e.textContent));
// verify each tile's aria-controls matches a panel and expansion still works on the moved-id tile
await p.locator('.tile-toggle').nth(0).click(); await p.waitForTimeout(500);
const firstExpanded = await p.locator('.tile-toggle').nth(0).getAttribute('aria-expanded');
const imgs = await p.$$eval('img', a=>a.map(i=>i.naturalWidth));
await p.screenshot({ path:'captures/site_reordered.png', fullPage:true });
console.log('order:', order.join(' | '));
console.log('firstExpanded=',firstExpanded,'| imgs=',imgs.join(','),'| errors=',errs.length?errs:'none');
await b.close();
