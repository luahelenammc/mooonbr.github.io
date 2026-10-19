import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const src=JSON.parse(fs.readFileSync(path.join(root,'v16/staff-manifest.json')));
const ledger=JSON.parse(fs.readFileSync(path.join(root,'v17/staff-originals.json')));
const out=path.join(root,'qa/v17-artifacts');fs.mkdirSync(out,{recursive:true});
let tests=0;const ok=(v,m)=>{assert.ok(v,m);tests++};
ok(src.profiles.length===12,'all twelve names retained');
ok(ledger.assets.length>=10,'at least ten independently verified historic figures');
ok(ledger.assets.every(x=>src.profiles.some(p=>p.id===x.id)),'no unrelated characters included');
for(const a of ledger.assets){
 const f=path.join(root,'..',a.local);
 ok(fs.existsSync(f),'original stored for '+a.id);
 const sha=crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
 ok(sha===a.sha256,'original checksum '+a.id);
 ok(a.width>=25&&a.height>=50,'real period image dimensions '+a.id);
}
const browser=await chromium.launch({headless:true});
try{
 for(const [locale,route] of [['root',''],['pt','pt-br/'],['en','en/']]){
  const en=locale==='en';
  for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}],['tiny',{width:320,height:720}]]){
   const ctx=await browser.newContext({viewport,reducedMotion:'no-preference'});
   const page=await ctx.newPage(),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('requestfailed',r=>failed.push(r.url()));
   await page.goto('http://127.0.0.1:4173/habbo/'+route,{waitUntil:'networkidle'});
   ok(await page.locator('#gerentes [data-v17-rail]').count()===1,'exactly one horizontal rail '+locale+device);
   ok(await page.locator('#gerentes [data-v17-person]').count()===12,'twelve simple sprites and names '+locale+device);
   ok(await page.locator('#gerentes [data-v17-person] img').count()===ledger.assets.length,'every preserved original rendered '+locale+device);
   ok(await page.locator('#gerentes .v16-person').count()===0,'NO biographical cards '+locale+device);
   ok(await page.locator('#gerentes .v16-staff-era').count()===0,'NO separate era grids '+locale+device);
   ok(await page.locator('#gerentes .v16-person-note').count()===0,'NO visible mini-biographies '+locale+device);
   ok(await page.locator('#gerentes [data-v17-person="flecha"] .v17-staff-name').textContent().then(t=>t.trim()==='Flecha'),'first figure named correctly');
   ok(await page.locator('#gerentes [data-v17-person="djapamala"] .v17-staff-name').textContent().then(t=>t.trim()==='DJapamala'),'last figure named correctly');
   ok(await page.locator('#gerentes [data-v17-person="prefeita"]').count()===1,'source-pending Prefeita retained, no made-up pixels');
   ok(await page.locator('#gerentes [data-v17-person="prefeita"] img').count()===0,'do not misattribute third-party look to Prefeita');
   ok(await page.locator('#gerentes [data-v17-scroll]').count()===2,'real scroll controls');
   ok(await page.locator('#gerentes [data-v17-rail]').evaluate(x=>getComputedStyle(x).overflowX==='auto'),'native horizontal scroll '+locale+device);
   ok(await page.locator('#gerentes [data-v17-rail]').evaluate(x=>x.scrollWidth>x.clientWidth),'gallery actually overflows into a swipe rail '+locale+device);
   ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2),'NO document-wide overflow '+locale+device);
   ok(await page.locator('#raros [data-v9-item]').count()===148,'148 historic furniture preserved '+locale+device);
   ok(await page.locator('#emblemas [data-v9-item]').count()===101,'101 global badges preserved '+locale+device);
   ok(await page.locator('.cinematic-dock').count()===1,'public spaces dock preserved '+locale+device);
   ok(await page.locator('.collection-switch a[href="#gerentes"]').count()===1,'four chapter tab preserved '+locale+device);
   ok(await page.locator('#gerentes [data-v17-person] a').count()===12,'all figures have original-source links');
   const figure=page.locator('#gerentes [data-v17-person="flecha"] img');
   await figure.scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>{const x=document.querySelector('#gerentes [data-v17-person="flecha"] img');return x?.complete&&x.naturalWidth===64&&x.naturalHeight===110;});
   ok(await figure.evaluate(x=>x.naturalWidth===64&&x.naturalHeight===110),'authentic 64×110 Flecha screenshot');
   const rail=page.locator('#gerentes [data-v17-rail]');
   await rail.evaluate(x=>x.scrollTo({left:0,behavior:'instant'}));
   await page.locator('#gerentes [data-v17-scroll="1"]').click();
   await page.waitForFunction(()=>document.querySelector('#gerentes [data-v17-rail]')?.scrollLeft>60);
   ok((await rail.evaluate(x=>x.scrollLeft))>60,'right arrow actually scrolls '+locale+device);
   ok(errors.length===0,'no JS errors '+errors.join(';'));
   ok(failed.length===0,'no image request failures '+failed.join(';'));
   await page.locator('#gerentes').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(out,locale+'-'+device+'-sprite-rail.png')});
   await ctx.close();
  }
  const ctx=await browser.newContext({viewport:{width:390,height:844}});
  const page=await ctx.newPage();
  await page.goto('http://127.0.0.1:4173/habbo/'+(en?'en/managers/':'pt-br/gerentes/'),{waitUntil:'networkidle'});
  ok(await page.locator('#gerentes [data-v17-rail]').count()===1,'standalone also ONE rail '+locale);
  ok(await page.locator('#gerentes [data-v17-person]').count()===12,'standalone preserves 12 names '+locale);
  ok(await page.locator('#gerentes .v16-person').count()===0,'no old biography cards standalone '+locale);
  ok(await page.locator('script[src*="v17-staff.js"]').count()===1,'standalone javascript versioned');
  await ctx.close();
 }
 const ctx=await browser.newContext({viewport:{width:320,height:720},javaScriptEnabled:false});
 const p=await ctx.newPage();
 await p.goto('http://127.0.0.1:4173/habbo/pt-br/',{waitUntil:'load'});
 ok(await p.locator('#gerentes [data-v17-person]').count()===12,'NO JS preserves twelve names');
 ok(await p.locator('#gerentes [data-v17-rail]').evaluate(x=>x.scrollWidth>x.clientWidth),'NO JS scroll works');
 await ctx.close();
}finally{await browser.close()}
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'passed',checks:tests,figures:12,originals:ledger.assets.length,missing:src.profiles.filter(p=>!ledger.assets.some(x=>x.id===p.id)).map(x=>x.id),layout:'one horizontal sprite-name rail; no biography cards'},null,2));
console.log('HABBO V17 ORIGINAL AVATAR RAIL PASS',tests);
