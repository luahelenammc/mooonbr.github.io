import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ledger=JSON.parse(fs.readFileSync(path.join(root,'v10/full-render-ledger.json'),'utf8'));
const out=path.join(root,'qa/v10-index-artifacts');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const base='http://127.0.0.1:4173/habbo/';
let checks=0;const check=(value,description)=>{assert.ok(value,description);checks++};
try{
 for(const [lang,route] of [['pt','pt-br/'],['en','en/'],['root','']]){
  for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
   const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await ctx.newPage(),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('requestfailed',r=>failed.push(r.url()));
   await page.goto(base+route,{waitUntil:'networkidle'});
   check(await page.locator('.cinematic-dock').count()===1,'Places Dock must remain');
   check(await page.locator('html.v10-family-ready').count()===1,'V10 progressive enhancement unavailable');
   check(await page.locator('link[href*="v10-home.css?v=20261019-v10.1"]').count()===1,'cache-busted CSS absent');
   check(await page.locator('script[src*="v10-home.js?v=20261019-v10.1"]').count()===1,'cache-busted JS absent');
   check(await page.locator('#raros [data-v9-item]').count()===69,'69 rare objects must remain in index DOM');
   check(await page.locator('#emblemas [data-v9-item]').count()===101,'101 classic global badges must remain in index DOM');
   check(await page.locator('#raros .v9-family').count()===23,'23 rare families missing');
   check(await page.locator('#emblemas .v9-family').count()===7,'7 global badge families missing');
   console.log('V10_STYLE_DIAGNOSTIC',lang,device,await page.evaluate(()=>{
    const s=document.querySelector('#raros .v9-family');
    const hidden=[...document.querySelectorAll('#raros .v9-family')].filter(x=>getComputedStyle(x).display==='none').length;
    const css=[...document.styleSheets].map(x=>x.href).filter(Boolean);
    return {htmlClass:document.documentElement.className,visible:[...document.querySelectorAll('#raros .v9-family')].filter(x=>x.getClientRects().length>0).length,
     hidden,firstAttrs:s?.getAttribute('data-v10-active'),firstDisplay:s?getComputedStyle(s).display:'',
     css:css.filter(x=>x.includes('v10-home'))};
   }));
   for(const id of ['raros','emblemas']){
    check(await page.locator('#'+id+' .v9-family:visible').count()===1,id+' must show only one group at a time');
    check(await page.locator('#'+id+' .v10-family-pager button').count()===2,id+' group arrows missing');
    check(await page.locator('#'+id+' .v9-family-index').evaluate(el=>{
     const s=getComputedStyle(el);return s.display==='flex' && s.overflowX==='auto'
    }),id+' chips are visually unstyled');
    check(await page.locator('#'+id+' .v10-family-pager button').first().evaluate(el=>{
      const s=getComputedStyle(el);return s.borderRadius!=='0px'&&s.backgroundColor!=='rgb(255, 255, 255)'
    }),id+' pager has white unstyled buttons');
   }
   await page.locator('#raros').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(out,lang+'-'+device+'-rares.png')});
   const oldFam=await page.locator('#raros .v9-family:visible h3').textContent();
   await page.locator('#raros .v10-family-pager button').last().click();
   check((await page.locator('#raros .v9-family:visible h3').textContent())!==oldFam,'next rare family broken');
   await page.locator('#raros .v9-family-index a[href$="dj-turntable"]').click();
   const img=page.locator('#raros .v9-family:visible .v9-item-art img').first();
   await img.scrollIntoViewIfNeeded();
   check(await img.evaluate(el=>el.complete&&el.naturalWidth===62&&el.naturalHeight===50),'DJ full room sprite not delivered');
   await page.locator('#raros .v9-family-index a[href$="crusoes-hammock"]').click();
   const ham=page.locator('#raros .v9-family:visible .v9-item-art img').first();
   check(await ham.evaluate(el=>el.complete&&el.naturalWidth===110&&el.naturalHeight===111),'Hammock original room sprite missing');
   await page.locator('#raros .v9-family:visible .v9-home-item').first().click();
   check(await page.locator('.v9-home-dialog[open]').count()===1,'real furniture lightbox does not open');
   check(await page.locator('[data-v9-dialog-image]').evaluate(el=>el.naturalWidth===110),'lightbox still uses inventory icon');
   await page.keyboard.press('Escape');
   await page.locator('#raros .v9-family-index a[href$="infobus-poster"]').click();
   check(await page.locator('#raros .v9-family:visible .v9-item-art img').first().evaluate(el=>el.complete&&el.naturalWidth===58&&el.naturalHeight===58),'native Infobus poster sprite missing');
   await page.locator('#emblemas').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(out,lang+'-'+device+'-badges.png')});
   await page.locator('#emblemas .v10-family-pager button').last().click();
   check(await page.locator('#emblemas .v9-family:visible').count()===1,'badge group navigator broken');
   check(await page.locator('[href*="badge-br"]').count()===0,'Regional BR/PT badge links must not reappear');
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'mobile overflow');
   check(errors.length===0,'JS errors: '+errors.join(';'));
   check(failed.length===0,'network failures: '+failed.join(';'));
   await ctx.close();
  }
 }
 // Progressive enhancement requirement: all archival image links survive if script cannot run.
 const ctx=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});
 const page=await ctx.newPage();await page.goto(base+'pt-br/',{waitUntil:'load'});
 check(await page.locator('#raros .v9-family:visible').count()===23,'No JS should show all 23 rare families');
 check(await page.locator('#emblemas .v9-family:visible').count()===7,'No JS should show all 7 badge families');
 await ctx.close();
}finally{await browser.close()}
console.log('V10 DEBUG QA PASS',checks);
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,status:'passed'},null,2));
