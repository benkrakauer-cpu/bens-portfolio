import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PROXY=process.env.HTTPS_PROXY||'http://127.0.0.1:42213';
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1.4,ignoreHTTPSErrors:true,httpCredentials:undefined});
// use cookie for gate
await ctx.addCookies([{name:'pf_auth',value:'BJKPortfolio',domain:'portfolio.benjaminkrakauer.com',path:'/'}]);
const p=await ctx.newPage();
await p.goto('https://portfolio.benjaminkrakauer.com/',{waitUntil:'networkidle',timeout:40000});
await p.waitForTimeout(700);
await p.screenshot({path:'captures/final_home.png',fullPage:true});
const tiles=await p.locator('a.tile-link').count();
console.log('home link tiles:',tiles);
await p.goto('https://portfolio.benjaminkrakauer.com/procurement.html',{waitUntil:'networkidle',timeout:40000});
await p.waitForTimeout(700);
await p.screenshot({path:'captures/final_procurement.png',fullPage:false});
await b.close(); console.log('done');
