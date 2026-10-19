import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'qa/v7-classic-artifacts');
fs.mkdirSync(dir,{recursive:true});
const base=(process.env.HABBO_QA_URL||'http://127.0.0.1:4173/habbo').replace(/\/$/,'');
let passed=0;
const check=(x,msg)=>{assert.ok(x,msg);passed++;};
const browser=await chromium.launch({headless:true});
try{
 for(const [language,route] of [['pt','pt-br/emblemas/'],['en','en/badges/']]){
  for(const [view,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
   const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await ctx.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const res=await page.goto(base+'/'+route,{waitUntil:'networkidle'});
   check(res.status()===200,'HTML not delivered');
   await page.locator('.v7-classic').waitFor({timeout:15000});
   check(await page.locator('.v7-classic').isVisible(),'classic section not mounted');
   check(await page.locator('.v6-global').isHidden(),'old 13-badge primary panel is still competing with classics');
   check(await page.locator('.v7-filter').count()===8,'expected 7 families plus All');
   const ledger=await page.evaluate(async()=>await(await fetch('/habbo/assets/v7-classic-badges.json')).json());
   check(ledger.items.length>=58,'missing historic classic badges; got '+ledger.items.length);
   check(ledger.items.some(x=>x.code==='WBL'),'Wobble Squabble absent');
   check(ledger.items.some(x=>x.code==='ADM'),'Staff absent');
   check(ledger.items.some(x=>x.code==='BTB'),'Battle Ball absent');
   check(ledger.items.some(x=>x.code==='SNW'),'SnowStorm absent');
   check(ledger.items.some(x=>x.code==='XXX'),'Habbo X absent');
   check(await page.locator('.grid.badges .item').count()===62,'regional archive lost');
   const t=page.locator('.v7-big-image img');
   check(await t.evaluate(x=>x.complete&&x.naturalWidth>5),'main classic badge artwork broken');
   await page.locator('.v7-filter').last().click();
   check(await page.locator('.v7-badge-tile').count()>0,'last family has no display');
   await page.locator('.v7-filter').first().click();
   check(await page.locator('.v7-badge-tile').count()>20,'All filter is not populated');
   await page.locator('.v7-badge-tile').nth(1).click();
   check((await page.locator('.v7-badge-tile[aria-pressed="true"]').count())===1,'selection not unique');
   await page.locator('.v7-big-image').click();
   check(await page.locator('.v7-lightbox[open]').count()===1,'lightbox not open');
   await page.keyboard.press('Escape');
   check(await page.locator('.v7-lightbox[open]').count()===0,'Escape did not close');
   await page.screenshot({path:path.join(dir,language+'-'+view+'-classic.png'),fullPage:false});
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'horizontal overflow');
   check(errors.length===0,'page JS errors: '+errors.join(' / '));
   await ctx.close();
  }
 }
}finally{await browser.close()}
fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify({checks:passed,status:'passed'},null,2));
console.log('V7 historic classics browser QA PASS '+passed);
