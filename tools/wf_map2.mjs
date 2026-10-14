// Second read-only pass: wait out "Loading…", open request details and admin pages.
import { chromium } from 'playwright';
import path from 'path';
const S=process.argv[2];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/_probe/wf');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox',`--proxy-server=${process.env.HTTPS_PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const p=await (await b.newContext({viewport:{width:1440,height:900},ignoreHTTPSErrors:true,storageState:path.join(S,'wf_state.json')})).newPage();
const settle=async()=>{ for(let i=0;i<20;i++){ const t=await p.evaluate(()=>document.body.innerText); if(!/Loading/.test(t)) break; await sleep(1000);} await sleep(1200); };
const dump=async (n,len=1400)=>{ await settle();
  console.log(`\n===== ${n} ===== ${p.url()}`);
  console.log((await p.evaluate(()=>(document.querySelector('main')||document.body).innerText)).replace(/\s+/g,' ').slice(0,len));
  const links=[...new Set(await p.$$eval('main a',e=>e.map(x=>(x.innerText||'').replace(/\s+/g,' ').trim()+' ->'+x.getAttribute('href')).filter(t=>t.length<90)))];
  if(links.length) console.log('LINKS:',JSON.stringify(links.slice(0,25)));
  await p.screenshot({path:path.join(OUT,n+'.png')}); };
const base='https://workflows.benjaminkrakauer.com';
const go=async u=>{ await p.goto(base+u,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{}); };
await go('/'); await dump('home');
await go('/my-approvals'); await dump('approvals');
await go('/travel/requests/7c8aa2d6-9336-4202-a35a-c4da6b07dd6d'); await dump('trv-detail',2200);
await go('/expenses/requests/36bd614b-70d4-4233-bb1c-08f4e3d1bdf2'); await dump('exp-detail',2000);
await go('/all-requests'); await settle();
const rows=await p.$$eval('main table tbody tr',r=>r.map(x=>x.innerText.replace(/\s+/g,' ').slice(0,200)));
console.log('\n===== all-requests rows =====\n'+rows.join('\n'));
const reqLinks=[...new Set(await p.$$eval('main a[href*="/requests/"], main a[href*="/reviews/"], main a[href*="/ts/"]',e=>e.map(x=>x.innerText.trim()+' ->'+x.getAttribute('href'))))];
console.log('REQ LINKS:',JSON.stringify(reqLinks.slice(0,40)));
for(const u of ['/admin/routing','/admin/settings','/admin/waiting','/admin/audit','/admin/emails','/admin/notices']){ await go(u); await dump('admin'+u.replace('/admin/','-'),1100); }
await go('/'); await settle(); await p.getByText('Switch to the Operations desk').click().catch(()=>{}); await dump('ops-desk',1800);
await b.close();
