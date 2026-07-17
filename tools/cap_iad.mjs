// IAD 2.0 — capture logged-in screens. Creds from env (IAD_EMAIL/IAD_PASS).
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const OUT=path.resolve('captures/iad'); fs.mkdirSync(OUT,{recursive:true});
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
await p.goto('https://iad.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
await p.locator('input[type="email"], input[type="text"]').first().fill(process.env.IAD_EMAIL);
const pw=p.locator('input[type="password"]').first(); await pw.fill(process.env.IAD_PASS);
await p.locator('button:has-text("Sign In"),button[type="submit"]').first().click({timeout:5000}).catch(()=>{});
await sleep(6000);
async function nav(label,fname){
  try{ const el=p.getByText(label,{exact:true}).first(); await el.click({timeout:5000}); await sleep(3500);
    await p.screenshot({path:path.join(OUT,fname+'.png')}); console.log('shot',fname); return true;
  }catch(e){ console.log('miss',label,e.message.slice(0,50)); return false; }
}
await p.screenshot({path:path.join(OUT,'01_dashboard.png')}); console.log('shot 01_dashboard');
await nav('Directory','02_directory');
// contact detail: click first contact row name in the list
try{ const row=p.locator('main a, main [role="button"], main tr').filter({hasText:/Addams|Baldwin|Allan|Bauer|Blackwell/}).first();
  await row.click({timeout:4000}); await sleep(3000); await p.screenshot({path:path.join(OUT,'03_contact_detail.png')}); console.log('shot 03_contact_detail');
}catch(e){ console.log('no contact detail',e.message.slice(0,40)); }
await nav('Agencies','04_agencies');
await nav('Lists','05_lists');
await nav('Update Requests','06_update_requests');
await nav('Pending Changes','07_pending_changes');
await nav('Raised Flags','08_raised_flags');
await nav('Import / Export','09_import_export');
await nav('KPI Dashboard','10_kpi');
await nav('Audit Log','11_audit_log');
await nav('Role Capabilities','12_roles');
await b.close();
console.log('done', fs.readdirSync(OUT).filter(f=>f.endsWith('.png')).length,'shots');
