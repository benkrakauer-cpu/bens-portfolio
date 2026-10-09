import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const OUT=path.resolve('captures/_probe'); fs.mkdirSync(OUT,{recursive:true});

// QuickLook: name + team password
{
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto('https://quicklook.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(2500);
  await p.locator('#name').fill('Ben Krakauer');
  await p.locator('#password').fill('NYCEM30');
  await p.getByRole('button',{name:/sign in/i}).first().click({timeout:5000}).catch(()=>{});
  await sleep(7000);
  console.log('\n===== QUICKLOOK after login =====');
  console.log('url:', p.url(), '| title:', await p.title().catch(()=>null));
  const stillLogin=(await p.locator('#password').count())>0;
  console.log('stillLogin:', stillLogin);
  const body=(await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,700);
  console.log('body:', body);
  const nav=await p.$$eval('a,button', els=>[...new Set(els.map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<40))].slice(0,40));
  console.log('nav/buttons:', JSON.stringify(nav));
  await p.screenshot({path:path.join(OUT,'quicklook_home.png')});
  await ctx.close();
}
// CallNotes: simple password
{
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,ignoreHTTPSErrors:true});
  const p=await ctx.newPage();
  await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
  await sleep(2500);
  await p.locator('#p').fill('NYCEM30');
  await p.getByRole('button',{name:/enter/i}).first().click({timeout:5000}).catch(()=>{});
  await sleep(7000);
  console.log('\n===== CALLNOTES after login =====');
  console.log('url:', p.url(), '| title:', await p.title().catch(()=>null));
  const stillLogin=(await p.locator('#p').count())>0;
  console.log('stillLogin:', stillLogin);
  const body=(await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,700);
  console.log('body:', body);
  const nav=await p.$$eval('a,button', els=>[...new Set(els.map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<40))].slice(0,40));
  console.log('nav/buttons:', JSON.stringify(nav));
  await p.screenshot({path:path.join(OUT,'callnotes_home.png')});
  await ctx.close();
}
await b.close();
console.log('\ndone');
