import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: EXE, args:['--no-sandbox'] });
for (const page of ['hazard-intelligence','iad','snowcorps']){
  const p = await (await b.newContext({viewport:{width:1440,height:1200},deviceScaleFactor:1})).newPage();
  const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('http://127.0.0.1:8099/'+page+'.html',{waitUntil:'networkidle'});
  await p.evaluate(async()=>{ for(let y=0;y<9000;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));} window.scrollTo(0,0); });
  const tiles = await p.locator('.subtile').count();
  const imgs = await p.$$eval('.subtile-view img', a=>a.map(i=>i.naturalWidth));
  const broken = imgs.filter(w=>!w||w===0).length;
  console.log(page, '| tiles=',tiles,'| imgsLoaded=',imgs.filter(w=>w>0).length+'/'+imgs.length,'| broken=',broken,'| errors=',errs.length?errs.slice(0,2):'none');
  await p.close();
}
await b.close();
