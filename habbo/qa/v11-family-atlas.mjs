import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'qa/v11-artifacts');
fs.mkdirSync(out,{recursive:true});
const base='http://127.0.0.1:4173/habbo/';
const browser=await chromium.launch({headless:true});
let checks=0;
function check(value,message){assert.ok(value,message);checks++;}
try {
 for(const [lang,route] of [['pt','pt-br/'],['en','en/'],['root','']]){
  for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
   const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await ctx.newPage(),errors=[],requests=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('requestfailed',request=>requests.push(request.url()));
   await page.goto(base+route,{waitUntil:'networkidle'});
   check(await page.locator('.cinematic-dock').count()===1,'Preserve the original Places dock');
   check(await page.locator('html.v11-family-ready').count()===1,'V11 enhancement not running');
   check(await page.locator('link[href*="v11-home.css?v=20261019-v11.1"]').count()===1,'V11 CSS missing');
   check(await page.locator('script[src*="v11-home.js?v=20261019-v11.1"]').count()===1,'V11 JS missing');
   check(await page.locator('#raros [data-v9-item]').count()===69,'All 69 rares must remain in home DOM');
   check(await page.locator('#emblemas [data-v9-item]').count()===101,'All 101 global badges must remain in home DOM');
   check(await page.locator('[href*="badge-br"]').count()===0,'Regional BR/PT badges must not be exposed');
   check(await page.locator('.v9-home-dialog').count()===1,'One gallery viewer exactly');
   check(await page.locator('.v10-family-pager').count()===0,'Competing family pager arrows should be gone');
   for(const [id,num] of [['raros',23],['emblemas',7]]){
    const c='#'+id;
    check(await page.locator(c+' .v11-family-grid').count()===1,id+' needs the visible directory');
    check(await page.locator(c+' .v11-family-grid a').count()===num,id+' family inventory mismatch');
    check(await page.locator(c+' .v11-family-grid a:visible').count()===num,id+' hides family links');
    check(await page.locator(c+' .v11-family-grid').evaluate(nav=>{
      const css=getComputedStyle(nav);
      return css.display==='grid' && css.overflowX==='visible' && nav.scrollWidth<=nav.clientWidth+2;
    }),id+' family directory must be a non-scrolling grid');
    check(await page.locator(c+' .v9-family:visible').count()===1,id+' should show one specimen rail at a time');
    check(await page.locator(c+' .v11-family-grid a[aria-current="location"]').count()===1,id+' needs clear active tile');
    check(await page.locator(c+' .v11-family-grid a').evaluateAll(links=>
      links.every(link=>!!link.querySelector('img') && !!link.querySelector('.v11-family-name') &&
        !!link.querySelector('.v11-family-count') && document.getElementById(link.getAttribute('aria-controls')))
    ),id+' directory links must show native image, name, count and valid destination');
   }
   await page.locator('#raros .v11-family-directory').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(out,lang+'-'+device+'-family-overview.png')});
   const allRares=page.locator('#raros .v11-family-grid a');
   // Direct access to the last family avoids stepping through all 23 with arrows.
   const last=allRares.last();
   const controlled=await last.getAttribute('aria-controls');
   await last.click();
   check(await page.locator('#'+controlled+':visible').count()===1,'Last rare family must open directly');
   check(await last.getAttribute('aria-current')==='location','Direct selection must mark its tile');
   check(await page.locator('#raros .v9-family:visible').count()===1,'Rare selection must not stack families');
   const back=page.locator('#'+controlled+' .v11-return');
   check(await back.count()===1,'Family gallery must offer return to all families');
   await back.click();
   check(page.url().includes('#raros-familias'),'Return link must target visible directory');
   await page.locator('#raros .v11-family-grid a[href$="dj-turntable"]').click();
   const dj=page.locator('#raros .v9-family:visible .v9-item-art img').first();
   await dj.scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>{
    const el=document.querySelector('#raros .v9-family[data-v11-active="true"] .v9-item-art img');
    return el?.complete && el.naturalWidth===62 && el.naturalHeight===50;
   },null,{timeout:15000});
   check(await dj.evaluate(el=>el.naturalWidth===62 && el.naturalHeight===50),'Original full-sized DJ sprite must remain');
   await page.locator('#raros .v9-family:visible .v9-home-item').first().click();
   check(await page.locator('.v9-home-dialog[open]').count()===1,'Lightbox opens from selected family');
   await page.keyboard.press('Escape');
   check(await page.locator('.v9-home-dialog[open]').count()===0,'Lightbox Escape closes');
   await page.locator('#emblemas .v11-family-directory').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(out,lang+'-'+device+'-badge-overview.png')});
   await page.locator('#emblemas .v11-family-grid a').last().click();
   check(await page.locator('#emblemas .v11-family-grid a[aria-current="location"]').count()===1,'Badge direct selection works');
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'Horizontal viewport overflow');
   check(errors.length===0,'Browser errors: '+errors.join('; '));
   check(requests.length===0,'Failed network requests: '+requests.join('; '));
   await ctx.close();
  }
 }
 const ctx=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});
 const page=await ctx.newPage();
 await page.goto(base+'pt-br/',{waitUntil:'load'});
 check(await page.locator('#raros .v11-family-grid a:visible').count()===23,'No-JS rare directory missing');
 check(await page.locator('#emblemas .v11-family-grid a:visible').count()===7,'No-JS badge directory missing');
 check(await page.locator('#raros .v9-family:visible').count()===23,'No-JS all 23 rare family galleries');
 check(await page.locator('#emblemas .v9-family:visible').count()===7,'No-JS all 7 badge family galleries');
 await ctx.close();
} finally {await browser.close();}
const report={status:'passed',checks};
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
console.log('V11 ATLAS QA PASS',checks);
