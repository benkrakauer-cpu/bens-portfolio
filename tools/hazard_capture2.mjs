import { chromium } from 'playwright';
import path from 'path';
const OUT = path.resolve('captures/hazard');
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b = await chromium.launch({ executablePath: EXE, args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2'] });
async function gate(p){
  const pw=p.locator('input[type="password"]').first();
  if(await pw.count()>0){ await pw.click(); await pw.pressSequentially('NYCEM30',{delay:30});
    const btn=p.locator('button:has-text("Sign"),button:has-text("Enter"),button[type="submit"]').first();
    if(await btn.count()>0) await btn.click({timeout:4000}).catch(()=>{}); else await pw.press('Enter'); await sleep(3500);}
}
async function clickBtnByText(p,text){
  const btns=await p.$$('button');
  for(const btn of btns){ const t=((await btn.innerText().catch(()=>''))||'').trim(); if(t.toUpperCase()===text.toUpperCase()){ await btn.click({timeout:4000}).catch(()=>{}); return true; } }
  return false;
}

// ADMIN tabs
{
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto('https://hazardintel.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(2500); await gate(p); await sleep(6000);
  for(const tab of ['GENERATION','ALERTS','DISTRIBUTION','HISTORY','GRID']){
    const ok=await clickBtnByText(p,tab);
    if(!ok){ console.log('NOtab',tab); continue; }
    await sleep(4500);
    await p.screenshot({path:path.join(OUT,'admin_'+tab.toLowerCase()+'.png')});
    console.log('shot admin_'+tab.toLowerCase());
  }
  await ctx.close();
}
// DASHBOARD categories — fresh gate per category to avoid back-nav issues
for(const [label,fname] of [['Power Grid','grid_view'],['Street Flooding','flooding_view']]){
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto('https://inteldash.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(2500); await gate(p); await sleep(2000);
  const enter=p.getByRole('button',{name:/enter dashboard/i}).first();
  if(await enter.count()>0){ await enter.click().catch(()=>{}); await sleep(2000); }
  await sleep(8000);
  try{ await p.getByText(label,{exact:false}).first().click({timeout:5000}); await sleep(5500);
    await p.screenshot({path:path.join(OUT,'view_'+fname+'.png')}); console.log('shot view_'+fname);
  }catch(e){ console.log('cat',label,'err',e.message.slice(0,60)); }
  await ctx.close();
}
await b.close();
console.log('done');
