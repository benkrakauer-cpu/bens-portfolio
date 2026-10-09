import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
p.on('dialog',d=>{ console.log('DIALOG:',d.type(),d.message()); d.accept().catch(()=>{}); });
await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
const pw=p.locator('#p, input[type=password]').first();
if(await pw.count()>0){ await pw.fill('NYCEM30'); await p.getByRole('button',{name:/enter/i}).first().click({timeout:5000}).catch(()=>{}); await sleep(5000); }
await p.locator('input').first().fill('Ben Krakauer').catch(()=>{});
await sleep(800);
console.log('before:', (await p.$$eval('button',els=>els.map(e=>e.innerText.trim()).filter(Boolean))).join(' | '));
const del=p.getByRole('button',{name:/^delete$/i}).first();
await del.click({timeout:4000}).catch(e=>console.log('click err',e.message.slice(0,60)));
await sleep(1500);
console.log('after click:', (await p.$$eval('button',els=>els.map(e=>e.innerText.trim()).filter(Boolean))).join(' | '));
const body=(await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,400);
console.log('body after:', body);
// try a confirm button
for(const t of ['Confirm','Yes, delete','Delete call','Sure','Really delete','Remove']){
  const c=p.getByRole('button',{name:new RegExp('^'+t+'$','i')});
  if(await c.count()>0){ console.log('found confirm:',t); await c.first().click().catch(()=>{}); await sleep(1500); break; }
}
console.log('final:', (await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,200));
await ctx.close(); await b.close();
