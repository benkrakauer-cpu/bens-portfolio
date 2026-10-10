import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/callnotes2');
const MODE=process.argv[2]||'inspect';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox',`--proxy-server=${process.env.HTTPS_PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const p=await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true})).newPage();
const showTests=async()=>{ await p.getByText(/^Show \d+ test calls?$/).first().click({timeout:2500}).catch(()=>{}); await sleep(1200); };
const click=async (t,exact=false)=>{ try{ await p.getByText(t,{exact}).first().click({timeout:3500}); return true;}catch{ return false; } };
async function home(){
  await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{}); await sleep(2500);
  const pw=p.locator('#p, input[type=password]').first();
  if(await pw.count()>0){ await pw.fill('NYCEM30'); await p.getByRole('button',{name:/enter/i}).first().click(); await sleep(5000); }
  const nm=p.getByPlaceholder('Jane Doe'); if(await nm.count()) await nm.fill('Ben Krakauer'); await sleep(800);
  await click('Show older calls'); await sleep(1500); await showTests();
}
await home();
// 1) delete every call except the 1400 HRS demo call
for(let i=0;i<10;i++){
  const extra=p.locator('li.call').filter({hasNotText:'1400 HRS'});
  if(!(await extra.count())) break;
  await extra.first().getByRole('button',{name:/^delete$/i}).click(); await sleep(700);
  await p.getByRole('button',{name:/^delete permanently$/i}).first().click(); await sleep(2000);
  await click('Show older calls'); await sleep(1200); await showTests();
}
console.log('board:', (await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(150,520));
if(MODE==='shots'){
  await p.screenshot({path:path.join(OUT,'cn-today.png')}); console.log('shot cn-today');
  await click('Before your first call'); await sleep(2000);
  await p.screenshot({path:path.join(OUT,'cn-primer.png')}); console.log('shot cn-primer');
  await b.close(); process.exit(0);
}
// 2) resume the demo call and list what each still-amber block needs
await p.locator('li.call',{hasText:'1400 HRS'}).getByText(/this is me/).click({timeout:5000}).catch(e=>console.log('resume fail',e.message.slice(0,60)));
await sleep(4500);
await click('Skip to the agency cards'); await sleep(2500);
console.log('view:',(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,200));
const rail=await p.evaluate(()=>[...document.querySelectorAll('nav a, aside a, aside button, nav button')].map(x=>x.innerText.split('\n')).filter(x=>x[1]&&x[1]!=='✓').map(x=>x[0].trim()));
console.log('agencies with amber:', JSON.stringify(rail));
for(const a of rail.slice(0,40)){
  await p.locator('nav, aside').getByText(a,{exact:true}).first().click({timeout:3000}).catch(()=>{}); await sleep(700);
  const info=await p.evaluate(()=>[...document.querySelectorAll('section.block.block--amber')].map(bk=>{
    const groups=[...bk.querySelectorAll('.pills')].map(g=>[...g.querySelectorAll('button')].map(x=>(x.getAttribute('aria-pressed')==='true'?'*':'')+x.innerText.trim()).join('/'));
    const ins=[...bk.querySelectorAll('input,textarea,select')].map(i=>i.tagName.toLowerCase()+':'+(i.type||'')+':'+(i.placeholder||i.getAttribute('aria-label')||'')+'='+(i.value||''));
    const hint=(bk.querySelector('.block__hint')||{}).textContent||'';
    return `${bk.getAttribute('aria-label')} | ${groups.join(' ; ')} | ${ins.join(' ; ')} | ${hint}`; }));
  console.log(`\n## ${a}\n  `+info.join('\n  '));
}
await b.close();
