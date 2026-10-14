// Step 2 of the draft after the link read (pre-filled event details). Nothing is submitted.
import { chromium } from 'playwright';
import path from 'path';
const S=process.argv[2];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/workflows');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox',`--proxy-server=${process.env.HTTPS_PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const p=await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true,storageState:path.join(S,'wf_state.json')})).newPage();
const settle=async()=>{ for(let i=0;i<30;i++){ const t=await p.evaluate(()=>document.body.innerText); if(!/Loading/.test(t)) break; await sleep(1000);} await sleep(1500); };
await p.goto('https://workflows.benjaminkrakauer.com/travel/requests/8b93852b-05b0-4950-9220-8d6010d63a6c/step/1',{waitUntil:'domcontentloaded'}); await settle();
await p.getByRole('button',{name:/^continue$/i}).last().click().catch(e=>console.log('no continue',e.message.slice(0,60)));
await sleep(2500); await settle();
console.log((await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,1500));
await p.screenshot({path:path.join(OUT,'wf-wiz-filled.png')}); console.log('shot wf-wiz-filled');
await b.close();
