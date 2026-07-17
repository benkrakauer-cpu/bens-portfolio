import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: EXE, args:['--no-sandbox'] });
const pages=['hazard-intelligence','iad','procurement','emergency-plan','document-translation','travelreceipt','snowcorps','onboarding'];
let allok=true;
for (const page of pages){
  const p = await (await b.newContext({viewport:{width:1440,height:1200},deviceScaleFactor:1})).newPage();
  const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  const resp=await p.goto('http://127.0.0.1:8099/'+page+'.html',{waitUntil:'networkidle'});
  await p.evaluate(async()=>{for(let y=0;y<12000;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50));}window.scrollTo(0,0);});
  const tiles=await p.locator('.subtile').count();
  const imgs=await p.$$eval('.subtile-view img',a=>a.map(i=>i.naturalWidth));
  const broken=imgs.filter(w=>!w).length;
  if(broken||errs.length||resp.status()!==200) allok=false;
  console.log(page.padEnd(22),'http',resp.status(),'tiles',tiles,'imgs',imgs.filter(w=>w>0).length+'/'+imgs.length,'err',errs.length);
  await p.close();
}
// home: 8 link tiles, click-through
const h=await (await b.newContext()).newPage();
await h.goto('http://127.0.0.1:8099/index.html',{waitUntil:'networkidle'});
console.log('HOME link tiles:',await h.locator('a.tile-link').count(),'accordions:',await h.locator('button.tile-toggle').count());
await b.close();
console.log(allok?'ALL OK':'ISSUES');
