import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const DL=path.resolve('captures/_probe/ql/dl'); fs.mkdirSync(DL,{recursive:true});
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true,acceptDownloads:true});
const p=await ctx.newPage();
await p.goto('https://quicklook.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
await p.locator('#name').fill('Ben Krakauer');
await p.locator('#password').fill('NYCEM30');
await p.getByRole('button',{name:/sign in/i}).first().click().catch(()=>{});
await sleep(6000);
await p.getByText('Open',{exact:true}).first().click({timeout:5000}).catch(()=>{});
await sleep(5000);
// make sure we're on review
await p.getByText('Review sections',{exact:false}).first().click({timeout:5000}).catch(()=>{});
await sleep(3000);
// Export PDF
const [dl]=await Promise.all([
  p.waitForEvent('download',{timeout:30000}).catch(()=>null),
  p.getByRole('button',{name:/export pdf/i}).first().click({timeout:6000}).catch(()=>{}),
]);
if(dl){ const fp=path.join(DL,'quicklook-summary.pdf'); await dl.saveAs(fp); console.log('saved PDF:',fp, fs.statSync(fp).size,'bytes'); }
else console.log('no download event (maybe opened in tab)');
await sleep(2000);
await ctx.close(); await b.close();
console.log('done');
