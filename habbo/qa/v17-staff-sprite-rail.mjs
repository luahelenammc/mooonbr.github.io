import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'qa/v17-artifacts');fs.mkdirSync(out,{recursive:true});
const source=JSON.parse(fs.readFileSync(path.join(root,'v16/staff-manifest.json'),'utf8'));
const ledger=JSON.parse(fs.readFileSync(path.join(root,'v17/sprite-ledger.json'),'utf8'));
let checks=0;
const ok=(value,msg)=>{assert.ok(value,msg);checks++};
ok(source.profiles.length===12,'twelve source-named people retained');
ok(ledger.sprites.length===8,'eight original full-body staff sprites preserved');
ok(ledger.pending.length===4,'four nonverified figures explicitly documented');
ok(ledger.sprites.every(x=>x.sourceImage.startsWith('https://')&&x.sha256?.length===64),'every original sprite has source and checksum');
for(const sprite of ledger.sprites){
 const data=fs.readFileSync(path.join(root,'assets/v17/staff',sprite.id+'.png'));
 ok(crypto.createHash('sha256').update(data).digest('hex')===sprite.sha256,'sprite exact binary must match archived hash '+sprite.id);
 ok(sprite.width>=45&&sprite.height>=80,'real full body dimensions '+sprite.id);
}
const browser=await chromium.launch({headless:true});
try{
 for(const [locale,route] of [['root',''],['pt','pt-br/'],['en','en/']]){
  const en=locale==='en';
  for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}],['small',{width:320,height:720}]]){
   const ctx=await browser.newContext({viewport});
   const page=await ctx.newPage(),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('requestfailed',r=>failed.push(r.url()));
   await page.goto('http://127.0.0.1:4173/habbo/'+route,{waitUntil:'networkidle'});
   ok(await page.locator('#gerentes .v17-staff-rail').count()===1,'one horizontal staff rail '+locale+device);
   ok(await page.locator('#gerentes .v17-staff-item').count()===12,'all names in single staff rail '+locale+device);
   ok(await page.locator('#gerentes .v17-staff-item img').count()===8,'eight sourced original sprites '+locale+device);
   ok(await page.locator('#gerentes .v17-staff-pending').count()===4,'unverified visuals openly distinguished '+locale+device);
   ok(await page.locator('#gerentes .v16-person, #gerentes .v16-staff-grid, #gerentes .v16-staff-era').count()===0,'no legacy bio cards or stacked groups '+locale+device);
   ok(await page.locator('#gerentes .v17-staff-item figcaption').count()===12,'display simple name under sprite '+locale+device);
   ok(await page.locator('#gerentes [data-v17-staff="flecha"] img').count()===1,'Flecha original included');
   ok(await page.locator('#gerentes [data-v17-staff="mordomo"] .v17-staff-unverified').count()===1,'Mordomo original unavailable; no invented sprite');
   ok(await page.locator('#gerentes [data-v17-staff="4queijos"] img').count()===1,'4Queijos original included');
   ok(await page.locator('#gerentes [data-v17-staff="disco-lee"] img').count()===1,'Disco-Lee original included');
   ok(await page.locator('#gerentes .v17-staff-controls button').count()===2,'left/right buttons '+locale+device);
   ok(await page.locator('.collection-switch a[href="#gerentes"]').count()===1,'navigation unchanged '+locale+device);
   ok(await page.locator('#raros [data-v9-item]').count()===148,'all legacy rare/HC unchanged '+locale+device);
   ok(await page.locator('#emblemas [data-v9-item]').count()===101,'all global badges unchanged '+locale+device);
   ok(await page.locator('#lugares.cinematic-dock').count()===1,'Public Spaces Dock intact');
   const rail=page.locator('#gerentes .v17-staff-rail');
   ok(await rail.evaluate(x=>getComputedStyle(x).overflowX==='auto'&&x.scrollWidth>x.clientWidth),'horizontal overflow works '+locale+device);
   ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2),'page has no sideways overflow '+locale+device);
   await page.locator('.collection-switch a[href="#gerentes"]').click();
   await rail.scrollIntoViewIfNeeded();
   const before=await rail.evaluate(x=>x.scrollLeft);
   await page.locator('#gerentes [data-v9-slide="1"]').click();
   await page.waitForTimeout(800);
   ok((await rail.evaluate(x=>x.scrollLeft))>before+30,'next arrow advances carousel '+locale+device);
   ok(errors.length===0,'no JS errors '+locale+device+' '+errors);
   ok(failed.length===0,'all local images load '+locale+device+' '+failed);
   await rail.evaluate(x=>x.scrollTo({left:0,behavior:'instant'}));
   await page.screenshot({path:path.join(out,locale+'-'+device+'-sprite-rail.png')});
   await ctx.close();
  }
  const lang=en?'en':'pt-br';
  const ctx=await browser.newContext({viewport:{width:390,height:844}});
  const page=await ctx.newPage();
  await page.goto('http://127.0.0.1:4173/habbo/'+lang+'/'+(en?'managers':'gerentes')+'/',{waitUntil:'networkidle'});
  ok(await page.locator('main .v17-staff-rail').count()===1,'standalone one-rail '+lang);
  ok(await page.locator('main .v17-staff-item').count()===12,'standalone twelve names '+lang);
  ok(await page.locator('main .v16-person').count()===0,'no biography cards in standalone '+lang);
  ok(await page.locator('main img[src^="/habbo/assets/v17/staff/"]').count()===8,'standalone nine native archive images '+lang);
  await ctx.close();
 }
 const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:720}});
 const p=await ctx.newPage();
 await p.goto('http://127.0.0.1:4173/habbo/pt-br/',{waitUntil:'load'});
 ok(await p.locator('#gerentes .v17-staff-rail').count()===1,'rail works without JS');
 ok(await p.locator('#gerentes .v17-staff-item').count()===12,'all figures persist without JS');
 ok(await p.locator('#gerentes .v17-staff-item img').count()===8,'images persist without JS');
 await ctx.close();
}finally{await browser.close()}
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'passed',checks,railCount:1,staffNames:12,verifiedOriginalSprites:8,pendingVisualVerification:4,rareFurniture:148,badges:101},null,2));
console.log('HABBO V17 VERIFIED STAFF RAIL PASS '+checks);
