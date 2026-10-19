import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'qa/v6-global-artifacts');
fs.mkdirSync(output,{recursive:true});
const base=(process.env.HABBO_QA_URL||'http://127.0.0.1:4173/habbo').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
let passes=0;
const check=(ok,msg)=>{if(!ok)throw Error(msg);passes++;};
try {
 for(const [name,route] of [['pt','pt-br/emblemas/'],['en','en/badges/']]){
  for(const [viewportName,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
   const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await ctx.newPage();const errs=[];
   page.on('pageerror',e=>errs.push(e.message));
   await page.goto(base+'/'+route,{waitUntil:'networkidle'});
   check(await page.locator('.v6-global').count()===1,'missing V6 global stage');
   check(await page.locator('.v6-global-groups button').count()===4,'missing four global series');
   check(await page.locator('.v6-global-chips button').count()===2,'HC default not two codes');
   check(await page.locator('.v6-global-stage').getAttribute('data-v6-active')==='HC1','HC1 must lead');
   check(await page.locator('.grid.badges .item').count()===62,'regional V5 catalogue must stay');
   await page.screenshot({path:path.join(output,name+'-'+viewportName+'-hc.png')});
   await page.locator('.v6-global-groups button').nth(1).click();
   check(await page.locator('.v6-global-chips button').count()===5,'five HC levels');
   await page.locator('.v6-global-chips button').nth(4).click();
   check(await page.locator('.v6-global-stage').getAttribute('data-v6-active')==='ACH_BasicClub5','HC level five code');
   await page.locator('.v6-global-groups button').nth(2).click();
   check(await page.locator('.v6-global-chips button').count()===5,'five VIP levels');
   await page.locator('.v6-global-groups button').nth(3).click();
   check(await page.locator('.v6-global-stage').getAttribute('data-v6-active')==='EHR','cross-hotel EHR');
   check(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1)===false,'overflow');
   check(errs.length===0,'JS error: '+errs);
   await page.screenshot({path:path.join(output,name+'-'+viewportName+'-ehr.png')});
   await ctx.close();
  }
 }
}finally{await browser.close()}
fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks:passes,status:'passed'},null,2));
console.log('V6 global-first no-new-assets QA: '+passes+' checks passed');
