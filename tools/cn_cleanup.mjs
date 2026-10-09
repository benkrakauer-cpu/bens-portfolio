import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
p.on('dialog',d=>d.accept().catch(()=>{}));
async function home(){
  await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(2500);
  const pw=p.locator('#p, input[type=password]').first();
  if(await pw.count()>0){ await pw.fill('NYCEM30'); await p.getByRole('button',{name:/enter/i}).first().click({timeout:5000}).catch(()=>{}); await sleep(5000); }
  await p.locator('input').first().fill('Ben Krakauer').catch(()=>{});
  await sleep(800);
}
await home();
await p.getByText('Show older calls',{exact:false}).first().click({timeout:3000}).catch(()=>{});
await sleep(1200);
for(let i=0;i<25;i++){
  const n=await p.getByRole('button',{name:/^delete$/i}).count();
  if(n===0){ console.log('no more calls to delete'); break; }
  console.log(`iter ${i}: ${n} delete buttons`);
  await p.getByRole('button',{name:/^delete$/i}).first().click({timeout:4000}).catch(e=>console.log('del err',e.message.slice(0,50)));
  await sleep(800);
  await p.getByRole('button',{name:/^delete permanently$/i}).first().click({timeout:4000}).catch(e=>console.log('confirm err',e.message.slice(0,50)));
  await sleep(1800);
  await p.getByText('Show older calls',{exact:false}).first().click({timeout:1500}).catch(()=>{});
  await sleep(400);
}
// final state
const body=(await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,300);
console.log('FINAL:', body);
await ctx.close(); await b.close();
console.log('done');
