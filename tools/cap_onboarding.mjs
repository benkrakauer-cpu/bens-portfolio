// Onboarding Scheduler — capture nav screens past NYCEM30.
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
const pw=p.locator('input[type="password"]').first();
await pw.click(); await pw.pressSequentially('NYCEM30',{delay:35});
await p.getByRole('button',{name:/sign in/i}).click({timeout:5000}).catch(()=>{}); await sleep(5000);
await p.screenshot({path:path.join(OUT,'01_generate.png')}); console.log('shot 01_generate');
async function nav(label,fname){
  try{ const el=p.getByText(label,{exact:true}).first(); await el.click({timeout:5000}); await sleep(3500);
    await p.screenshot({path:path.join(OUT,fname+'.png')}); console.log('shot',fname);
  }catch(e){ console.log('miss',label,e.message.slice(0,50)); }
}
await nav('Patterns','02_patterns');
await nav('Meetings','03_meetings');
await nav('Directory','04_directory');
await nav('Rooms','05_rooms');
await nav('Log','06_log');
await nav('Settings','07_settings');
await b.close();
console.log('done', fs.readdirSync(OUT).filter(f=>f.endsWith('.png')).length,'shots');
