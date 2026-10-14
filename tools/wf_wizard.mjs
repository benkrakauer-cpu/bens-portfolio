// Read-only look at the travel request wizard steps of an existing draft (nothing is submitted).
import { chromium } from 'playwright';
import path from 'path';
const S=process.argv[2];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/_probe/wf');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox',`--proxy-server=${process.env.HTTPS_PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const p=await (await b.newContext({viewport:{width:1440,height:900},ignoreHTTPSErrors:true,storageState:path.join(S,'wf_state.json')})).newPage();
const settle=async()=>{ for(let i=0;i<20;i++){ const t=await p.evaluate(()=>document.body.innerText); if(!/Loading/.test(t)) break; await sleep(1000);} await sleep(1200); };
const base='https://workflows.benjaminkrakauer.com/travel/requests/8b93852b-05b0-4950-9220-8d6010d63a6c/step/';
for(const s of [1,2,3,4,5,6]){
  await p.goto(base+s,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{}); await settle();
  console.log(`\n===== step ${s} ===== ${p.url()}`);
  console.log((await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,900));
  await p.screenshot({path:path.join(OUT,'wiz-step'+s+'.png')});
}
// the "Start a new request" entry point (just open it)
await p.goto('https://workflows.benjaminkrakauer.com/travel',{waitUntil:'domcontentloaded'}); await settle();
await p.getByRole('button',{name:/start a new request/i}).first().click().catch(()=>{}); await settle();
console.log('\n===== start new ===== '+p.url()+'\n'+(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,900));
await p.screenshot({path:path.join(OUT,'wiz-start.png')});
await b.close();
