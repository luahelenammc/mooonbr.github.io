import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const beta=path.dirname(fileURLToPath(import.meta.url));
const read=(p)=>fs.readFileSync(path.join(beta,p),'utf8');
const checks=[];
const ok=(condition,name)=>{assert.ok(condition,name);checks.push(name);};
const pages=[['pt','index.html','/habbo/beta/'],['en','en/index.html','/habbo/beta/en/']];
const css=read('v18-classic.css');
ok(css.includes('body.habbo-v18-beta'),'scoped classic design tokens');
ok(css.includes('.cinematic-dock'),'actual Hotel View restyled');
for(const [locale,file] of pages){
 const html=read(file);
 ok(html.includes('class="habbo-v18-beta"'),locale+' themed body');
 ok(html.includes('/habbo/beta/v18-classic.css'),locale+' theme loaded');
 ok(html.includes('class="v18-arrival"'),locale+' reception hero');
 ok(html.includes('class="v18-hotel-heading"'),locale+' Hotel View chrome');
 ok((html.match(/class="v18-chapter-chrome"/g)||[]).length===3,locale+' three chapter windows');
 ok((html.match(/data-v9-item(?=\s|>)/g)||[]).length===249,locale+' 249 records');
 ok((html.match(/data-v17-person=/g)||[]).length===12,locale+' 12 historic Staff');
 ok(html.includes('data-autoplay-ms="4000"'),locale+' 4 second Dock');
 ok(html.includes('data-total="29"')&&html.includes('data-item-total="36"'),locale+' 29/36 Places contract');
 ok(html.includes('flecha-hc-room.gif'),locale+' Flecha HC survives');
 ok(html.includes('prefeita-classic.gif'),locale+' Prefeita survives');
 ok(html.includes('href="/habbo/beta/en/"')&&html.includes('href="/habbo/beta/"'),locale+' language beta continuity');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [locale,,route] of pages){
  for(const [device,width,height] of [['desktop',1440,900],['tablet',1024,768],['mobile',390,844],['tiny',320,720]]){
   const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.url().includes('/habbo/')&&r.status()>=400)errors.push(r.status()+' '+r.url());});
   await page.goto('http://127.0.0.1:4173'+route,{waitUntil:'networkidle'});
   const px=locale+' '+device;
   ok(await page.locator('.v18-arrival').count()===1,px+' reception visible');
   ok(await page.locator('#lugares.cinematic-dock').count()===1,px+' original Dock');
   ok(await page.locator('#raros [data-v9-item]').count()===148,px+' 148 rares');
   ok(await page.locator('#emblemas [data-v9-item]').count()===101,px+' 101 badges');
   ok(await page.locator('#gerentes [data-v17-person]').count()===12,px+' 12 managers');
   ok(await page.locator('.collection-switch a').count()===4,px+' nav tabs');
   ok(await page.locator('.v18-chapter-chrome').count()===3,px+' classic chapter windows');
   ok(await page.locator('.v18-arrival').evaluate(e=>getComputedStyle(e).display==='grid'),px+' classic CSS loaded');
   ok(await page.locator('.cinematic-dock').evaluate(e=>getComputedStyle(e).width!=='0px'),px+' Dock measurable');
   ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+3),px+' no page overflow');
   ok(await page.locator('.v18-visual-window img').evaluate(i=>i.complete&&i.naturalWidth>0),px+' archival image loaded');
   if(device==='mobile'){
    await page.locator('.collection-switch a[href="#raros"]').click();
    ok(await page.evaluate(()=>location.hash)==='#raros',px+' tab navigation');
    await page.locator('#raros [data-v9-item]').first().click();
    ok(await page.locator('[data-v9-dialog]').evaluate(el=>el.open),px+' historic item dialog opens');
    await page.locator('[data-v9-close]').click();
    await page.locator('#gerentes [data-v17-scroll="1"]').click();
    await page.waitForTimeout(500);
    ok(await page.locator('#gerentes [data-v17-rail]').evaluate(el=>el.scrollLeft>0),px+' Staff scroll works');
   }
   ok(errors.length===0,px+' no asset or JS failure: '+errors.join('; '));
   await page.locator('.v18-arrival').scrollIntoViewIfNeeded();
   await page.screenshot({path:'/tmp/habbo-v18-'+locale+'-'+device+'.png'});
   await context.close();
  }
 }
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:720}});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:4173/habbo/beta/',{waitUntil:'load'});
 ok(await page.locator('#raros [data-v9-item]').count()===148,'static rare gallery works without JS');
 ok(await page.locator('#gerentes [data-v17-person]').count()===12,'Staff gallery works without JS');
 await context.close();
} finally {await browser.close();}
console.log('HABBO V18 CLASSIC BETA · PASS '+checks.length+' checks · 2 languages × 4 viewports');
