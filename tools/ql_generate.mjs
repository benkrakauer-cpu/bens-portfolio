import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/_probe/ql'); fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
await p.goto('https://quicklook.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
await p.locator('#name').fill('Ben Krakauer');
await p.locator('#password').fill('NYCEM30');
await p.getByRole('button',{name:/sign in/i}).first().click().catch(()=>{});
await sleep(6000);
await p.getByText('Open',{exact:true}).first().click({timeout:5000}).catch(()=>{});
await sleep(5000);
// go to Upload step
await p.getByText('Upload files',{exact:false}).first().click({timeout:5000}).catch(()=>{});
await sleep(2500);
// click Generate report
const gen=p.getByRole('button',{name:/generate report/i}).first();
console.log('generate btn count:', await gen.count());
await gen.click({timeout:6000}).catch(e=>console.log('gen click err',e.message.slice(0,80)));
await sleep(4000);
console.log('after click url:', p.url());
// poll analyze progress up to ~6 min
for(let i=0;i<36;i++){
  const body=(await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ');
  const m=body.match(/(\d+) timeline events found|Review sections|sections approved|Follow-up questions/);
  const snippet=body.slice(0,260);
  console.log(`[${i}] url=${p.url().split('#')[1]||''} :: ${snippet}`);
  if(/sections approved/.test(body) && !/0 of 5 sections approved\s*Versions/.test(body)){ /*drafted*/ }
  if(/Review sections/.test(body) && /Summary\s+Timeline\s+Key actions/.test(body)){ console.log('>>> draft appears ready'); break; }
  await sleep(10000);
}
await p.screenshot({path:path.join(OUT,'gen_state.png'),fullPage:false});
await ctx.close(); await b.close();
console.log('done');
