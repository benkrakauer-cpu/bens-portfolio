// Re-capture CallNotes from a fully worked TEST call (demo answers), so the
// preview / export screens show a realistic record instead of an empty one.
import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=path.resolve('captures/callnotes2'); fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox',`--proxy-server=${process.env.HTTPS_PROXY}`,'--ssl-version-max=tls1.2','--disable-http2']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,ignoreHTTPSErrors:true});
const p=await ctx.newPage();
p.on('dialog',d=>d.accept().catch(()=>{}));
const shot=async n=>{ await p.screenshot({path:path.join(OUT,n+'.png')}); console.log('shot',n); };
const click=async (t,exact=false)=>{ try{ await p.getByText(t,{exact}).first().click({timeout:3500}); return true;}catch{ return false; } };
const nav=async t=>{ try{ await p.getByRole('link',{name:t,exact:true}).first().click({timeout:3500}); }catch{ await click(t,true); } await sleep(1500); };

// Demo notes for a few agencies (fictional, plausible heat-day content)
const NOTES={
  '311':'Heat-related inquiries are the #2 call driver today, mostly cooling-center locations and hours.',
  'FDNY':'EMS volume elevated for heat-related calls; no units held. Spray caps being distributed in Bronx and Brooklyn.',
  'NYC Health':'Heat advisory messaging pushed to providers; syndromic surveillance shows a modest rise in heat-related ED visits.',
  'Con Edison':'Load forecast near peak; no significant outages. Crews pre-staged in Queens and Brooklyn.',
  'NYC Aging':'Older-adult centers operating as cooling centers with extended hours through Sunday.',
  'Parks':'Pools and spray showers open with extended hours; misting stations deployed at 12 sites.',
};

// Answer every unanswered REQUIRED pill group on the current view.
async function fill(){
  for(let pass=0;pass<3;pass++){
    const n=await p.evaluate(()=>{
      const neg=/holding|unusual|incident|fatal|death|outage|closure|suspen|shortage|concern|issue|problem|delay|unmet|resource request|requesting/i;
      let clicked=0;
      for(const blk of document.querySelectorAll('section.block')){
        const tag=(blk.querySelector('.block__tag')||{}).textContent||'';
        if(!/REQUIRED/.test(tag)) continue;
        const q=(blk.getAttribute('aria-label')||'');
        for(const grp of blk.querySelectorAll('.pills')){
          const btns=[...grp.querySelectorAll('button.pill')];
          if(!btns.length || btns.some(x=>x.getAttribute('aria-pressed')==='true')) continue;
          const t=btns.map(x=>x.innerText.trim());
          if(t.length===1 && /all normal/i.test(t[0])) continue;
          const row=(grp.previousElementSibling&&grp.previousElementSibling.innerText||'')+' '+q;
          let pick=-1; const ix=s=>t.findIndex(x=>x.toLowerCase()===s);
          if(ix('yes')>=0) pick = neg.test(q) ? ix('no') : ix('yes');
          else if(ix('elevated')>=0) pick = /heat/i.test(row) ? ix('elevated') : ix('normal');
          else if(ix('in top drivers')>=0) pick = ix('in top drivers');
          else pick = t.length>=3 ? 1 : 0;
          if(pick<0) pick=0;
          btns[pick].click(); clicked++;
        }
      }
      return clicked;
    });
    // follow-up detail fields revealed by answers
    for(const sel of ['section.block input[type=date]','section.block input[type=time]','section.block input[type=number]']){
      const loc=p.locator(sel); const c=await loc.count();
      for(let i=0;i<c;i++){ const el=loc.nth(i); if(await el.inputValue().catch(()=> 'x')) continue;
        await el.fill(sel.includes('date')?'2026-10-09':sel.includes('time')?'14:00':'3').catch(()=>{}); }
    }
    if(!n) break; await sleep(500);
  }
}

// ---- auth
await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
await sleep(2500);
const pw=p.locator('#p, input[type=password]').first();
if(await pw.count()>0){ await pw.fill('NYCEM30'); await p.getByRole('button',{name:/enter/i}).first().click(); await sleep(5000); }
await p.locator('input').first().fill('Ben Krakauer'); await sleep(600);

// ---- new call (TEST)
await p.getByRole('button',{name:/start a new call/i}).first().click(); await sleep(3000);
await click('Heat (HESC)'); await sleep(500);
await click('Test call',true); await sleep(500);
const inputs=p.locator('input[type=text], input:not([type])');
// time + chair fields on the setup form
const timeIn=p.getByLabel(/call time/i); if(await timeIn.count()) await timeIn.fill('1400').catch(()=>{});
const chairIn=p.getByLabel(/chair/i); if(await chairIn.count()) await chairIn.fill('NYCEM Watch Command').catch(()=>{});
await sleep(800); await shot('cn-setup');
await click('Start call'); await sleep(4500);
await shot('cn-choose');
await click('Capture the call live'); await sleep(4000);

// ---- front matter
await nav('Front matter & NYCEM');
for(const t of ['Heat Emergency Plan','Air Quality Emergency Guide','Partial','Hybrid','Day shift only']){ await click(t,true); await sleep(300); }
await fill();
await p.evaluate(()=>window.scrollTo(0,0)); await sleep(600);
await shot('cn-frontmatter');

// ---- agencies
await nav('← Agencies');
const rail=await p.evaluate(()=>[...document.querySelectorAll('nav a, aside a, aside button, nav button')].map(x=>x.innerText.split('\n')[0].trim()).filter(Boolean));
console.log('agencies:',rail.length);
for(const a of rail){
  await p.locator('nav, aside').getByText(a,{exact:true}).first().click({timeout:3000}).catch(()=>{});
  await sleep(700);
  await fill();
  if(NOTES[a]){ const ta=p.getByPlaceholder(/questions do not cover/i).first(); if(await ta.count()) { await ta.fill(NOTES[a]).catch(()=>{}); await sleep(500);} }
}
// agency card shot: FDNY, completed
await p.locator('nav, aside').getByText('FDNY',{exact:true}).first().click().catch(()=>{}); await sleep(1500);
await shot('cn-agency-card');
// diagnostics over a completed card
await nav('Diagnostics'); await sleep(800); await shot('cn-diagnostics');
await click('Close',true); await sleep(500);

// ---- preview (top, then scrolled into agency notes)
await nav('Preview'); await sleep(2500);
await shot('cn-preview');
const notesHead=p.getByText(/^Agency (Updates|Reports|Notes)/i).first();
if(await notesHead.count()){ await notesHead.scrollIntoViewIfNeeded().catch(()=>{}); await p.evaluate(()=>window.scrollBy(0,-120)); }
else await p.evaluate(()=>window.scrollTo(0,1500));
await sleep(800); await shot('cn-preview-notes');

// ---- review & export
await nav('Review & export'); await sleep(2500); await shot('cn-export');
// ---- transcript
await nav('Transcript'); await sleep(2000); await shot('cn-transcript');
await click('Close',true); await sleep(500);

// ---- today board (call running) + primer
await p.goto('https://callnotes.benjaminkrakauer.com/',{waitUntil:'domcontentloaded'}); await sleep(3000);
await p.locator('input').first().fill('Ben Krakauer').catch(()=>{}); await sleep(800);
await shot('cn-today');
await click('Before your first call'); await sleep(2000); await shot('cn-primer');

const body=(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,200);
console.log('end:',body);
await b.close(); console.log('done');
