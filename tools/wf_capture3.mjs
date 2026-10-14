// Expense report scrolled to the itemized claim.
import { chromium } from 'playwright';
import path from 'path';
const S=process.argv[2];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/workflows');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox',`--proxy-server=${process.env.HTTPS_PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const p=await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true,storageState:path.join(S,'wf_state.json')})).newPage();
await p.goto('https://workflows.benjaminkrakauer.com/expenses/requests/36bd614b-70d4-4233-bb1c-08f4e3d1bdf2',{waitUntil:'domcontentloaded'});
for(let i=0;i<20;i++){ if(!/Loading/.test(await p.evaluate(()=>document.body.innerText))) break; await sleep(1000); } await sleep(1500);
await p.getByText('What is claimed',{exact:true}).first().evaluate(el=>el.scrollIntoView({block:'start'}));
await p.evaluate(()=>window.scrollBy(0,-40)); await sleep(800);
await p.screenshot({path:path.join(OUT,'wf-expense-claim.png')}); console.log('shot wf-expense-claim');
await b.close();
