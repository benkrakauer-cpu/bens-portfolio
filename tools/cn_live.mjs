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
  const body=(await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,1200);
  console.log('body:',body);
  const nav=await p.$$eval('a,button,[role=tab]',els=>[...new Set(els.map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<40))].slice(0,60));
  console.log('ctrls:',JSON.stringify(nav));
  await p.screenshot({path:path.join(OUT,label+'.png')});
}
await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
const pw=p.locator('#p, input[type=password]').first();
if(await pw.count()>0){ await pw.fill('NYCEM30'); await p.getByRole('button',{name:/enter/i}).first().click({timeout:5000}).catch(()=>{}); await sleep(5000); }
await p.locator('input').first().fill('Ben Krakauer').catch(()=>{});
await sleep(800);
// resume existing running call if present, else start a heat call
let resume=p.getByText(/resume|open call|HESC/i).first();
await p.getByRole('button',{name:/start a new call/i}).first().click({timeout:5000}).catch(()=>{});
await sleep(3000);
if(await p.getByText('Heat (HESC)',{exact:false}).count()>0){
  await p.getByText('Heat (HESC)',{exact:false}).first().click({timeout:4000}).catch(()=>{});
  await sleep(1000);
  await p.getByText('Start call',{exact:false}).first().click({timeout:5000}).catch(()=>{});
  await sleep(4500);
}
// choose live capture
await p.getByText('Capture the call live',{exact:false}).first().click({timeout:5000}).catch(async()=>{ await p.getByText('Skip to the agency cards',{exact:false}).first().click({timeout:5000}).catch(()=>{}); });
await sleep(4500);
await dump('live_00_frontmatter');
// enumerate agency list / cards nav
const items=await p.$$eval('a,button,[role=tab],[role=listitem]',els=>[...new Set(els.map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<40))]);
console.log('\nALL CONTROLS:',JSON.stringify(items));
// try scroll to see structure
await p.evaluate(()=>window.scrollTo(0,600)); await sleep(1200); await dump('live_01_scroll');
await ctx.close(); await b.close();
console.log('\ndone');
