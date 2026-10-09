import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/_probe/ql'); fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
async function dump(label){
  console.log(`\n--- ${label} --- url=${p.url()}`);
  const body=(await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,900);
  console.log('body:',body);
  const nav=await p.$$eval('a,button',els=>[...new Set(els.map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<45))].slice(0,45));
  console.log('ctrls:',JSON.stringify(nav));
  await p.screenshot({path:path.join(OUT,label+'.png')});
}
await p.goto('https://quicklook.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
await p.locator('#name').fill('Ben Krakauer');
await p.locator('#password').fill('NYCEM30');
await p.getByRole('button',{name:/sign in/i}).first().click().catch(()=>{});
await sleep(6000);
await dump('00_home');
// Open the inbox
await p.getByRole('button',{name:/inbox/i}).first().click({timeout:5000}).catch(async()=>{ await p.getByText(/inbox/i).first().click({timeout:5000}).catch(()=>{}); });
await sleep(4000); await dump('01_inbox');
// back home
await p.goto('https://quicklook.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{}); await sleep(3500);
// Open existing draft
await p.getByText('Open',{exact:true}).first().click({timeout:5000}).catch(async()=>{ await p.getByText('Testing 1-2-3',{exact:false}).first().click({timeout:5000}).catch(()=>{}); });
await sleep(5000); await dump('02_draft_open');
// Scroll through draft
await p.evaluate(()=>window.scrollTo(0,700)); await sleep(1500); await dump('03_draft_mid');
await p.evaluate(()=>window.scrollTo(0,1600)); await sleep(1500); await dump('04_draft_lower');
// New summary flow
await p.goto('https://quicklook.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{}); await sleep(3500);
await p.getByRole('button',{name:/new summary/i}).first().click({timeout:5000}).catch(()=>{});
await sleep(4500); await dump('05_new_summary');
await ctx.close(); await b.close();
console.log('\ndone');
