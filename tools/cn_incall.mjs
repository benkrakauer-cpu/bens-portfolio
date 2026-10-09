import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/_probe/cn'); fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
async function dump(label){
  console.log(`\n--- ${label} --- url=${p.url()}`);
  const body=(await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,1100);
  console.log('body:',body);
  const nav=await p.$$eval('a,button,[role=tab]',els=>[...new Set(els.map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<40))].slice(0,55));
  console.log('ctrls:',JSON.stringify(nav));
  await p.screenshot({path:path.join(OUT,label+'.png')});
}
await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
const pw=p.locator('#p, input[type=password]').first();
if(await pw.count()>0){ await pw.fill('NYCEM30'); await p.getByRole('button',{name:/enter/i}).first().click({timeout:5000}).catch(()=>{}); await sleep(5000); }
await p.locator('input').first().fill('Ben Krakauer').catch(()=>{});
await sleep(800);
await p.getByRole('button',{name:/start a new call/i}).first().click({timeout:5000}).catch(()=>{});
await sleep(3500);
// choose Heat form (richest prompts)
await p.getByText('Heat (HESC)',{exact:false}).first().click({timeout:4000}).catch(()=>{});
await sleep(1200);
await p.getByRole('button',{name:/^start call$/i}).first().click({timeout:5000}).catch(async()=>{ await p.getByText('Start call',{exact:false}).first().click({timeout:5000}).catch(()=>{}); });
await sleep(5000);
await dump('incall_00_landing');
// enumerate in-call tabs/sections
const tabs=await p.$$eval('a,button,[role=tab]',els=>[...new Set(els.map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<40))]);
console.log('\nALL IN-CALL CONTROLS:',JSON.stringify(tabs));
await ctx.close(); await b.close();
console.log('\ndone');
