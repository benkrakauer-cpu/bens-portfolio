import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: EXE, args:['--no-sandbox'] });
const p = await (await b.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1.4})).newPage();
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
await p.goto('http://127.0.0.1:8099/index.html',{waitUntil:'networkidle'});
const linkTiles = await p.locator('a.tile-link').count();
const accTiles = await p.locator('button.tile-toggle').count();
const hazardHref = await p.locator('a.tile-link').first().getAttribute('href');
// click hazard tile -> should navigate to detail page
await p.locator('a.tile-link').first().click();
await p.waitForLoadState('networkidle');
const url = p.url();
await b.close();
console.log('linkTiles=',linkTiles,'accordionTiles=',accTiles,'hazardHref=',hazardHref);
console.log('after click url=',url.split('/').pop());
console.log('errors=',errs.length?errs:'none');
