import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const evidence=path.join(root,'qa/v9-complete-index-artifacts');
fs.mkdirSync(evidence,{recursive:true});
const base=(process.env.HABBO_QA_URL||'http://127.0.0.1:4173/habbo').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
let total=0;
const check=(valid,msg)=>{assert.ok(valid,msg);total++};
try {
 for(const [locale,route] of [['pt','pt-br/'],['en','en/'],['root','']]){
  const lang=locale==='root'?'pt':locale;
  for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
   const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+'/'+route,{waitUntil:'networkidle'});
   check(await page.locator('.cinematic-dock').count()===1,'Public Spaces cinematic Dock must be retained');
   check(await page.locator('.cinematic-dock [data-dock-slide]').count()>=25,'Original Places slides lost');
   check(await page.locator('.v8-home-chapters').count()===1,'Archive chapters absent');
   check(await page.locator('#raros [data-v9-item]').count()===69,'INDEX must contain all 69 rares');
   check(await page.locator('#emblemas [data-v9-item]').count()===101,'INDEX must contain all 101 global classics');
   check(await page.locator('#raros .v9-family').count()===23,'Rare families must be grouped as 23 collections');
   check(await page.locator('#emblemas .v9-family').count()===7,'Badge lineages must be grouped as seven collections');
   check(await page.locator('#raros .v9-family-index a').count()===23,'Rare family quick access missing');
   check(await page.locator('#emblemas .v9-family-index a').count()===7,'Badge family quick access missing');
   check(await page.locator('[data-v9-item][href*="badge-br"]').count()===0,'BR/PT regional badges leaked');
   check(await page.locator('[data-v9-item] img[src*="/v5/badges/"]').count()===0,'BR/PT badge assets leaked');
   check(await page.locator('#raros .v9-family').last().isVisible(),'Last rare family must be rendered, not gated');
   check(await page.locator('#emblemas .v9-family').last().isVisible(),'Last badge group must be rendered, not gated');
   check(await page.locator('text=/Mostrar todas as famílias|Show all families/i').count()===0,'Show-all gate leaked');
   check(await page.locator('script[src="/habbo/assets/v9-home.js"]').count()===1,'V9 viewer script missing');

   // Grouped specimens live and are inspectable directly in index, no separate gallery visit required.
   await page.locator('#raros .v9-home-item').first().click();
   check(await page.locator('[data-v9-dialog][open]').count()===1,'Rare must open on homepage');
   const before=await page.locator('[data-v9-dialog-title]').innerText();
   await page.locator('[data-v9-dialog-step="1"]').click();
   check((await page.locator('[data-v9-dialog-title]').innerText())!==before,'In-home rare gallery next broken');
   check((await page.locator('[data-v9-dialog-link]').getAttribute('href')).includes('/raro/') ||
      (await page.locator('[data-v9-dialog-link]').getAttribute('href')).includes('/rare/'),'No rare historical detail');
   await page.keyboard.press('Escape');
   check(await page.locator('[data-v9-dialog][open]').count()===0,'Escape did not close in-home rare viewer');

   await page.locator('#emblemas .v9-home-item').first().click();
   check(await page.locator('[data-v9-dialog][open]').count()===1,'Badge must open in homepage');
   check(await page.locator('[data-v9-dialog-image]').evaluate(img=>img.complete&&img.naturalWidth>0),'Original badge sprite missing');
   check((await page.locator('[data-v9-dialog-link]').getAttribute('href')).includes('/classic-'),'Badge historical detail link missing');
   await page.keyboard.press('Escape');

   // No offscreen rail may widen the entire document on mobile.
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'Index has horizontal overflow');
   check(errors.length===0,'JS errors '+errors.join(' / '));
   await page.locator('#raros').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(evidence,locale+'-'+device+'-raros.png'),fullPage:false});
   await page.locator('#emblemas').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(evidence,locale+'-'+device+'-emblemas.png'),fullPage:false});
   await ctx.close();
  }
 }
 // No JavaScript: direct static links to source records must still work.
 const noScript=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const page=await noScript.newPage();
 await page.goto(base+'/pt-br/',{waitUntil:'load'});
 check(await page.locator('#raros [data-v9-item]').count()===69,'No-JS rare inventory incomplete');
 check(await page.locator('#emblemas [data-v9-item]').count()===101,'No-JS global badge inventory incomplete');
 check((await page.locator('#raros [data-v9-item]').first().getAttribute('href')).includes('/raro/'),'No-JS fallback link absent');
 await noScript.close();
} finally {await browser.close();}
fs.writeFileSync(path.join(evidence,'report.json'),JSON.stringify({checks:total,status:'passed'},null,2));
console.log('V9 COMPLETE INDEX: '+total+' browser checks passed');
