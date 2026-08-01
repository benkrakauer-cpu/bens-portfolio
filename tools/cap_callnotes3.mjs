import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const OUT=path.resolve('captures/callnotes'); fs.mkdirSync(OUT,{recursive:true});
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
async function gate(p){ const pw=p.locator('input[type="password"]').first(); if(await pw.count()>0){ await pw.click(); await pw.pressSequentially('NYCEM30',{delay:35}); const btn=p.locator('button:has-text("Sign"),button:has-text("Enter"),button:has-text("Continue"),button[type="submit"]').first(); if(await btn.count()>0) await btn.click({timeout:4000}).catch(()=>{}); else await pw.press('Enter'); await sleep(5000);} }
async function tap(p,t,to=3500){ try{ await p.getByRole('button',{name:t,exact:false}).first().click({timeout:to}); return true;}catch{} try{ await p.getByText(t,{exact:false}).first().click({timeout:to}); return true;}catch{return false;} }
const ctx=await b.newContext({viewport:{width:1440,height:1400},deviceScaleFactor:2,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500); await gate(p); await sleep(3000);
await p.getByPlaceholder('Jane Doe').first().fill('Ben Krakauer');
await tap(p,'Heat (HESC)'); await tap(p,'Test call'); await sleep(500);
await tap(p,'Start call',6000); await sleep(6000);
// scroll to agencies section
await p.evaluate(()=>window.scrollTo(0,1200)); await sleep(800); await p.screenshot({path:path.join(OUT,'07_agencies.png')}); console.log('07_agencies');
await p.evaluate(()=>window.scrollTo(0,0)); await sleep(400);
for(const [t,f] of [['Front matter','08_frontmatter'],['Review & export','09_export'],['Reconcile','10_reconcile']]){
  if(await tap(p,t)){ await sleep(3500); await p.screenshot({path:path.join(OUT,f+'.png')}); console.log(f);
    // on export, grab any pdf link
    if(t.includes('export')){ try{ const href=await p.locator('a[href*=".pdf"], a[download]').first().getAttribute('href',{timeout:2500}); if(href){ const r=await p.request.get(href.startsWith('http')?href:new URL(href,p.url()).href); fs.writeFileSync(path.join(OUT,'callnotes-doc.pdf'), await r.body()); console.log('saved pdf'); } }catch(e){ console.log('no pdf',e.message.slice(0,40)); } }
  } else console.log('miss',t);
}
await b.close(); console.log('done');
