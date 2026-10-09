import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/callnotes'); fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:2,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
const shot=async n=>{ await p.screenshot({path:path.join(OUT,n+'.png')}); console.log('shot',n); };
const click=async (t,exact=false)=>{ try{ await p.getByText(t,{exact}).first().click({timeout:3500}); return true;}catch{ return false; } };
await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
const pw=p.locator('#p, input[type=password]').first();
if(await pw.count()>0){ await pw.fill('NYCEM30'); await p.getByRole('button',{name:/enter/i}).first().click({timeout:5000}).catch(()=>{}); await sleep(5000); }
await p.locator('input').first().fill('Ben Krakauer').catch(()=>{});
await sleep(600);
await p.getByRole('button',{name:/start a new call/i}).first().click({timeout:5000}).catch(()=>{});
await sleep(3000);
await click('Heat (HESC)'); await sleep(900);
await click('Start call'); await sleep(4500);
await click('Capture the call live'); await sleep(4000);
// Front matter: plans + EOC
await click('Heat Emergency Plan'); await sleep(500);
await click('Air Quality Emergency Guide'); await sleep(500);
await click('Partial'); await sleep(600);
await shot('cn-frontmatter');
// Go to FDNY card and answer some prompts
await click('Agencies'); await sleep(2000);
await p.getByText('FDNY',{exact:true}).first().click({timeout:4000}).catch(()=>{});
await sleep(2000);
// answer a few
await click('Yes'); await sleep(400);              // Distributing spray caps?
await click('All normal'); await sleep(400);        // EMS call volume
// NYC Health card too
await p.getByText('NYC Health',{exact:true}).first().click({timeout:4000}).catch(()=>{});
await sleep(1500);
await click('Yes'); await sleep(500);
// type a note
const note=p.locator('textarea').first();
if(await note.count()>0){ await note.fill('Cooling centers opened in all five boroughs; no heat-related fatalities reported this operational period.'); await sleep(600); }
// Preview (populated)
await click('Preview'); await sleep(3000);
await shot('cn-preview');
// Review & export (populated)
await click('Review & export'); await sleep(3000);
await shot('cn-export');
await ctx.close(); await b.close();
console.log('done');
