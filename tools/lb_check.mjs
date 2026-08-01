import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: EXE, args:['--no-sandbox'] });
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://127.0.0.1:8077/callnotes.html',{waitUntil:'networkidle'});
// open first (non-PDF) tile
await p.locator('.subtile-view').first().click(); await p.waitForTimeout(300);
console.log('non-PDF tile: download hidden attr =', await p.locator('.lb-download').getAttribute('hidden'), '| visible =', await p.locator('.lb-download').isVisible());
await b.close();
// also hazard PDF tile
const p2=await (await (await chromium.launch({executablePath:EXE,args:['--no-sandbox']})).newContext()).newPage().catch(()=>null);
