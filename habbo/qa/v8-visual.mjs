import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'qa','v8-evidence');
fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true});
const base='http://127.0.0.1:4173/habbo';
let count=0;const check=(v,msg)=>{assert.ok(v,msg);count++};
try{
 for(const [locale,rootRoute,rareRoute,badgeRoute] of [
  ['pt','pt-br/','pt-br/raros/','pt-br/emblemas/'],
  ['en','en/','en/rares/','en/badges/']
 ]){
  for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
   const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await ctx.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/'+rootRoute,{waitUntil:'networkidle'});
   check(await page.locator('.cinematic-dock').count()===1,'Places Dock must remain');
   check(await page.locator('#raros.v8-home-chapter').count()===1,'rare index chapter missing');
   check(await page.locator('#emblemas.v8-home-chapter').count()===1,'global badges index chapter missing');
   check(await page.locator('#raros .v8-home-rail img').count()>=9,'rare image rail missing');
   check(await page.locator('#emblemas .v8-home-rail img').count()>=10,'badge image rail missing');
   check(await page.locator('.collection-switch a[href="#raros"]').count()===1,'chapter navigation must remain in index');
   await page.screenshot({path:path.join(dir,locale+'-'+device+'-index.png'),fullPage:false});
   await page.locator('#emblemas').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(dir,locale+'-'+device+'-chapters.png')});
   await page.goto(base+'/'+rareRoute,{waitUntil:'networkidle'});
   check(await page.locator('body.v8-rares').count()===1,'new rare template missing');
   check(await page.locator('.v8-specimen[data-v8-item]').count()===69,'69 rare specimens required');
   check(await page.locator('.v8-family').count()===11,'ten lineages plus standalone rarities must remain');
   check(await page.locator('#family-v12-rare-avulsos .v8-specimen').count()===14,'all 14 standalone rares must be present in archive');
   check(await page.locator('#family-eggs').count()===1,'legacy rare anchor preserved');
   check(await page.locator('.v8-family').first().isVisible(),'first family not visible');
   check(await page.locator('.v8-family').last().isVisible(),'last family not visible');
   check(await page.getByText('Ver todas as famílias').count()===0,'legacy show-all UX not allowed');
   await page.locator('.v8-family').nth(1).locator('.v8-specimen').first().click();
   check(await page.locator('.v8-lightbox[open]').count()===1,'rare lightbox');
   await page.keyboard.press('Escape');
   check(await page.locator('.v8-lightbox[open]').count()===0,'rare lightbox Escape');
   await page.screenshot({path:path.join(dir,locale+'-'+device+'-rares.png')});
   await page.goto(base+'/'+badgeRoute,{waitUntil:'networkidle'});
   check(await page.locator('body.v8-badges').count()===1,'global badges template missing');
   check(await page.locator('.v8-specimens--badges .v8-specimen').count()===101,'101 international badges required');
   check(await page.locator('.v8-family').count()===7,'seven global badge lineages');
   check(await page.getByText('Ver todos').count()===0,'legacy show more UX not allowed');
   check(await page.getByText('Arquivo Brasil/Portugal').count()===0,'regional gallery must be excluded');
   check(await page.locator('[src*="/v5/badges/"]').count()===0,'regional badge sprite still in public gallery');
   check(await page.locator('[href*="/badge-br"]').count()===0,'regional links leaked');
   await page.locator('.v8-specimen').nth(3).click();
   check(await page.locator('.v8-lightbox[open]').count()===1,'badge lightbox');
   check(await page.locator('.v8-lightbox[open] [data-v8-dialog-link]').getAttribute('href')?.then(v=>v.includes('/classic-')),'historic global badge detail link');
   await page.keyboard.press('Escape');
   await page.screenshot({path:path.join(dir,locale+'-'+device+'-badges.png')});
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'page horizontal overflow');
   check(errors.length===0,'browser JavaScript errors: '+errors.join(';'));
   await ctx.close();
  }
 }
}finally{await browser.close()}
fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify({checks:count,passed:true},null,2));
console.log('V8 unified museum Chromium pass '+count+' checks');
