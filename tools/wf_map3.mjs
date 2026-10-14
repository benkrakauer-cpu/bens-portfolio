// Third read-only pass: performance reviews, workflow landings, draft wizard, generated PDFs.
import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const S=process.argv[2];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/_probe/wf'); const DL=path.join(OUT,'dl'); fs.mkdirSync(DL,{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox',`--proxy-server=${process.env.HTTPS_PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const p=await (await b.newContext({viewport:{width:1440,height:900},ignoreHTTPSErrors:true,acceptDownloads:true,storageState:path.join(S,'wf_state.json')})).newPage();
const settle=async()=>{ for(let i=0;i<20;i++){ const t=await p.evaluate(()=>document.body.innerText); if(!/Loading/.test(t)) break; await sleep(1000);} await sleep(1200); };
const dump=async (n,len=1500)=>{ await settle();
  console.log(`\n===== ${n} ===== ${p.url()}`);
  console.log((await p.evaluate(()=>(document.querySelector('main')||document.body).innerText)).replace(/\s+/g,' ').slice(0,len));
  const links=[...new Set(await p.$$eval('main a, main button',e=>e.map(x=>(x.innerText||'').replace(/\s+/g,' ').trim()+(x.getAttribute('href')?' ->'+x.getAttribute('href'):'')).filter(t=>t&&t.length<90)))];
  if(links.length) console.log('LINKS:',JSON.stringify(links.slice(0,30)));
  await p.screenshot({path:path.join(OUT,n+'.png')}); };
const base='https://workflows.benjaminkrakauer.com';
const go=async u=>{ await p.goto(base+u,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{}); };
for(const u of ['/travel','/expenses','/performance']){ await go(u); await dump('landing'+u.replace('/','-')); }
// finished T&S request from My requests
await go('/my-requests'); await settle();
const prf=await p.$$eval('main a',e=>e.filter(x=>/PRF-FY26-0002|Tasks and Standards/.test(x.innerText)).map(x=>x.getAttribute('href')));
console.log('PRF links',prf);
if(prf[0]){ await go(prf[0]); await dump('prf-detail',2200); }
// draft wizard: "Continue your draft" (New request, step 2 of 6)
await go('/my-requests'); await settle();
await p.getByRole('link',{name:/continue your draft/i}).first().click().catch(async()=>{ await p.getByText(/continue your draft/i).first().click().catch(()=>{}); });
await dump('draft-wizard',1600);
// travel request: download the request summary PDF
await go('/travel/requests/7c8aa2d6-9336-4202-a35a-c4da6b07dd6d'); await settle();
const [d]=await Promise.all([p.waitForEvent('download',{timeout:20000}).catch(()=>null), p.getByRole('button',{name:/download request summary/i}).first().click().catch(()=>p.getByText(/Download Request summary/i).first().click().catch(()=>{}))]);
if(d){ const f=path.join(DL,'trv-summary-'+d.suggestedFilename()); await d.saveAs(f); console.log('\nDOWNLOADED',f,fs.statSync(f).size); } else console.log('no download for travel summary');
await b.close();
