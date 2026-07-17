// SnowCorps — worker app (mobile, Demo Mode) + admin (desktop, Demo Mode).
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const OUT=path.resolve('captures/snowcorps'); fs.mkdirSync(OUT,{recursive:true});
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
async function tapText(p,t,to=4000){ try{ await p.getByText(t,{exact:false}).first().click({timeout:to}); return true;}catch{ return false; } }

// WORKER (mobile)
{
  const ctx=await b.newContext({viewport:{width:430,height:932},deviceScaleFactor:2,isMobile:true,hasTouch:true,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto('https://snowcorps.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(3000); await tapText(p,'Demo Mode'); await sleep(5000);
  await p.screenshot({path:path.join(OUT,'w1_map.png')}); console.log('shot w1_map');
  // intersection detail via first "View"
  if(await tapText(p,'View')){ await sleep(3500); await p.screenshot({path:path.join(OUT,'w2_intersection.png')}); console.log('shot w2_intersection'); }
  for(const [lbl,f] of [['Assignments','w3_assignments'],['Earnings','w4_earnings'],['Profile','w5_profile']]){
    if(await tapText(p,lbl)){ await sleep(3500); await p.screenshot({path:path.join(OUT,f+'.png')}); console.log('shot',f); }
  }
  await ctx.close();
}
// ADMIN (desktop)
{
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto('https://admin.snowcorps.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(3000); await tapText(p,'Demo Mode'); await sleep(5000);
  await p.screenshot({path:path.join(OUT,'a1_dashboard.png')}); console.log('shot a1_dashboard');
  for(const [lbl,f] of [['Events','a2_events'],['Review Queue','a3_review'],['Workers','a4_workers'],['Intersections','a5_intersections'],['Payments','a6_payments'],['Audit Log','a7_audit']]){
    if(await tapText(p,lbl)){ await sleep(3500); await p.screenshot({path:path.join(OUT,f+'.png')}); console.log('shot',f); }
  }
  await ctx.close();
}
await b.close();
console.log('done', fs.readdirSync(OUT).filter(f=>f.endsWith('.png')).length,'shots');
