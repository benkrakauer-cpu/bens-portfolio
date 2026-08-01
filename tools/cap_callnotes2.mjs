import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const OUT=path.resolve('captures/callnotes'); fs.mkdirSync(OUT,{recursive:true});
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
async function gate(p){ const pw=p.locator('input[type="password"]').first(); if(await pw.count()>0){ await pw.click(); await pw.pressSequentially('NYCEM30',{delay:35}); const btn=p.locator('button:has-text("Sign"),button:has-text("Enter"),button:has-text("Continue"),button[type="submit"]').first(); if(await btn.count()>0) await btn.click({timeout:4000}).catch(()=>{}); else await pw.press('Enter'); await sleep(5000);} }
async function tap(p,t,to=4000){ try{ await p.getByRole('button',{name:t,exact:false}).first().click({timeout:to}); return true;}catch{} try{ await p.getByText(t,{exact:false}).first().click({timeout:to}); return true;}catch{return false;} }
const ctx=await b.newContext({viewport:{width:1440,height:1400},deviceScaleFactor:2,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500); await gate(p); await sleep(3000);
await p.getByPlaceholder('Jane Doe').first().fill('Ben Krakauer');
await tap(p,'Heat (HESC)');
await tap(p,'Test call');
await sleep(600);
const started = await tap(p,'Start call',6000);
await sleep(6000);
await p.screenshot({path:path.join(OUT,'05_call.png'), fullPage:false}); console.log('05_call started=',started);
console.log('CALL bodyText=', (await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,800));
const nav=await p.$$eval('a,button,[role="tab"]',els=>[...new Set(els.map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<28))].slice(0,50));
console.log('CALL nav=', JSON.stringify(nav));
// try to reach a document/preview/copy view
for(const t of ['Preview','Document','Copy','Export','Finish','End call','Wrap','Save']){ if(await tap(p,t,2500)){ await sleep(3500); await p.screenshot({path:path.join(OUT,'06_'+t.toLowerCase().replace(/\s+/g,'')+'.png'),fullPage:false}); console.log('06 via',t); break; } }
await b.close();
console.log('done');
