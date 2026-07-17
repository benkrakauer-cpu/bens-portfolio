// TravelReceipt + Document Translation — public screens (no gate).
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const OUT=path.resolve('captures/public'); fs.mkdirSync(OUT,{recursive:true});
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
async function tap(p,t,to=3000){ try{ await p.getByText(t,{exact:false}).first().click({timeout:to}); return true;}catch{return false;} }
async function shotFull(p,name){ await p.screenshot({path:path.join(OUT,name+'.png'),fullPage:true}); console.log('shot',name); }

// TravelReceipt
{
  const ctx=await b.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:2,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto('https://www.travelreceipt.com/',{waitUntil:'networkidle',timeout:45000}).catch(()=>{});
  await sleep(3000);
  await p.screenshot({path:path.join(OUT,'tr1_landing.png')}); console.log('shot tr1_landing');
  // pick a language + currency to show an active state
  await tap(p,'Spanish'); await sleep(600); await tap(p,'French'); await sleep(800);
  await p.screenshot({path:path.join(OUT,'tr2_selected.png')}); console.log('shot tr2_selected');
  await shotFull(p,'tr3_full'); // full page: how it works, pricing, faq
  await ctx.close();
}
// Document Translation
{
  const ctx=await b.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:2,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto('https://translate.benjaminkrakauer.com/',{waitUntil:'networkidle',timeout:45000}).catch(()=>{});
  await sleep(3000);
  await p.screenshot({path:path.join(OUT,'dt1_landing.png')}); console.log('shot dt1_landing');
  await tap(p,'Spanish'); await sleep(600); await tap(p,'Chinese'); await sleep(800);
  await p.screenshot({path:path.join(OUT,'dt2_selected.png')}); console.log('shot dt2_selected');
  await shotFull(p,'dt3_full');
  await ctx.close();
}
await b.close();
console.log('done', fs.readdirSync(OUT).filter(f=>f.endsWith('.png')).length,'shots');
