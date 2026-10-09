import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/quicklook'); fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
async function dump(n){
  const body=(await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,700);
  console.log(`\n[${n}] ${p.url().split('#')[1]||''}\n  ${body}`);
  await p.screenshot({path:path.join(OUT,n+'.png')});
}
await p.goto('https://quicklook.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
await p.locator('#name').fill('Ben Krakauer');
await p.locator('#password').fill('NYCEM30');
await p.getByRole('button',{name:/sign in/i}).first().click().catch(()=>{});
await sleep(6000);
// home (drafts list)
await dump('ql-home');
// inbox
await p.getByRole('link',{name:/inbox/i}).first().click({timeout:5000}).catch(async()=>{ await p.getByText(/inbox/i).first().click({timeout:5000}).catch(()=>{}); });
await sleep(4000); await dump('ql-inbox');
// open draft
await p.goto('https://quicklook.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{}); await sleep(3500);
await p.getByText('Open',{exact:true}).first().click({timeout:5000}).catch(()=>{});
await sleep(5000);
for(const [step,n] of [['Event basics','ql-basics'],['Upload files','ql-upload'],['Analyze','ql-analyze'],['Follow-up questions','ql-questions'],['Review sections','ql-review'],['Reviewer comments','ql-comments']]){
  await p.getByText(step,{exact:false}).first().click({timeout:5000}).catch(()=>{});
  await sleep(3500); await dump(n);
}
// preview and export
await p.getByRole('button',{name:/preview and export/i}).first().click({timeout:5000}).catch(async()=>{ await p.getByText(/preview and export/i).first().click({timeout:5000}).catch(()=>{}); });
await sleep(4000); await dump('ql-preview');
await ctx.close(); await b.close();
console.log('\ndone');
