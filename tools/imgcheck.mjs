import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: EXE, args:['--no-sandbox'] });
const m = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true });
const p = await m.newPage();
await p.goto('http://127.0.0.1:8099/index.html',{waitUntil:'networkidle'});
// scroll through page to trigger any lazy work, then wait for decode
for (let y=0; y<7000; y+=800){ await p.evaluate(_y=>window.scrollTo(0,_y), y); await p.waitForTimeout(120); }
await p.evaluate(()=>window.scrollTo(0,0));
const info = await p.$$eval('img', imgs => imgs.map(i => ({src:i.currentSrc.split('/').pop(), nw:i.naturalWidth, nh:i.naturalHeight, complete:i.complete})));
console.log(JSON.stringify(info,null,1));
await b.close();
