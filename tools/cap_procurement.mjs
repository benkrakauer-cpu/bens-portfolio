// Procurement Agent — capture the drafting workflow past NYCEM30.
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const OUT=path.resolve('captures/procurement'); fs.mkdirSync(OUT,{recursive:true});
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
async function shot(n){ await p.screenshot({path:path.join(OUT,n+'.png')}); console.log('shot',n); }
async function tap(t,to=4000){ try{ await p.getByText(t,{exact:false}).first().click({timeout:to}); return true;}catch{return false;} }
async function gate(){ const pw=p.locator('input[type="password"]').first(); if(await pw.count()>0){ await pw.click(); await pw.pressSequentially('NYCEM30',{delay:30}); const btn=p.locator('button:has-text("Sign"),button:has-text("Enter"),button[type="submit"]').first(); if(await btn.count()>0) await btn.click({timeout:4000}).catch(()=>{}); else await pw.press('Enter'); await sleep(4000);} }

await p.goto('https://procurementagent.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500); await gate(); await sleep(3000);
await shot('01_category');
// Home/sessions via "Back to home"
if(await tap('Back to home')){ await sleep(3500); await shot('00_home'); await tap('New'); await sleep(2500); }
// Name + initials, then pick a category
try{
  const name=p.getByPlaceholder(/ESC backup|procurement/i).first(); if(await name.count()>0) await name.fill('ESC backup generators — Emergency Fuel');
  const init=p.getByPlaceholder(/JD/i).first(); if(await init.count()>0) await init.fill('BK');
  await sleep(600); await shot('02_named');
}catch(e){ console.log('name err',e.message.slice(0,40)); }
if(await tap('Professional Services')){ await sleep(4500); await shot('03_professional_services'); }
// advance through subsequent primary steps
for(const [t,f] of [['Continue','04_step'],['Next','05_next'],['Generate','06_generate']]){
  if(await tap(t)){ await sleep(4500); await shot(f); }
}
await b.close();
console.log('done', fs.readdirSync(OUT).filter(f=>f.endsWith('.png')).length,'shots');
