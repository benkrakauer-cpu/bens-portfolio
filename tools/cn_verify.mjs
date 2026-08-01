import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: EXE, args:['--no-sandbox'] });
// home
const h=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await h.goto('http://127.0.0.1:8099/index.html',{waitUntil:'networkidle'});
console.log('home link tiles:', await h.locator('a.tile-link').count(), '| last kicker:', await h.locator('.tile-kicker').last().textContent());
// detail
const p=await (await b.newContext({viewport:{width:1440,height:1200},deviceScaleFactor:1})).newPage();
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
const r=await p.goto('http://127.0.0.1:8099/callnotes.html',{waitUntil:'networkidle'});
await p.evaluate(async()=>{for(let y=0;y<9000;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50));}window.scrollTo(0,0);});
const imgs=await p.$$eval('.subtile-view img',a=>a.map(i=>i.naturalWidth));
await p.locator('.subtile-view').first().click(); await p.waitForTimeout(400);
const lbOpen = await p.locator('#lb').getAttribute('hidden')===null;
await p.screenshot({path:'captures/callnotes_page.png',fullPage:true});
console.log('callnotes.html http',r.status(),'tiles',await p.locator('.subtile').count(),'imgs',imgs.filter(w=>w>0).length+'/'+imgs.length,'lightbox',lbOpen,'err',errs.length);
await b.close();
