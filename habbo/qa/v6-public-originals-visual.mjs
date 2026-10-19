import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'qa/v6-originals-artifacts');
fs.mkdirSync(out,{recursive:true});
const base=(process.env.HABBO_QA_URL || 'http://127.0.0.1:4173/habbo').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++};
try{
 for(const [lang,rare,badge] of [
  ['pt','pt-br/raros/','pt-br/emblemas/'],
  ['en','en/rares/','en/badges/']
 ]){
  for(const [form,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
   const c=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await c.newPage(), errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/'+badge,{waitUntil:'networkidle'});
   check(await page.locator('html[data-v6-images-allowed="true"]').count()===1,'V6 badge enablement missing');
   if(await page.locator('.v7-classic').count()===1){
     check(await page.locator('.v7-classic').isVisible(),'historic international badge exhibition must be visible');
     check(await page.locator('.v7-main-sprite').evaluate(img=>img.complete&&img.naturalWidth>0),'V7 historical badge image must load');
     check(await page.locator('.grid.badges .item').count()===62,'regional BR/PT archive must be preserved');
     await page.screenshot({path:path.join(out,lang+'-'+form+'-global-badges.png')});
   }else{
   check(await page.locator('.v6-global-code img.v6-verified-original').count()===1,'original badge pixel image missing');
   check(await page.locator('.v6-global-code img').evaluate(img=>img.complete&&img.naturalWidth>0),'original HC1 GIF not loaded');
   const badgeSrc=await page.locator('.v6-global-code img').getAttribute('src');
   check(badgeSrc.includes('/assets/v6/badges/HC1.gif'),'wrong HC1 image');
   check(await page.locator('.grid.badges .item').count()===62,'regional badges lost');
   await page.screenshot({path:path.join(out,lang+'-'+form+'-global-badges.png')});
   await page.locator('.v6-global-groups button').nth(2).click();
   await page.locator('.v6-global-chips button').nth(4).click();
   check((await page.locator('.v6-global-code img').getAttribute('src')).includes('ACH_VipClub5.gif'),'wrong VIP5 image');
   const link=await page.locator('.v6-global-source').getAttribute('href');
   check(link.includes('/badge/')||link.includes('/emblema/'),'global original detail page not linked');
   await page.goto('http://127.0.0.1:4173'+link,{waitUntil:'networkidle'});
   check(await page.locator('.detail img').evaluate(img=>img.complete&&img.naturalWidth>0),'global detail badge broken');
   }
   await page.goto(base+'/'+rare,{waitUntil:'networkidle'});
   check(await page.locator('.grid.rares .item').count()===69,'V6 rare corpus is not 69');
   const rareLink=(lang==='pt'?'/pt-br/raro/holiday-romance/':'/en/rare/holiday-romance/');
   await page.goto(base+rareLink,{waitUntil:'networkidle'});
   check(await page.locator('.detail .stage img').evaluate(img=>img.complete&&img.naturalWidth>0),'new rare sprite missing');
   check(await page.locator('.detail .stage img').getAttribute('src')!==null,'new rare image path empty');
   check(await page.evaluate(()=>document.documentElement.scrollWidth <= document.documentElement.clientWidth+1),'page overflow');
   check(errors.length===0,'page JS errors '+errors.join(' / '));
   await page.screenshot({path:path.join(out,lang+'-'+form+'-rare-detail.png')});
   await c.close();
  }
 }
}finally{await browser.close()}
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({checks,status:'passed'},null,2));
console.log('V6 PUBLIC original-art test PASS '+checks+' checks');
