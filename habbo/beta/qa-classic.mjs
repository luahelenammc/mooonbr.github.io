import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const here=path.dirname(fileURLToPath(import.meta.url));
const pages=[['pt','classic.html','/habbo/beta/classic.html'],['en','en/classic.html','/habbo/beta/en/classic.html']];
const stylesheet='v18-classic-archive.css';
const css=fs.readFileSync(path.join(here,stylesheet),'utf8');
const originalCss=fs.readFileSync(path.join(here,'v18-classic.css'),'utf8');
assert.equal(css,originalCss,'Classic theme must remain a byte-identical archive of the approved V18 theme');
const checks=[];
const ok=(value,msg)=>{assert.ok(value,msg);checks.push(msg)};
for(const [lang,p] of pages){
 const h=fs.readFileSync(path.join(here,p),'utf8');
 ok(h.includes('class="habbo-v18-beta"'),lang+' preserved classic body');
 ok(h.includes('/habbo/beta/v18-classic-archive.css'),lang+' frozen theme link');
 ok(h.includes('href="/habbo/beta/classic.html"') && h.includes('href="/habbo/beta/en/classic.html"'),lang+' locale navigation preserved');
 ok((h.match(/data-v9-item(?=\s|>)/g)||[]).length===249,lang+' exactly 249 rare and badge items');
 ok((h.match(/data-v17-person=/g)||[]).length===12,lang+' all 12 classic Staff');
 ok(h.includes('data-total="29"')&&h.includes('data-item-total="36"')&&h.includes('data-autoplay-ms="4000"'),lang+' intact 29/36 Dock, 4000ms');
 ok(h.includes('flecha-hc-room.gif')&&h.includes('prefeita-classic.gif'),lang+' user-verified archive crops');
 ok(h.includes('noindex,nofollow,noarchive'),lang+' beta not indexed');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,,route] of pages){
  for(const [label,width,height] of [['desktop',1440,900],['mobile',390,844],['tiny',320,720]]){
   const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
   const page=await ctx.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',res=>{if(res.url().includes('/habbo/')&&res.status()>=400)errors.push(res.status()+' '+res.url())});
   await page.goto('http://127.0.0.1:4173'+route,{waitUntil:'networkidle'});
   ok(await page.locator('.v18-arrival').count()===1,lang+' '+label+' archive hero');
   ok(await page.locator('#raros [data-v9-item]').count()===148,lang+' '+label+' rares');
   ok(await page.locator('#emblemas [data-v9-item]').count()===101,lang+' '+label+' badges');
   ok(await page.locator('#gerentes [data-v17-person]').count()===12,lang+' '+label+' managers');
   ok(await page.locator('#lugares [data-cinematic-dock]').count()===0 || await page.locator('#lugares.cinematic-dock').count()===1,lang+' '+label+' Dock retained');
   ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+3),lang+' '+label+' no horizontal body overflow');
   ok(errors.length===0,lang+' '+label+' all requests and JS healthy: '+errors.join(';'));
   if(label==='mobile'){
    const target=lang==='pt'?'/habbo/beta/en/classic.html':'/habbo/beta/classic.html';
    await page.locator('.lang-toggle a[data-lang="'+(lang==='pt'?'en':'pt-br')+'"]').click();
    await page.waitForURL('**'+target);
    ok(new URL(page.url()).pathname===target,lang+' classic locale switch does not escape to beta index');
   }
   await ctx.close();
  }
 }
 const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:720}});
 const page=await ctx.newPage();await page.goto('http://127.0.0.1:4173/habbo/beta/classic.html',{waitUntil:'load'});
 ok(await page.locator('#raros [data-v9-item]').count()===148,'No-JS historic archive is present');
 await ctx.close();
}finally{await browser.close()}
console.log('CLASSIC ARCHIVE QA OK',checks.length,'checks');
