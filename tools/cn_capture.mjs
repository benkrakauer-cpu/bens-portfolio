import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/callnotes'); fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
const shot=async n=>{ await p.screenshot({path:path.join(OUT,n+'.png')}); console.log('shot',n); };
async function auth(){
  await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(2500);
  const pw=p.locator('#p, input[type=password]').first();
  if(await pw.count()>0){ await pw.fill('NYCEM30'); await p.getByRole('button',{name:/enter/i}).first().click({timeout:5000}).catch(()=>{}); await sleep(5000); }
  await p.locator('input').first().fill('Ben Krakauer').catch(()=>{});
  await sleep(600);
}
await auth();
// --- Today landing ---
await shot('cn-today');
// --- Before your first call (primer) ---
await p.getByText('Before your first call',{exact:false}).first().click({timeout:5000}).catch(()=>{});
await sleep(2500); await shot('cn-primer');
await auth();
// --- New call setup ---
await p.getByRole('button',{name:/start a new call/i}).first().click({timeout:5000}).catch(()=>{});
await sleep(3000);
await p.getByText('Heat (HESC)',{exact:false}).first().click({timeout:4000}).catch(()=>{});
await sleep(1000);
await shot('cn-setup');
// start the call
await p.getByText('Start call',{exact:false}).first().click({timeout:5000}).catch(()=>{});
await sleep(4500);
// --- Choose how to take notes (live vs transcript) ---
await shot('cn-choose');
// --- live capture front matter ---
await p.getByText('Capture the call live',{exact:false}).first().click({timeout:5000}).catch(()=>{});
await sleep(4000);
await shot('cn-frontmatter');
// --- an agency card: go to Agencies, open FDNY ---
await p.getByText('Agencies',{exact:false}).first().click({timeout:5000}).catch(()=>{});
await sleep(2500);
// click a section or agency to open a card
await p.getByText('FDNY',{exact:true}).first().click({timeout:4000}).catch(async()=>{ await p.getByText('NYPD',{exact:true}).first().click({timeout:4000}).catch(()=>{}); });
await sleep(2500);
await shot('cn-agency-card');
// --- Preview ---
await p.getByText('Preview',{exact:false}).first().click({timeout:5000}).catch(()=>{});
await sleep(3000);
await shot('cn-preview');
// --- Review & export ---
await p.getByText('Review & export',{exact:false}).first().click({timeout:5000}).catch(()=>{});
await sleep(3000);
await shot('cn-export');
// --- Transcript import ---
await p.getByText('Transcript',{exact:false}).first().click({timeout:5000}).catch(()=>{});
await sleep(3000);
await shot('cn-transcript');
// --- Diagnostics ---
await p.getByText('Diagnostics',{exact:false}).first().click({timeout:5000}).catch(()=>{});
await sleep(2000);
await shot('cn-diagnostics');
await ctx.close(); await b.close();
console.log('done');
