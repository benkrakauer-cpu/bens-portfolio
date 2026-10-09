import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});

for(const [name,url] of [['quicklook','https://quicklook.benjaminkrakauer.com/'],['callnotes','https://callnotes.benjaminkrakauer.com/']]){
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  const resp=await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000}).catch(e=>({err:e.message}));
  await sleep(3000);
  console.log(`\n===== ${name} (${url}) =====`);
  console.log('status:', resp&&resp.status?resp.status():resp);
  console.log('title:', await p.title().catch(()=>null));
  // inventory inputs
  const inputs = await p.$$eval('input', els=>els.map(e=>({type:e.type,name:e.name,ph:e.placeholder,id:e.id})));
  console.log('inputs:', JSON.stringify(inputs));
  const btns = await p.$$eval('button,a[role=button],input[type=submit]', els=>els.map(e=>(e.innerText||e.value||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,20));
  console.log('buttons:', JSON.stringify(btns));
  const body=(await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,500);
  console.log('body:', body);
  await ctx.close();
}
await b.close();
console.log('\ndone');
