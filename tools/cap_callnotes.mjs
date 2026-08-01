import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const OUT=path.resolve('captures/callnotes'); fs.mkdirSync(OUT,{recursive:true});
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
async function gate(p){ const pw=p.locator('input[type="password"]').first(); if(await pw.count()>0){ await pw.click(); await pw.pressSequentially('NYCEM30',{delay:35}); const btn=p.locator('button:has-text("Sign"),button:has-text("Enter"),button:has-text("Continue"),button[type="submit"]').first(); if(await btn.count()>0) await btn.click({timeout:4000}).catch(()=>{}); else await pw.press('Enter'); await sleep(5000);} }
async function fresh(){ const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true}); const p=await ctx.newPage(); await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{}); await sleep(2500); await gate(p); await sleep(3000); return {ctx,p}; }
async function tap(p,t,to=4500){ try{ await p.getByText(t,{exact:false}).first().click({timeout:to}); return true;}catch{return false;} }

// setup form
{ const {ctx,p}=await fresh(); await p.screenshot({path:path.join(OUT,'01_setup.png')}); console.log('01_setup'); await ctx.close(); }
// nav screens (fresh each)
for(const [label,f] of [['Before your first call','02_help'],['Reports','03_reports'],['Diagnostics','04_diagnostics']]){
  const {ctx,p}=await fresh(); if(await tap(p,label)){ await sleep(3500); await p.screenshot({path:path.join(OUT,f+'.png')}); console.log(f);} else console.log('miss',label); await ctx.close();
}
// call flow → note-taking + document
{ const {ctx,p}=await fresh();
  try{ const name=p.getByPlaceholder(/name/i).first(); if(await name.count()>0) await name.fill('Ben Krakauer'); }catch(e){}
  await tap(p,'Heat (HESC)');
  await tap(p,'Test call');
  await sleep(600);
  if(await tap(p,'Start call')){ await sleep(5000); await p.screenshot({path:path.join(OUT,'05_call.png')}); console.log('05_call');
    // dump call-screen structure to find notes + document/preview
    console.log('CALL bodyText=', (await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,600));
    const nav=await p.$$eval('a,button,[role="tab"]',els=>[...new Set(els.map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<28))].slice(0,40));
    console.log('CALL nav=', JSON.stringify(nav));
    // try to open a preview / document / export
    for(const t of ['Preview','Document','Export','Download','PDF','Copy']){ if(await tap(p,t,2500)){ await sleep(3500); await p.screenshot({path:path.join(OUT,'06_document.png')}); console.log('06_document via',t); break; } }
  } else console.log('start call failed');
  await ctx.close();
}
await b.close();
console.log('done', fs.readdirSync(OUT).filter(f=>f.endsWith('.png')).length,'shots');
