// Capture Hazard Intelligence sub-views for the drill-down page.
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const OUT = path.resolve('captures/hazard');
fs.mkdirSync(OUT, { recursive: true });
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
async function shot(p,name){ await p.screenshot({path:path.join(OUT,name+'.png')}); console.log('shot',name); }

// ---------- ADMIN (hazardintel) — persistent top nav, easy to drive ----------
{
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto('https://hazardintel.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(2500); await gate(p); await sleep(6000);
  await shot(p,'admin_dashboard');
  for(const tab of ['GENERATION','ALERTS','DISTRIBUTION','HISTORY','GRID','FLOODING']){
    const btn=p.getByRole('button',{name:tab,exact:true}).first();
    if(await btn.count()===0){ console.log('no tab',tab); continue; }
    await btn.click({timeout:4000}).catch(()=>{}); await sleep(4500);
    await shot(p,'admin_'+tab.toLowerCase().replace(/\s+/g,'_'));
  }
  await ctx.close();
}

// ---------- DASHBOARD (inteldash) — situational view + briefing PDF ----------
{
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto('https://inteldash.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(2500); await gate(p); await sleep(2000);
  const enter=p.getByRole('button',{name:/enter dashboard/i}).first();
  if(await enter.count()>0){ await enter.click().catch(()=>{}); await sleep(2000); }
  await sleep(9000);
  await shot(p,'dashboard');

  // Grab the Morning Daily Briefing PDF (fresh presigned URL) and save bytes
  try{
    const href=await p.locator('a[href*="briefing.pdf"], a:has-text("Morning Daily Briefing")').first().getAttribute('href');
    if(href){ const resp=await p.request.get(href); const buf=await resp.body(); fs.writeFileSync(path.join(OUT,'briefing.pdf'),buf); console.log('saved briefing.pdf',buf.length,'bytes'); }
    else console.log('no briefing href');
  }catch(e){ console.log('pdf fetch err',e.message.slice(0,80)); }

  // Click into a few dashboard category views, back between each
  const cats=[['Real-Time Hazard Alerts','alerts'],['Power Grid','grid_view'],['Street Flooding','flooding_view'],['Air Quality','air_quality']];
  for(const [label,fname] of cats){
    try{
      const el=p.getByText(label,{exact:false}).first();
      await el.click({timeout:4000}); await sleep(5000);
      await shot(p,'view_'+fname);
      await p.goBack({waitUntil:'domcontentloaded',timeout:15000}).catch(()=>{});
      await sleep(3500);
    }catch(e){ console.log('cat',label,'err',e.message.slice(0,60)); }
  }
  await ctx.close();
}
await b.close();
console.log('DONE. files:', fs.readdirSync(OUT).join(', '));
