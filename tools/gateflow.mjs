import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const b = await chromium.launch({ executablePath: EXE, args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2'] });
const ctx = await b.newContext({ viewport:{width:1200,height:820}, deviceScaleFactor:1.5, ignoreHTTPSErrors:true });
const p = await ctx.newPage();
await p.goto('https://portfolio.benjaminkrakauer.com/', { waitUntil:'networkidle', timeout:40000 });
// Should be the sign-in page (single password field, no username/email field)
const pwFields = await p.locator('input[type="password"]').count();
const otherText = await p.locator('input[type="text"],input[type="email"]').count();
const title = await p.locator('h1').first().textContent().catch(()=>null);
await p.screenshot({ path:'captures/gate_signin.png' });
console.log('sign-in page: h1=',JSON.stringify(title),'| pwFields=',pwFields,'| text/email fields=',otherText);
// Enter password and submit
await p.locator('#p').fill('BJKPortfolio');
await p.getByRole('button',{name:/enter/i}).click();
await p.waitForLoadState('networkidle');
await p.waitForTimeout(800);
const kickers = await p.$$eval('.tile-kicker', els=>els.map(e=>e.textContent));
const imgs = await p.$$eval('img', a=>a.map(i=>i.naturalWidth));
await p.screenshot({ path:'captures/gate_unlocked.png' });
console.log('after submit: tiles=',kickers.length,'| firstKicker=',JSON.stringify(kickers[0]),'| imgsLoaded=',imgs.filter(w=>w>0).length+'/'+imgs.length);
await b.close();
