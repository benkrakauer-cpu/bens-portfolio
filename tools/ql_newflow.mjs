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
  const body=(await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,1100);
  console.log('body:',body);
  const nav=await p.$$eval('a,button,[role=tab]',els=>[...new Set(els.map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<45))].slice(0,50));
  console.log('ctrls:',JSON.stringify(nav));
  await p.screenshot({path:path.join(OUT,label+'.png')});
}
await p.goto('https://quicklook.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
await p.locator('#name').fill('Ben Krakauer');
await p.locator('#password').fill('NYCEM30');
await p.getByRole('button',{name:/sign in/i}).first().click().catch(()=>{});
await sleep(6000);
// New summary
await p.getByRole('button',{name:/new summary/i}).first().click({timeout:5000}).catch(()=>{});
await sleep(3500); await dump('n00_new');
// Open existing draft and walk the wizard steps by clicking the left rail
await p.goto('https://quicklook.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{}); await sleep(3500);
await p.getByText('Open',{exact:true}).first().click({timeout:5000}).catch(()=>{});
await sleep(5000);
for(const [step,label] of [['Event basics','w1_event_basics'],['Upload files','w2_upload'],['Analyze','w3_analyze'],['Follow-up questions','w4_followup'],['Reviewer comments','w6_reviewer']]){
  await p.getByText(step,{exact:false}).first().click({timeout:5000}).catch(()=>{});
  await sleep(3500); await dump(label);
}
// Preview and export
await p.getByRole('button',{name:/preview and export/i}).first().click({timeout:5000}).catch(async()=>{ await p.getByText(/preview and export/i).first().click({timeout:5000}).catch(()=>{}); });
await sleep(4000); await dump('w7_preview');
await ctx.close(); await b.close();
console.log('\ndone');
