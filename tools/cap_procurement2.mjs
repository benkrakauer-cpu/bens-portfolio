import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const OUT=path.resolve('captures/procurement'); fs.mkdirSync(OUT,{recursive:true});
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
async function gate(p){ const pw=p.locator('input[type="password"]').first(); if(await pw.count()>0){ await pw.click(); await pw.pressSequentially('NYCEM30',{delay:30}); const btn=p.locator('button:has-text("Sign"),button:has-text("Enter"),button[type="submit"]').first(); if(await btn.count()>0) await btn.click({timeout:4000}).catch(()=>{}); else await pw.press('Enter'); await sleep(4000);} }
async function fresh(){ const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true}); const p=await ctx.newPage(); await p.goto('https://procurementagent.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{}); await sleep(2500); await gate(p); await sleep(3500); return {ctx,p}; }
async function tap(p,t,to=5000){ try{ await p.getByText(t,{exact:false}).first().click({timeout:to}); return true;}catch{return false;} }

// each flow in a fresh session (reliable)
{ const {ctx,p}=await fresh(); await p.screenshot({path:path.join(OUT,'r01_home.png')}); console.log('r01_home'); await ctx.close(); }
for(const [label,fname] of [['Method Evaluator','r02_method'],['Search M/WBE Vendors','r03_mwbe'],['Search Prior Contracts','r04_contracts']]){
  const {ctx,p}=await fresh(); if(await tap(p,label)){ await sleep(4500); await p.screenshot({path:path.join(OUT,fname+'.png')}); console.log(fname);} else console.log('miss',label); await ctx.close();
}
// Build a Scope of Work flow
{ const {ctx,p}=await fresh();
  if(await tap(p,'Build a Scope of Work')){ await sleep(4000); await p.screenshot({path:path.join(OUT,'r05_sow_category.png')}); console.log('r05_sow_category');
    try{ const n=p.getByPlaceholder(/ESC backup|generators/i).first(); if(await n.count()>0) await n.fill('ESC backup generators — Emergency Fuel'); const ini=p.getByPlaceholder(/JD/i).first(); if(await ini.count()>0) await ini.fill('BK'); await sleep(500);}catch(e){}
    if(await tap(p,'Professional Services')){ await sleep(5000); await p.screenshot({path:path.join(OUT,'r06_sow_step.png')}); console.log('r06_sow_step');
      for(const [t,f] of [['Continue','r07_sow_next'],['Generate','r08_sow_generate']]){ if(await tap(p,t)){ await sleep(6000); await p.screenshot({path:path.join(OUT,f+'.png')}); console.log(f);} }
    }
  } await ctx.close();
}
// Emergency Procurement flow
{ const {ctx,p}=await fresh(); if(await tap(p,'Emergency Procurement')){ await sleep(4500); await p.screenshot({path:path.join(OUT,'r09_emergency.png')}); console.log('r09_emergency'); } await ctx.close(); }
// Solicit the Market flow
{ const {ctx,p}=await fresh(); if(await tap(p,'Solicit the Market')){ await sleep(4500); await p.screenshot({path:path.join(OUT,'r10_solicit.png')}); console.log('r10_solicit'); } await ctx.close(); }
await b.close();
console.log('done', fs.readdirSync(OUT).filter(f=>f.startsWith('r')).length,'r-shots');
