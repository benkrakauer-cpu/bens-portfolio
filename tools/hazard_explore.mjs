// Explore Hazard Intelligence surfaces to enumerate sub-views before capturing.
import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b = await chromium.launch({ executablePath: EXE, args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2'] });

async function gate(page){
  const pw = page.locator('input[type="password"]').first();
  if(await pw.count()>0){ await pw.click(); await pw.pressSequentially('NYCEM30',{delay:30}); const btn=page.locator('button:has-text("Sign"),button:has-text("Enter"),button[type="submit"]').first(); if(await btn.count()>0) await btn.click({timeout:4000}).catch(()=>{}); else await pw.press('Enter'); await sleep(4000);}
}

for (const [name,url] of [['inteldash','https://inteldash.benjaminkrakauer.com/'],['hazardintel','https://hazardintel.benjaminkrakauer.com/']]){
  const ctx = await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:1, ignoreHTTPSErrors:true });
  const p = await ctx.newPage();
  await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(2500); await gate(p); await sleep(8000);
  // enumerate nav items and clickable "view/map/explore/library/open" affordances
  const links = await p.$$eval('a,button', els => els.map(e=>({
    t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40),
    href:e.getAttribute('href')||'',
    role:e.tagName.toLowerCase()
  })).filter(x=>x.t));
  console.log(`\n===== ${name} (${p.url()}) =====`);
  console.log('TITLE:', await p.title().catch(()=>null));
  const seen=new Set();
  for(const l of links){ const k=l.t+'|'+l.href; if(seen.has(k))continue; seen.add(k); if(l.t.length>0) console.log(`  [${l.role}] "${l.t}" ${l.href}`); }
  await ctx.close();
}
await b.close();
