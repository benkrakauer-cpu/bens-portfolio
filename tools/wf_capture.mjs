// Capture Workflows screens (2x) using the saved session. Only change made:
// the existing empty travel draft reads an event page (stays a draft, never submitted).
import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const S=process.argv[2];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/workflows'); fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox',`--proxy-server=${process.env.HTTPS_PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const p=await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true,storageState:path.join(S,'wf_state.json')})).newPage();
const settle=async()=>{ for(let i=0;i<30;i++){ const t=await p.evaluate(()=>document.body.innerText); if(!/Loading|Reading/.test(t)) break; await sleep(1000);} await sleep(1500); };
const base='https://workflows.benjaminkrakauer.com';
const go=async u=>{ await p.goto(base+u,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{}); await settle(); };
const shot=async n=>{ await p.screenshot({path:path.join(OUT,n+'.png')}); console.log('shot',n); };
await go('/'); await shot('wf-home');
await go('/travel/requests/7c8aa2d6-9336-4202-a35a-c4da6b07dd6d'); await shot('wf-travel-route');
await go('/expenses/requests/36bd614b-70d4-4233-bb1c-08f4e3d1bdf2'); await shot('wf-expense');
await go('/all-requests'); await shot('wf-all-requests');
await go('/dashboard'); await shot('wf-dashboard');
await go('/admin/routing'); await shot('wf-admin-routing');
await go('/admin/settings'); await shot('wf-admin-rates');
await go('/admin/notices'); await shot('wf-admin-notices');
await go('/travel/new'); await shot('wf-who');
// wizard on the existing draft
const W='/travel/requests/8b93852b-05b0-4950-9220-8d6010d63a6c/step/';
await go(W+'1'); await shot('wf-wiz-start');
const link=p.getByLabel(/paste a link/i).first();
if(await link.count()){ await link.fill('https://nemaweb.org/forums/nema-annual-forum/'); }
else { await p.locator('input[type=url]').first().fill('https://nemaweb.org/forums/nema-annual-forum/').catch(()=>console.log('no link input')); }
await p.getByRole('button',{name:/read this page/i}).first().click().catch(e=>console.log('read click',e.message.slice(0,60)));
for(let i=0;i<90;i++){ await sleep(2000); const t=await p.evaluate(()=>document.body.innerText); if(/Check the event details/.test(t) || /could not|couldn.t|error/i.test(t)) break; }
await settle();
console.log('AFTER READ:', (await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,1500));
await shot('wf-wiz-details');
await b.close();
