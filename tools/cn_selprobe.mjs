import { chromium } from 'playwright';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox',`--proxy-server=${process.env.HTTPS_PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const p=await (await b.newContext({viewport:{width:1440,height:900},ignoreHTTPSErrors:true})).newPage();
const click=async (t,exact=false)=>{ try{ await p.getByText(t,{exact}).first().click({timeout:3500}); return true;}catch{ return false; } };
await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{}); await sleep(2500);
const pw=p.locator('#p, input[type=password]').first();
if(await pw.count()>0){ await pw.fill('NYCEM30'); await p.getByRole('button',{name:/enter/i}).first().click(); await sleep(5000); }
await p.locator('input').first().fill('Ben Krakauer'); await sleep(600);
// resume the call from the previous probe
await p.getByRole('button',{name:/start a new call/i}).first().click({timeout:5000}).catch(()=>{}); await sleep(3000);
await click('Heat (HESC)'); await sleep(500); await click('Test call',true); await sleep(500); await click('Start call'); await sleep(4000);
await click('Capture the call live'); await sleep(3500);
await click('Front matter & NYCEM'); await sleep(1500);
const dump=async lbl=>console.log(lbl, JSON.stringify(await p.evaluate(()=>{const b=document.querySelector('.block'); return {blk:b.className, btns:[...b.querySelectorAll('button')].map(x=>({t:x.innerText.trim(),cls:x.className,pressed:x.getAttribute('aria-pressed'),checked:x.getAttribute('aria-checked'),role:x.getAttribute('role')})), html:b.outerHTML.slice(0,900)};})));
await dump('BEFORE');
await p.locator('.block').first().locator('button').first().click(); await sleep(900);
await dump('AFTER');
await b.close();
