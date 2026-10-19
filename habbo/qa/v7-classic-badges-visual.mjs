import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const evidence=path.join(root,'qa/v7-classic-artifacts');
fs.mkdirSync(evidence,{recursive:true});
const base=(process.env.HABBO_QA_URL||'http://127.0.0.1:4173/habbo').replace(/\/$/,'');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/v7-classics.json'),'utf8'));
assert.ok(catalog.records.length>=58,'Classic gallery must have many authentic globals');
assert.ok(catalog.coverage.newlyVerified>=45,'Global expansion must be substantive');
const sampleByCode=new Map(catalog.records.map(r=>[r.code,r]));
for(const code of ['HC1','ADM','XXX','HX1','BTB','SNW','WBL','GLA','GL1']){
 assert.ok(sampleByCode.has(code),'Missing iconic original '+code);
}
const browser=await chromium.launch({headless:true});
let checks=0; const test=(v,msg)=>{assert.ok(v,msg);checks++};
try{
 for(const [lang,route] of [['pt','pt-br/emblemas'],['en','en/badges']]){
  for(const [screen,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
   const context=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await context.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/'+route+'/',{waitUntil:'networkidle'});
   await page.waitForSelector('.v7-tile');
   test(await page.locator('.v7-global').count()===1,'Missing global stage');
   test(await page.locator('.v6-global').count()===0,'Old HC-only stage leaked');
   test(await page.locator('.v7-tile').count()>=10,'Highlights should expose multiple classic originals');
   test(await page.locator('.grid.badges .item').count()===62,'Regional BR/PT catalogue damaged');
   test(await page.locator('.v7-main-image').evaluate(img=>img.complete&&img.naturalWidth>0),'Global hero image broken');
   test(await page.locator('.v7-tile-image').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)),'Broken global thumbnails');
   test(await page.locator('.v7-tabs button').count()>=7,'Family filters missing');
   const buttons=page.locator('.v7-tabs button');
   await buttons.nth(1).click(); // "All"
   test(await page.locator('.v7-tile').count()===catalog.records.length,'All global collection incomplete');
   test(await page.locator('.v7-tile img').evaluateAll(imgs=>imgs.every(i=>i.getAttribute('src')?.includes('.gif'))),'Fake/pseudo sprites in grid');
   await page.locator('button.v7-tile[data-code="BTB"]').click();
   test((await page.locator('.v7-code').innerText()).startsWith('BTB'),'Selection does not change main sprite');
   await page.locator('.v7-main-art').click();
   test(await page.locator('dialog.v7-lightbox[open]').count()===1,'Lightbox open failed');
   test(await page.locator('.v7-large-image').evaluate(img=>img.complete&&img.naturalWidth>0),'Lightbox image not loaded');
   await page.keyboard.press('Escape');
   test(await page.locator('dialog.v7-lightbox[open]').count()===0,'Escape lightbox failed');
   test(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'Page horizontal overflow');
   test(errors.length===0,'JavaScript errors '+errors.join('; '));
   await page.screenshot({path:path.join(evidence,lang+'-'+screen+'-classics.png'),fullPage:false});
   await page.screenshot({path:path.join(evidence,lang+'-'+screen+'-all-scroll.png'),fullPage:true});
   await context.close();
  }
 }
}finally{await browser.close()}
fs.writeFileSync(path.join(evidence,'report.json'),JSON.stringify({checks,archivalCoverage:catalog.coverage,status:'passed'},null,2));
console.log('V7 CLASSIC GLOBAL BADGES QA PASS',checks,catalog.coverage);
