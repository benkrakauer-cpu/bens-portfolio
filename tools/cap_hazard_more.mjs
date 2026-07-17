// Hazard Intelligence — additional admin tabs, grid PDF, and dashboard categories.
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const OUT=path.resolve('captures/hazard'); fs.mkdirSync(OUT,{recursive:true});
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
async function gate(p){ const pw=p.locator('input[type="password"]').first(); if(await pw.count()>0){ await pw.click(); await pw.pressSequentially('NYCEM30',{delay:30}); const btn=p.locator('button:has-text("Sign"),button:has-text("Enter"),button[type="submit"]').first(); if(await btn.count()>0) await btn.click({timeout:4000}).catch(()=>{}); else await pw.press('Enter'); await sleep(3500);} }
async function clickBtn(p,text){ const btns=await p.$$('button'); for(const btn of btns){ const t=((await btn.innerText().catch(()=>''))||'').trim(); if(t.toUpperCase()===text.toUpperCase()){ await btn.click({timeout:4000}).catch(()=>{}); return true; } } return false; }

// ADMIN extra tabs + grid PDF
{
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto('https://hazardintel.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(2500); await gate(p); await sleep(6000);
  for(const tab of ['CITYWIDE IMPACT','TRAVEL TIMES','CLIMATE RECORDS','SETTINGS']){
    if(await clickBtn(p,tab)){ await sleep(4500); await p.screenshot({path:path.join(OUT,'admin_'+tab.toLowerCase().replace(/\s+/g,'_')+'.png')}); console.log('shot admin_'+tab.toLowerCase().replace(/\s+/g,'_')); }
    else console.log('no tab',tab);
  }
  // grid report PDF
  if(await clickBtn(p,'GRID')){ await sleep(4000);
    try{ const href=await p.locator('a[href*=".pdf"]').first().getAttribute('href',{timeout:3000});
      if(href){ const r=await p.request.get(href); fs.writeFileSync(path.join(OUT,'grid-report.pdf'), await r.body()); console.log('saved grid-report.pdf'); } else console.log('no grid pdf href'); }catch(e){ console.log('grid pdf err',e.message.slice(0,50)); }
  }
  await ctx.close();
}
// DASHBOARD categories (fresh gate each)
for(const [label,fname] of [['Travel Times','view_travel'],['Air Quality','view_air']]){
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto('https://inteldash.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(2500); await gate(p); await sleep(2000);
  const enter=p.getByRole('button',{name:/enter dashboard/i}).first(); if(await enter.count()>0){ await enter.click().catch(()=>{}); await sleep(2000); }
  await sleep(8000);
  try{ await p.getByText(label,{exact:false}).first().click({timeout:5000}); await sleep(5000); await p.screenshot({path:path.join(OUT,fname+'.png')}); console.log('shot',fname); }catch(e){ console.log('cat',label,e.message.slice(0,40)); }
  await ctx.close();
}
await b.close();
console.log('done');
