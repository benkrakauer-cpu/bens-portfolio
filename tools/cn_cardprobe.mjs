import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const p=await (await b.newContext({viewport:{width:1440,height:900},ignoreHTTPSErrors:true})).newPage();
const click=async (t,exact=false)=>{ try{ await p.getByText(t,{exact}).first().click({timeout:3500}); return true;}catch{ return false; } };
await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
const pw=p.locator('#p, input[type=password]').first();
if(await pw.count()>0){ await pw.fill('NYCEM30'); await p.getByRole('button',{name:/enter/i}).first().click({timeout:5000}).catch(()=>{}); await sleep(5000); }
await p.locator('input').first().fill('Ben Krakauer').catch(()=>{});
await sleep(600);
await p.getByRole('button',{name:/start a new call/i}).first().click({timeout:5000}).catch(()=>{});
await sleep(3000);
await click('Heat (HESC)'); await sleep(600); await click('Test call',true); await sleep(600);
await click('Start call'); await sleep(4000);
await click('Capture the call live'); await sleep(3500);
// structure of front matter blocks
const fm=await p.evaluate(()=>{
  const out=[]; document.querySelectorAll('*').forEach(el=>{
    if(el.children.length===0 && /^(REQUIRED|OPTIONAL)$/.test(el.textContent.trim())){
      let blk=el; for(let i=0;i<6 && blk.parentElement;i++){ blk=blk.parentElement; if(blk.querySelectorAll('button').length>0 && blk.querySelector('h3,h4,legend,[class*=title]')) break; }
      out.push({cls:blk.className, tag:blk.tagName, title:(blk.innerText||'').split('\n')[0].slice(0,60), btns:[...blk.querySelectorAll('button')].map(x=>x.innerText.trim()).slice(0,14), inputs:[...blk.querySelectorAll('input,textarea,select')].map(x=>x.type).slice(0,8)});
    }}); return out; });
console.log('FRONT MATTER BLOCKS', JSON.stringify(fm,null,0).slice(0,3000));
await click('Agencies'); await sleep(1500);
await p.getByText('FDNY',{exact:true}).first().click({timeout:4000}).catch(()=>{}); await sleep(1500);
const card=await p.evaluate(()=>{
  const out=[]; document.querySelectorAll('*').forEach(el=>{
    if(el.children.length===0 && /^(REQUIRED|OPTIONAL)$/.test(el.textContent.trim())){
      let blk=el; for(let i=0;i<6 && blk.parentElement;i++){ blk=blk.parentElement; if(blk.querySelectorAll('button').length>0) break; }
      out.push({cls:blk.className, title:(blk.innerText||'').split('\n')[0].slice(0,60), btns:[...blk.querySelectorAll('button')].map(x=>x.innerText.trim())});
    }}); return out; });
console.log('FDNY BLOCKS', JSON.stringify(card));
// agency list in rail
const rail=await p.evaluate(()=>[...document.querySelectorAll('nav a, aside a, aside button, nav button')].map(x=>x.innerText.trim()).filter(Boolean).slice(0,120));
console.log('RAIL', JSON.stringify(rail));
await b.close();
