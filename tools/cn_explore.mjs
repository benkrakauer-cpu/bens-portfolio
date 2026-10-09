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
  const body=(await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,1000);
  console.log('body:',body);
  const nav=await p.$$eval('a,button',els=>[...new Set(els.map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<45))].slice(0,45));
  console.log('ctrls:',JSON.stringify(nav));
  await p.screenshot({path:path.join(OUT,label+'.png')});
}
async function gate(){
  const pw=p.locator('#p, input[type=password]').first();
  if(await pw.count()>0){ await pw.fill('NYCEM30'); await p.getByRole('button',{name:/enter/i}).first().click({timeout:5000}).catch(()=>{}); await sleep(5000); }
}
await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500); await gate();
// fill name
await p.locator('input').first().fill('Ben Krakauer').catch(()=>{});
await sleep(800);
await dump('00_today');
// explore top nav
for(const [name,label] of [['Before your first call','01_primer'],['Reports','02_reports'],['Report a problem','03_problem'],['Diagnostics','04_diag']]){
  await p.getByRole('link',{name}).first().click({timeout:5000}).catch(async()=>{ await p.getByText(name,{exact:false}).first().click({timeout:5000}).catch(()=>{}); });
  await sleep(3500); await dump(label);
  // go home
  await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{}); await sleep(2500); await gate(); await p.locator('input').first().fill('Ben Krakauer').catch(()=>{}); await sleep(500);
}
// start a new call
await p.getByRole('button',{name:/start a new call/i}).first().click({timeout:5000}).catch(()=>{});
await sleep(4000); await dump('05_startcall');
await ctx.close(); await b.close();
console.log('\ndone');
