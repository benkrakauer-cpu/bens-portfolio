import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: EXE, args:['--no-sandbox'] });
const p = await (await b.newContext({viewport:{width:1440,height:1200},deviceScaleFactor:1.4})).newPage();
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
await p.goto('http://127.0.0.1:8099/hazard-intelligence.html',{waitUntil:'networkidle'});
const subtiles = await p.locator('.subtile').count();
const imgs = await p.$$eval('.subtile-view img', a=>a.map(i=>i.naturalWidth));
await p.screenshot({ path:'captures/detail_page.png', fullPage:true });
// open lightbox on the PDF tile (has data-pdf)
await p.locator('.subtile-view[data-pdf]').click();
await p.waitForTimeout(500);
const lbVisible = !(await p.locator('#lb').getAttribute('hidden').catch(()=>null) !== null);
const dlVisible = await p.locator('.lb-download').isVisible();
const cap = await p.locator('.lb-caption').textContent();
await p.screenshot({ path:'captures/detail_lightbox.png' });
// esc closes
await p.keyboard.press('Escape'); await p.waitForTimeout(300);
const lbHiddenAfter = await p.locator('#lb').getAttribute('hidden');
console.log('subtiles=',subtiles,'| imgs=',imgs.join(','));
console.log('lightbox opened=',lbVisible,'| pdf download shown=',dlVisible,'| caption=',JSON.stringify(cap),'| closed after Esc=',lbHiddenAfter!==null);
console.log('errors=',errs.length?errs:'none');
// check home tile CTA
const p2 = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p2.goto('http://127.0.0.1:8099/index.html',{waitUntil:'networkidle'});
await p2.locator('#tab-7').click(); await p2.waitForTimeout(500);
const cta = await p2.locator('.tile-explore a').getAttribute('href');
console.log('home Hazard CTA href=',cta);
await b.close();
