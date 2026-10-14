// Read-only tour of Workflows using the saved session: dump each page's text + links.
import { chromium } from 'playwright';
import path from 'path';
const S=process.argv[2];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/_probe/wf');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox',`--proxy-server=${process.env.HTTPS_PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const p=await (await b.newContext({viewport:{width:1440,height:900},ignoreHTTPSErrors:true,storageState:path.join(S,'wf_state.json')})).newPage();
const dump=async n=>{ await sleep(3500);
  console.log(`\n===== ${n} ===== ${p.url()}`);
  console.log((await p.evaluate(()=>(document.querySelector('main')||document.body).innerText)).replace(/\s+/g,' ').slice(0,1300));
  const links=[...new Set(await p.$$eval('main a, main button',e=>e.map(x=>(x.innerText||'').replace(/\s+/g,' ').trim()+(x.getAttribute('href')?' ->'+x.getAttribute('href'):'')).filter(t=>t&&t.length<80)))];
  console.log('LINKS:',JSON.stringify(links.slice(0,40)));
  await p.screenshot({path:path.join(OUT,n+'.png')}); };
const base='https://workflows.benjaminkrakauer.com';
for(const [n,u] of [['home','/'],['my-requests','/my-requests'],['my-approvals','/my-approvals'],['all-requests','/all-requests'],['dashboard','/dashboard'],['settings','/settings'],['admin','/admin']]){
  await p.goto(base+u,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{}); await dump(n);
}
await p.goto(base+'/',{waitUntil:'domcontentloaded'}); await sleep(2500);
await p.getByText('Switch to the Operations desk').click().catch(()=>{}); await dump('ops-desk');
await b.close();
