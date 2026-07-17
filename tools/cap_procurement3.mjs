import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const OUT=path.resolve('captures/procurement'); fs.mkdirSync(OUT,{recursive:true});
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
async function gate(p){ const pw=p.locator('input[type="password"]').first(); if(await pw.count()>0){ await pw.click(); await pw.pressSequentially('NYCEM30',{delay:30}); const btn=p.locator('button:has-text("Sign"),button:has-text("Enter"),button[type="submit"]').first(); if(await btn.count()>0) await btn.click({timeout:4000}).catch(()=>{}); else await pw.press('Enter'); await sleep(4000);} }
async function fresh(){ const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true}); const p=await ctx.newPage(); await p.goto('https://procurementagent.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{}); await sleep(2500); await gate(p); await sleep(3500); return {ctx,p}; }
// click the Nth "card" containing a title by clicking a button/link within it
async function clickCard(p,title,action){
  const card=p.locator('div,article,section,button,a').filter({hasText:title}).last();
  // try an action button inside, else click the card
  const act=card.getByText(action,{exact:false}).first();
  if(await act.count()>0){ await act.click({timeout:4000}).catch(()=>{}); return true; }
  try{ await card.click({timeout:4000}); return true; }catch{ return false; }
}
async function tapExact(p,t,to=5000){ try{ await p.getByRole('heading',{name:t}).first().click({timeout:to}); return true;}catch{} try{ await p.getByText(t,{exact:false}).first().click({timeout:to}); return true;}catch{return false;} }

// Tools
for(const [title,fname] of [['Method Evaluator','r02_method'],['Search M/WBE Vendors','r03_mwbe'],['Search Prior Contracts','r04_contracts']]){
  const {ctx,p}=await fresh(); if(await tapExact(p,title)){ await sleep(4500); await p.screenshot({path:path.join(OUT,fname+'.png')}); console.log(fname);} else console.log('miss',title); await ctx.close();
}
// Build a Scope of Work — click "Start"
{ const {ctx,p}=await fresh();
  if(await clickCard(p,'Build a Scope of Work','Start')){ await sleep(4500); await p.screenshot({path:path.join(OUT,'r05_sow_category.png')}); console.log('r05_sow_category');
    try{ const n=p.getByPlaceholder(/generators|procurement/i).first(); if(await n.count()>0) await n.fill('ESC backup generators — Emergency Fuel'); const ini=p.getByPlaceholder(/JD/i).first(); if(await ini.count()>0) await ini.fill('BK'); await sleep(400);}catch(e){}
    if(await tapExact(p,'Professional Services')){ await sleep(5500); await p.screenshot({path:path.join(OUT,'r06_sow_step.png')}); console.log('r06_sow_step'); }
  } await ctx.close();
}
// Emergency Procurement — "Start now"
{ const {ctx,p}=await fresh(); if(await clickCard(p,'Emergency Procurement','Start now')){ await sleep(5000); await p.screenshot({path:path.join(OUT,'r09_emergency.png')}); console.log('r09_emergency'); } await ctx.close(); }
// Solicit the Market — "Choose"
{ const {ctx,p}=await fresh(); if(await clickCard(p,'Solicit the Market','Choose')){ await sleep(5000); await p.screenshot({path:path.join(OUT,'r10_solicit.png')}); console.log('r10_solicit'); } await ctx.close(); }
await b.close();
console.log('done');
