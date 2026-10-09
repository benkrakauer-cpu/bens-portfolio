import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/quicklook'); fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:1200},deviceScaleFactor:2,ignoreHTTPSErrors:true,acceptDownloads:true});
const p=await ctx.newPage();
ctx.on('page',async pop=>{ try{ await pop.waitForLoadState('domcontentloaded'); await sleep(2500); await pop.screenshot({path:path.join(OUT,'ql-document.png')}); console.log('popup shot, url=',pop.url()); }catch(e){console.log('popup err',e.message.slice(0,60));} });
await p.goto('https://quicklook.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
await p.locator('#name').fill('Ben Krakauer');
await p.locator('#password').fill('NYCEM30');
await p.getByRole('button',{name:/sign in/i}).first().click().catch(()=>{});
await sleep(6000);
await p.getByText('Open',{exact:true}).first().click({timeout:5000}).catch(()=>{});
await sleep(5000);
// Click "Preview and export" in top bar
await p.getByText('Preview and export',{exact:false}).first().click({timeout:5000}).catch(()=>{});
await sleep(3500);
console.log('after preview url:',p.url());
const body=(await p.evaluate(()=>document.body.innerText).catch(()=>'')).replace(/\s+/g,' ').slice(0,500);
console.log('body:',body);
await p.screenshot({path:path.join(OUT,'ql-previewfull.png')});
// Try to capture the document preview element cleanly
const el=await p.$('.preview, [class*=preview], [class*=page], [class*=paper], [class*=doc]');
if(el){ try{ await el.screenshot({path:path.join(OUT,'ql-document.png')}); console.log('element doc shot'); }catch(e){console.log('el shot err',e.message.slice(0,60));} }
await sleep(1500);
await ctx.close(); await b.close();
console.log('done');
