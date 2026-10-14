// Sign in to Workflows with an emailed one-time code. Requests the code, then
// waits for the code to be written to <scratch>/wf_code.txt, submits it, and
// saves the signed-in session (storageState) for the capture scripts.
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const S=process.argv[2]; const EMAIL=process.argv[3];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/_probe/wf');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox',`--proxy-server=${process.env.HTTPS_PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:900},ignoreHTTPSErrors:true});
const p=await ctx.newPage();
await p.goto('https://workflows.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}); await sleep(3000);
await p.locator('input[type=email]').fill(EMAIL);
await p.getByRole('button',{name:/email me a code/i}).click(); await sleep(5000);
console.log('AFTER REQUEST:', (await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,600));
console.log('INPUTS:', JSON.stringify(await p.$$eval('input',e=>e.map(i=>i.type+':'+(i.autocomplete||'')+':'+(i.placeholder||'')+':'+(i.maxLength)))));
await p.screenshot({path:path.join(OUT,'02_code_entry.png')});
console.log('WAITING for code file...');
let code='';
for(let i=0;i<360 && !code;i++){ await sleep(5000); try{ code=fs.readFileSync(path.join(S,'wf_code.txt'),'utf8').trim(); }catch{} }
if(!code){ console.log('TIMEOUT no code'); await b.close(); process.exit(1); }
const inputs=p.locator('input:not([type=hidden]):not([type=email])');
const n=await inputs.count();
if(n>1){ await inputs.first().click(); await p.keyboard.type(code,{delay:80}); }
else { await inputs.first().fill(code); }
await sleep(800);
const btn=p.getByRole('button',{name:/verify|sign in|continue|submit/i}).first();
if(await btn.count()) await btn.click().catch(()=>{}); else await p.keyboard.press('Enter');
await sleep(6000);
const body=(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ');
console.log('AFTER CODE:', body.slice(0,1500));
console.log('CTRLS:', JSON.stringify([...new Set(await p.$$eval('a,button,[role=tab]',e=>e.map(x=>(x.innerText||'').replace(/\s+/g,' ').trim()+(x.getAttribute('href')?' ->'+x.getAttribute('href'):'')).filter(t=>t&&t.length<70)))].slice(0,80)));
await p.screenshot({path:path.join(OUT,'03_after_login.png')});
await ctx.storageState({path:path.join(S,'wf_state.json')});
console.log('STATE SAVED');
await b.close();
