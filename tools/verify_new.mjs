import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const OUT=path.resolve('captures/_verify'); fs.mkdirSync(OUT,{recursive:true});
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
const p=await (await b.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1.25})).newPage();
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text());}); p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
for(const [url,name,full] of [
  ['http://127.0.0.1:8123/index.html','index',true],
  ['http://127.0.0.1:8123/quicklook.html','quicklook',false],
  ['http://127.0.0.1:8123/callnotes.html','callnotes',false],
]){
  await p.goto(url,{waitUntil:'networkidle'}); await sleep(600);
  await p.screenshot({path:path.join(OUT,name+'.png'),fullPage:full});
  // count broken images
  const imgs=await p.$$eval('img',els=>els.map(e=>({src:e.getAttribute('src'),ok:e.complete&&e.naturalWidth>0})));
  const broken=imgs.filter(i=>!i.ok);
  console.log(`${name}: ${imgs.length} imgs, ${broken.length} broken`, broken.slice(0,6).map(b=>b.src));
}
// lightbox test on quicklook
await p.goto('http://127.0.0.1:8123/quicklook.html',{waitUntil:'networkidle'}); await sleep(400);
await p.locator('.subtile-view').first().click(); await sleep(500);
const lbOpen=await p.locator('#lb').isVisible();
const dlVisible=await p.locator('.lb-download').isVisible();
console.log('lightbox open=',lbOpen,'download btn visible on non-pdf=',dlVisible);
await p.screenshot({path:path.join(OUT,'lightbox.png')});
console.log('console errors:',errs.length?errs:'none');
await b.close();
console.log('done');
