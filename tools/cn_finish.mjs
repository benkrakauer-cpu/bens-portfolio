// Resume the 1400 HRS demo TEST call, finish answering every block, then
// re-take the record-dependent CallNotes screenshots.
import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/callnotes2'); fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox',`--proxy-server=${process.env.HTTPS_PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const p=await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true})).newPage();
const shot=async n=>{ await p.screenshot({path:path.join(OUT,n+'.png')}); console.log('shot',n); };
const click=async (t,exact=false)=>{ try{ await p.getByText(t,{exact}).first().click({timeout:3500}); return true;}catch{ return false; } };
const nav=async t=>{ try{ await p.getByRole('link',{name:t,exact:true}).first().click({timeout:3500}); }catch{ await click(t,true); } await sleep(1500); };

// Free-text / number answers by question (demo values)
const TEXT={
  'Health impacts of heat exposure':['Modest rise in heat-related emergency department visits; no heat-related deaths reported.'],
  'Key decisions, follow-ups, or anything to add':['Cooling centers stay on extended hours through Sunday.','Next HESC call tomorrow at 1400.'],
  'Critical customer outages':['0'],
  'LSE customer outages':['0'],
  'TV and peak load forecast':['86','88','84','12,850 MW','13,100 MW','12,600 MW'],
  'Peak load forecast against available capability':['10,950 MW','12,800 MW','29,800 MW','37,500 MW'],
};

// one pill click per call, re-reading the DOM each time (pill clicks re-render the block)
async function stepOnce(){
  return p.evaluate(()=>{
    for(const blk of document.querySelectorAll('section.block.block--amber')){
      const q=blk.getAttribute('aria-label')||'';
      const hint=(blk.querySelector('.block__hint')||{}).textContent||'';
      const groups=[...blk.querySelectorAll('.pills')];
      // a "Yes" that needs revealed fields we don't supply -> answer "No" instead
      if(/A yes needs/.test(hint) && !blk.dataset.flipped){
        const no=[...blk.querySelectorAll('button.pill')].find(x=>x.innerText.trim()==='No');
        if(no){ blk.dataset.flipped='1'; no.click(); return q+' -> No'; }
      }
      for(const g of groups){
        const btns=[...g.querySelectorAll('button.pill')];
        if(!btns.length || btns.some(x=>x.getAttribute('aria-pressed')==='true')) continue;
        const t=btns.map(x=>x.innerText.trim());
        if(t.length===1 && /all normal/i.test(t[0])) continue;
        if(t.length>6) continue;                       // pick-lists (pools, beaches) only matter when "some closed"
        const row=((g.previousElementSibling&&g.previousElementSibling.innerText)||'')+' '+q;
        const ix=s=>t.findIndex(x=>x.toLowerCase()===s);
        let k=-1;
        if(ix('moderate')>=0) k=ix('moderate');
        else if(ix('elevated')>=0 && /heat/i.test(row)) k=ix('elevated');
        else if(ix('yes')>=0) k=ix('yes');
        else if(ix('in top drivers')>=0) k=ix('in top drivers');
        else k=0;
        btns[Math.max(k,0)].click(); return q+' : '+t[Math.max(k,0)];
      }
    }
    return null;
  });
}
async function fill(){
  for(let i=0;i<120;i++){ const r=await stepOnce(); if(!r) break; await sleep(200); }
  for(const [q,vals] of Object.entries(TEXT)){
    const blk=p.locator(`section.block[aria-label="${q}"]`);
    if(!(await blk.count())) continue;
    const fields=blk.locator('input[type=text], textarea');
    if(await blk.locator('textarea').count()){ await blk.locator('textarea').first().fill(vals.join('\n')).catch(()=>{}); }
    else { const n=await fields.count(); for(let i=0;i<Math.min(n,vals.length);i++) await fields.nth(i).fill(vals[i]).catch(()=>{}); }
    await sleep(300);
  }
  for(let i=0;i<40;i++){ const r=await stepOnce(); if(!r) break; await sleep(200); }
}

// ---- auth + resume
await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{}); await sleep(2500);
const pw=p.locator('#p'); if(await pw.count()){ await pw.fill('NYCEM30'); await p.getByRole('button',{name:/enter/i}).click(); await sleep(5000); }
await p.getByPlaceholder('Jane Doe').fill('Ben Krakauer'); await sleep(600);
await click('Show older calls'); await sleep(1500);
await p.getByText(/^Show \d+ test calls?$/).first().click({timeout:2500}).catch(()=>{}); await sleep(1200);
await p.locator('li.call',{hasText:'1400 HRS'}).getByText(/this is me/).click(); await sleep(4500);
await click('Skip to the agency cards'); await sleep(2500);
// single automated tab: clear the app's tab lock before it boots so the reload isn't seen as a second tab
await p.context().addInitScript(()=>{ try{ localStorage.removeItem('callnotes.tab'); }catch{} });
await p.reload({waitUntil:'domcontentloaded'}); await sleep(4000); await click('Skip to the agency cards'); await sleep(2000);
// the reload trips the app's same-call tab lock until the old lock goes stale
for(let i=0;i<6 && await p.getByText(/open in another tab/).count();i++) await sleep(5000);
console.log('tab-lock banner gone:', !(await p.getByText(/open in another tab/).count()));

// ---- front matter
await nav('Front matter & NYCEM'); await click('Partial',true); await sleep(500); await fill();
await p.evaluate(()=>window.scrollTo(0,0)); await sleep(600); await shot('cn-frontmatter');

// ---- agencies (the rail only renders on the agency-card view)
await nav('← Agencies'); await sleep(1000);
const rail=await p.evaluate(()=>[...document.querySelectorAll('nav a, aside a, aside button, nav button')].map(x=>x.innerText.split('\n')[0].trim()).filter(Boolean));
for(const a of rail){
  await p.locator('nav, aside').getByText(a,{exact:true}).first().click({timeout:3000}).catch(()=>{}); await sleep(600);
  await fill();
}
const left=await p.evaluate(()=>[...document.querySelectorAll('nav a, aside a, aside button, nav button')].map(x=>x.innerText.split('\n')).filter(x=>x[1]&&x[1]!=='✓').map(x=>x.join(':')));
console.log('agencies:', rail.length, 'still amber:', JSON.stringify(left));

// ---- shots
await p.locator('nav, aside').getByText('FDNY',{exact:true}).first().click().catch(()=>{}); await sleep(1500);
await p.evaluate(()=>window.scrollTo(0,0)); await shot('cn-agency-card');
await nav('Diagnostics'); await sleep(800); await shot('cn-diagnostics'); await click('Close',true); await sleep(500);
await nav('Preview'); await sleep(2500); await shot('cn-preview');
const nh=p.getByText('External Affairs/Government Relations',{exact:true}).last();
if(await nh.count()){ await nh.evaluate(el=>el.scrollIntoView({block:'start'})); await p.evaluate(()=>window.scrollBy(0,-20)); }
await sleep(800); await shot('cn-preview-notes');
await nav('Review & export'); await sleep(2500); await shot('cn-export');
console.log('export:', (await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').match(/Produce the document.{0,600}/)?.[0]);
await nav('Transcript'); await sleep(2000); await shot('cn-transcript');
await b.close(); console.log('done');
