import { chromium } from 'playwright';
import path from 'path';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/_probe/wf');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox',`--proxy-server=${process.env.HTTPS_PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const p=await (await b.newContext({viewport:{width:1440,height:900},ignoreHTTPSErrors:true})).newPage();
const dump=async n=>{ console.log(`\n--- ${n} --- ${p.url()}`);
  console.log('inputs:',JSON.stringify(await p.$$eval('input,textarea,select',e=>e.map(i=>i.type+':'+(i.placeholder||i.name||i.id||'')))));
  console.log('body:',(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,1500));
  console.log('ctrls:',JSON.stringify([...new Set(await p.$$eval('a,button,[role=tab]',e=>e.map(x=>(x.innerText||'').replace(/\s+/g,' ').trim()+(x.getAttribute('href')?' ->'+x.getAttribute('href'):'')).filter(t=>t&&t.length<70)))].slice(0,80)));
  await p.screenshot({path:path.join(OUT,n+'.png')}); };
await p.goto('https://workflows.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{}); await sleep(3500);
await dump('00_landing');
const pw=p.locator('input[type=password]').first();
if(await pw.count()){
  const nm=p.locator('input[type=text], input[type=email]').first(); if(await nm.count()) await nm.fill('Ben Krakauer');
  await pw.fill('NYCEM30'); await pw.press('Enter'); await sleep(5000); await dump('01_after_gate');
}
await b.close();
