import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.dirname(fileURLToPath(import.meta.url)),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('v19-night.css');let n=0;const check=(x,msg)=>{assert.ok(x,msg);n++};
check(css.includes('--orange:#f4a22a'),'orange design tokens');
check(css.includes('.v19-button--orange'),'orange Habbo buttons');
check(css.includes('.dock-control'),'native Dock orange controls');
const routes=[['pt','index.html','/habbo/beta/'],['en','en/index.html','/habbo/beta/en/']];
for(const [lang,file] of routes){
 const html=read(file);const count=rx=>(html.match(rx)||[]).length;
 check(html.includes('class="habbo-v19-night"'),lang+' fresh V19 shell');
 check(!html.includes('v18-arrival')&&!html.includes('v18-classic.css'),lang+' no old hero/style');
 check(count(/data-v9-item(?=\s|>)/g)===249,lang+' 249 museum objects');
 check(count(/data-v17-person=/g)===12,lang+' 12 Staff');
 check(html.includes('data-total="29"')&&html.includes('data-item-total="36"'),lang+' 29 groups 36 scenes');
 check(html.includes('data-autoplay-ms="4000"'),lang+' native autoplay');
 check(html.includes('flecha-hc-room.gif')&&html.includes('mordomo-classic.gif')&&html.includes('prefeita-classic.gif'),lang+' canonical captures');
 check(html.includes('noindex,nofollow,noarchive'),lang+' beta noindex');
 check(html.includes('href="/habbo/beta/en/"')&&html.includes('href="/habbo/beta/"'),lang+' bilingual beta navigation');
 check(html.includes('classic.html'),lang+' preserved Classic link');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,,route] of routes){
  for(const [device,width,height] of [['desktop',1440,900],['tablet',1024,768],['mobile',390,844],['tiny',320,720]]){
   const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.url().includes('/habbo/')&&r.status()>=400)errors.push(r.status()+' '+r.url())});
   await page.goto('http://127.0.0.1:4173'+route,{waitUntil:'networkidle'});
   const p=lang+' '+device;
   check(await page.locator('.v19-theatre').count()===1,p+' new dark theatre');
   check(await page.locator('#lugares.cinematic-dock [data-dock-slide]').count()===29,p+' native 29 rooms');
   check(await page.locator('#raros [data-v9-item]').count()===148,p+' 148 rares');
   check(await page.locator('#emblemas [data-v9-item]').count()===101,p+' 101 badges');
   check(await page.locator('#gerentes [data-v17-person]').count()===12,p+' 12 Staff');
   check(await page.locator('#gerentes [data-v17-rail]').count()===1,p+' one Staff rail');
   check(await page.locator('.collection-switch a').count()===4,p+' 4 tabs');
   check(await page.locator('.v19-button--orange').count()===1,p+' orange CTA');
   check(await page.locator('.v19-classic-link').getAttribute('href')==='/habbo/beta/'+(lang==='en'?'en/':'')+'classic.html',p+' Classic link');
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+3),p+' no horizontal body overflow');
   if(device==='mobile'){
    await page.locator('.collection-switch a[href="#raros"]').click();
    check(await page.evaluate(()=>location.hash)==='#raros',p+' native anchors');
    await page.locator('#raros [data-v9-item]').first().click();
    check(await page.locator('[data-v9-dialog]').evaluate(x=>x.open),p+' historical modal');
    await page.locator('[data-v9-close]').click();
    await page.locator('#gerentes [data-v17-scroll="1"]').click();
    await page.waitForTimeout(550);
    check(await page.locator('#gerentes [data-v17-rail]').evaluate(x=>x.scrollLeft>0),p+' Staff scroll');
    const next=lang==='pt'?'/habbo/beta/en/':'/habbo/beta/';
    await page.locator('.lang-toggle a[data-lang="'+(lang==='pt'?'en':'pt-br')+'"]').first().click();
    await page.waitForURL(url=>url.pathname===next);
    check(new URL(page.url()).pathname===next,p+' language stays in beta');
   }
   check(errors.length===0,p+' no runtime or asset errors '+errors.join(';'));
   await page.locator('.v19-theatre').scrollIntoViewIfNeeded();
   await page.screenshot({path:'/tmp/habbo-v19-'+lang+'-'+device+'.png',animations:'disabled'});
   await ctx.close();
  }
 }
 const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:720}}),page=await ctx.newPage();
 await page.goto('http://127.0.0.1:4173/habbo/beta/',{waitUntil:'load'});
 check(await page.locator('#raros [data-v9-item]').count()===148,'No-JS rares');
 check(await page.locator('#gerentes [data-v17-person]').count()===12,'No-JS Staff');
 await ctx.close();
}finally{await browser.close()}
console.log('HABBO NIGHT HOTEL V19 PASS '+n+' checks');
