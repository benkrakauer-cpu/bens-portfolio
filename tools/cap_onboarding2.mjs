import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const OUT=path.resolve('captures/onboarding'); fs.mkdirSync(OUT,{recursive:true});
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
await p.goto('https://onboardingscheduler.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
const pw=p.locator('input[type="password"]').first(); await pw.click(); await pw.pressSequentially('NYCEM30',{delay:35});
await p.getByRole('button',{name:/sign in/i}).click({timeout:5000}).catch(()=>{}); await sleep(5000);
// add a new hire
try{ const u=p.getByPlaceholder(/jdoe|username/i).first(); if(await u.count()>0){ await u.fill('achen'); await p.getByRole('button',{name:/^\+ Add$/i}).first().click({timeout:3000}).catch(()=>{}); await sleep(1200);} }catch(e){}
// build meetings from a pattern, or add a meeting
try{ await p.getByText('From a pattern',{exact:false}).first().click({timeout:3000}); await sleep(1500); }catch(e){}
try{ await p.getByText('+ Add a meeting',{exact:false}).first().click({timeout:3000}); await sleep(1500); }catch(e){}
await p.screenshot({path:path.join(OUT,'08_build.png')}); console.log('shot 08_build');
// generate
try{ await p.getByRole('button',{name:/Generate invitations/i}).first().click({timeout:4000}); await sleep(5000);
  await p.screenshot({path:path.join(OUT,'09_generated.png')}); console.log('shot 09_generated'); }catch(e){ console.log('gen err',e.message.slice(0,50)); }
await b.close();
console.log('done');
