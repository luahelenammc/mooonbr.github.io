import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'qa/v12-artifacts');
fs.mkdirSync(output,{recursive:true});
const base='http://127.0.0.1:4173/habbo/';
const browser=await chromium.launch({headless:true});
let checks=0;
function check(ok,message){assert.ok(ok,message);checks++;}
try {
 for(const [lang,route] of [['pt','pt-br/'],['en','en/'],['root','']]){
  for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
   const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await ctx.newPage(),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('requestfailed',r=>failed.push(r.url()));
   await page.goto(base+route,{waitUntil:'networkidle'});
   check(await page.locator('.cinematic-dock').count()===1,'Places Dock not preserved');
   check(await page.locator('html.v12-quiet-ready').count()===1,'V12 JS did not enhance');
   check(await page.locator('link[href*="v12-home.css?v=20261019-v12.1"]').count()===1,'V12 CSS not versioned');
   check(await page.locator('script[src*="v12-home.js?v=20261019-v12.1"]').count()===1,'V12 JS not versioned');
   check(await page.locator('#raros [data-v9-item]').count()===69,'69 unique rare specimens missing');
   check(await page.locator('#emblemas [data-v9-item]').count()===101,'101 global badges missing');
   check(await page.locator('#raros .v11-family-grid a').count()===11,'Exactly 11 rare editorial families expected');
   check(await page.locator('#emblemas .v11-family-grid a').count()===7,'All original badge families must remain');
   check(await page.locator('#raros .v11-family-grid a:visible').count()===11,'One or more rare groups concealed');
   check(await page.locator('#emblemas .v11-family-grid a:visible').count()===7,'Badge groups concealed');
   check(await page.locator('#raros .v9-family:visible').count()===1,'One rare gallery expected at a time');
   check(await page.locator('#emblemas .v9-family:visible').count()===1,'One badge gallery expected at a time');
   check(await page.locator('#raros .v12-misc-family').count()===1,'Rare singles collection missing');
   check(await page.locator('#emblemas .v12-misc-family').count()===0,'Do not fabricate singleton badges');
   check(await page.locator('#raros .v12-misc-family .v11-family-thumb img').count()===3,'Misc cover must use three native sprites');
   check(await page.locator('#raros .v11-family-grid .v11-family-count').count()===0,'Family tile counts must be removed');
   check(await page.locator('#raros .v9-group-index').count()===0,'02/23 numerical labels must be removed');
   check(await page.locator('#raros .v11-directory-count').count()===0,'Redundant total family count must be removed');
   check(await page.locator('#raros .v9-group-copy p').count()===0,'Duplicate heading counts must be removed');
   check(await page.locator('#raros .v9-archive-total').textContent().then(t=>t.includes('69')),'One restrained rare total remains');
   check(await page.locator('#emblemas .v9-archive-total').textContent().then(t=>t.includes('101')),'One restrained badge total remains');
   check(await page.locator('[href*="badge-br"]').count()===0,'Regional BR/PT badges not allowed');
   check(await page.locator('.v9-home-dialog').count()===1,'One lightbox preserved');
   check(await page.locator('#raros .v11-family-grid').evaluate(n=>getComputedStyle(n).display==='grid' && n.scrollWidth<=n.clientWidth+2),'Rare atlas must not scroll horizontally');
   check(await page.locator('#emblemas .v11-family-grid').evaluate(n=>getComputedStyle(n).display==='grid' && n.scrollWidth<=n.clientWidth+2),'Badge atlas must not scroll horizontally');
   check(await page.locator('#raros .v11-family-directory').count()===1,'Accessible family directory missing');
   await page.locator('#raros .v11-family-directory').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(output,lang+'-'+device+'-rares.png')});
   const tile=page.locator('#raros .v12-misc-family');
   await tile.click();
   check(await page.locator('#raros-family-v12-rare-avulsos:visible').count()===1,'Single rarities gallery not accessible');
   check(await tile.getAttribute('aria-current')==='location','Active rare family not signaled');
   check(await page.locator('#raros-family-v12-rare-avulsos [data-v9-item]').count()===14,'Exactly 14 rare singles must be consolidated');
   check(await page.locator('#raros-family-v12-rare-avulsos [data-v9-item]').evaluateAll(items=>new Set(items.map(n=>n.dataset.v9Family)).size===14),'Historic singleton labels must remain distinct');
   check(await page.locator('#raros .v9-family:visible').count()===1,'Misc family should not expose other galleries');
   const dj=page.locator('#raros-family-v12-rare-avulsos [data-v9-id="dj-turntable"]');
   await dj.scrollIntoViewIfNeeded();
   await dj.click();
   check(await page.locator('.v9-home-dialog[open]').count()===1,'Original lightbox must open');
   check(await page.locator('[data-v9-dialog-family]').textContent().then(v=>v.includes('Mesa de DJ')||v.includes('DJ Turntable')),'Original family provenance must be retained');
   check(await page.locator('[data-v9-dialog-image]').evaluate(img=>img.naturalWidth===62 && img.naturalHeight===50),'DJ original full sized sprite must be preserved');
   check(await page.locator('[data-v9-dialog-counter]').textContent().then(v=>/^\d+ \/ 14$/.test(v)),'Lightbox count must follow active family, not 69 rares');
   await page.keyboard.press('ArrowRight');
   check(await page.locator('[data-v9-dialog-counter]').textContent().then(v=>/^\d+ \/ 14$/.test(v)),'Family navigation must remain scoped');
   await page.keyboard.press('Escape');
   check(await page.locator('.v9-home-dialog[open]').count()===0,'Escape should close lightbox');
   await page.locator('#emblemas').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
   await page.screenshot({path:path.join(output,lang+'-'+device+'-badges.png')});
   await page.locator('#emblemas .v11-family-grid a').last().click();
   check(await page.locator('#emblemas .v9-family:visible').count()===1,'Badge selection still works');
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'Horizontal overflow after selections');
   check(errors.length===0,'JS errors '+errors.join('; '));
   check(failed.length===0,'Failed network resources '+failed.join('; '));
   // Old homepage anchors must still direct to the new collector group.
   await page.goto(base+route+'#raros-family-dj-turntable',{waitUntil:'networkidle'});
   check(await page.locator('#raros-family-v12-rare-avulsos:visible').count()===1,'Old singleton anchor must activate new collective family');
   check(await page.locator('#raros-family-dj-turntable').count()===1,'Old anchor must still exist in HTML');
   await ctx.close();
  }
  // Standalone collection pages must have same editorial groups without losing records.
  const ctx=await browser.newContext({viewport:{width:1280,height:780},reducedMotion:'reduce'});
  const p=await ctx.newPage();
  await p.goto(base+(lang==='en'?'en/rares/':'pt-br/raros/'),{waitUntil:'networkidle'});
  check(await p.locator('.v8-family').count()===11,'Standalone rare collection family count mismatched');
  check(await p.locator('#family-v12-rare-avulsos .v8-specimen').count()===14,'Standalone rare group missing singles');
  check(await p.locator('#family-eggs').count()===1,'Old standalone family anchor lost');
  check(await p.locator('.v8-specimen').count()===69,'Original standalone rare specimens missing');
  await p.goto(base+(lang==='en'?'en/badges/':'pt-br/emblemas/'),{waitUntil:'networkidle'});
  check(await p.locator('.v8-family').count()===7,'Badge lineage taxonomy changed unnecessarily');
  check(await p.locator('.v8-specimen').count()===101,'Original standalone badge specimens missing');
  await ctx.close();
 }
 const ctx=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});
 const p=await ctx.newPage();
 await p.goto(base+'pt-br/',{waitUntil:'load'});
 check(await p.locator('#raros .v11-family-grid a:visible').count()===11,'No-JS 11 rares categories accessible');
 check(await p.locator('#emblemas .v11-family-grid a:visible').count()===7,'No-JS 7 badge categories accessible');
 check(await p.locator('#raros .v9-family:visible').count()===11,'No-JS all rare galleries accessible');
 check(await p.locator('#emblemas .v9-family:visible').count()===7,'No-JS all badge galleries accessible');
 await ctx.close();
}finally{await browser.close();}
fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({status:'passed',checks,rareFamilies:11,rareSingletons:14,badgeFamilies:7},null,2));
console.log('V12 QUIET ATLAS PASS',checks);
