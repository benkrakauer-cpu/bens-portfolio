// Emergency Plan Assistant — choose experience, multilingual/RTL, conversation.
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const OUT=path.resolve('captures/emergency'); fs.mkdirSync(OUT,{recursive:true});
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const URL='https://emergencyplanagent.benjaminkrakauer.com/';
async function gate(p){ const pw=p.locator('input[type="password"]').first(); if(await pw.count()>0){ await pw.fill('NYCEM30'); await pw.press('Enter').catch(()=>{}); await sleep(3500);} }
async function tap(p,t,to=5000){ try{ await p.getByText(t,{exact:false}).first().click({timeout:to}); return true;}catch{return false;} }

// English conversation flow
{
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto(URL,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(2500); await gate(p); await sleep(2500);
  await p.screenshot({path:path.join(OUT,'01_choose.png')}); console.log('shot 01_choose');
  await tap(p,'English'); await sleep(5000);
  await p.screenshot({path:path.join(OUT,'02_conversation.png')}); console.log('shot 02_conversation');
  await tap(p,'Yes'); await sleep(4000);
  // answer first free-text question if an input exists
  try{ const ta=p.locator('textarea, input[type="text"]').first(); if(await ta.count()>0){ await ta.fill('Two adults and one child in a 3rd-floor apartment in Queens.'); const send=p.locator('button[aria-label*="send" i], button:has-text("Send")').first(); if(await send.count()>0) await send.click().catch(()=>{}); else await ta.press('Enter'); await sleep(6000);} }catch(e){ console.log('answer err',e.message.slice(0,40)); }
  await p.screenshot({path:path.join(OUT,'03_inprogress.png')}); console.log('shot 03_inprogress');
  await ctx.close();
}
// Multilingual + RTL
{
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto(URL,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(2500); await gate(p); await sleep(2500);
  await tap(p,'Multilingual'); await sleep(5000);
  await p.screenshot({path:path.join(OUT,'04_multilingual.png')}); console.log('shot 04_multilingual');
  // pick Arabic to show RTL, if offered
  for(const lang of ['العربية','Arabic','اردو','Urdu','עברית','Hebrew']){ if(await tap(p,lang,2500)){ await sleep(5000); await p.screenshot({path:path.join(OUT,'05_rtl.png')}); console.log('shot 05_rtl',lang); break; } }
  await ctx.close();
}
await b.close();
console.log('done', fs.readdirSync(OUT).filter(f=>f.endsWith('.png')).length,'shots');
