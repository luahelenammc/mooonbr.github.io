import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'qa/v15-artifacts');fs.mkdirSync(out,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(root,'v13/source-manifest.json'),'utf8'));
const ledger=JSON.parse(fs.readFileSync(path.join(root,'v13/native-ledger.json'),'utf8'));
const hc=manifest.newRares.filter(x=>x.family==='classic-hc');
let count=0;
const ok=(v,msg)=>{assert.ok(v,msg);count++};
ok(hc.length===33,'33 classic Habbo Club originals');
ok(hc.filter(x=>x.subseries==='monthly-gift').length===24,'24 documented monthly gift visualizations');
ok(hc.filter(x=>x.subseries==='club-shop').length===9,'9 HC shop room renders');
ok(ledger.assets.length===81,'81 source-verified original assets');
ok(manifest.newRares.length===79,'79 sourced archival additions');
ok(new Set(hc.map(x=>x.id)).size===33,'unique HC IDs');
ok(new Set(hc.map(x=>x.url)).size===33,'unique original HC URLs');
ok(hc.every(x=>x.url.startsWith('https://habborator.org/furniture/hc/')&&x.source.endsWith('/hc.html')),'only explicitly sourced HC originals');
ok(manifest.newRares.filter(x=>x.family==='monoliths').every(x=>x.familyPt==='Monolitos'&&x.pt.startsWith('Monolito ')),'Monolitos written without accent');
ok(manifest.newRares.filter(x=>x.family==='laser-gates').every(x=>x.familyPt==='Portas laser'),'final requested laser category title');
for(const item of hc){
 const entry=ledger.assets.find(x=>x.id===item.id);
 ok(!!entry&&entry.type==='gif'&&entry.width>=20&&entry.height>=20&&entry.sha256.length===64,'preserved source GIF '+item.id);
 ok(fs.existsSync(path.join(root,'assets/v13/native',path.basename(item.local))),'local original '+item.id);
}
const browser=await chromium.launch({headless:true});
try{
 for(const [locale,route] of [['root',''],['pt','pt-br/'],['en','en/']]){
  const en=locale==='en';
  for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}],['tiny',{width:320,height:720}]]){
   const context=await browser.newContext({viewport,reducedMotion:'no-preference'});
   const page=await context.newPage(),errs=[],failed=[];
   page.on('pageerror',e=>errs.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
   await page.goto('http://127.0.0.1:4173/habbo/'+route,{waitUntil:'networkidle'});
   ok(await page.locator('#raros [data-v9-item]').count()===148,'148 original rares and HC items '+locale+device);
   ok(await page.locator('#emblemas [data-v9-item]').count()===101,'101 global badges '+locale+device);
   ok(await page.locator('#raros .v11-family-grid a:visible').count()===15,'15 family tiles visible '+locale+device);
   ok(await page.locator('#raros-family-classic-hc [data-v9-item]').count()===33,'33 genuine HC specimens '+locale+device);
   ok(await page.locator('#raros-family-laser-gates [data-v9-item]').count()===10,'laser gates remain separate');
   ok(await page.locator('#raros-family-monoliths [data-v9-item]').count()===10,'monoliths remain separate');
   ok(await page.locator('#raros-family-smoke-machines [data-v9-item]').count()===10,'smoke machines preserved');
   ok(await page.locator('#raros-family-collectables-2008-2009 [data-v9-item]').count()===16,'collectibles preserved');
   ok((await page.locator('.collection-switch a').first().textContent()).trim()===(en?'Public Spaces':'Espaços Públicos'),'chapter title intact');
   ok(await page.locator('#lugares.cinematic-dock').count()===1,'Places Dock untouched');
   ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2),'no unwanted viewport overflow '+locale+device);
   ok(await page.locator('.collection-switch').evaluate(x=>x.scrollWidth<=x.clientWidth+2),'mobile header labels fit '+locale+device);
   const family=page.locator('#raros .v11-family-grid a[href$="classic-hc"]');
   ok(await family.count()===1,'one HC family tile');
   ok((await family.textContent()).includes(en?'Classic HC Furniture':'Mobis HC clássicos'),'curated HC title');
   await family.click();
   ok(await page.locator('#raros-family-classic-hc:visible').count()===1,'HC group can be opened');
   const item=page.locator('#raros-family-classic-hc [data-v9-id="v15-hc-gift-sofa"]');
   ok(await item.count()===1,'iconic Clubsofa included');
   await item.scrollIntoViewIfNeeded();
   const img=item.locator('img').first();
   await page.waitForFunction(()=>{const x=document.querySelector('#raros-family-classic-hc [data-v9-id="v15-hc-gift-sofa"] img');return x?.complete&&x.naturalWidth===113&&x.naturalHeight===85});
   ok(await img.evaluate(x=>x.naturalWidth===113&&x.naturalHeight===85),'native room-size Clubsofa, not miniature');
   await item.click();
   ok(await page.locator('.v9-home-dialog[open]').count()===1,'HC viewer opened');
   ok((await page.locator('[data-v9-dialog-counter]').textContent()).trim()==='1 / 33','HC lightbox scoped to 33 pieces');
   ok((await page.locator('[data-v9-dialog-link]').getAttribute('href')).endsWith('/v15-hc-gift-sofa/'),'HC source-backed detail link');
   await page.keyboard.press('Escape');
   ok(errs.length===0,'no JS exceptions '+errs.join(';'));
   ok(failed.length===0,'no broken requests '+failed.join(';'));
   await family.scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(out,locale+'-'+device+'-hc-directory.png')});
   await context.close();
  }
  const ctx=await browser.newContext({viewport:{width:1200,height:860}});
  const page=await ctx.newPage();
  const lang=en?'en':'pt-br',unit=en?'rare':'raro';
  await page.goto('http://127.0.0.1:4173/habbo/'+lang+'/'+(en?'rares/':'raros/'),{waitUntil:'networkidle'});
  ok(await page.locator('.v8-family').count()===15,'15 standalone rare families '+lang);
  ok(await page.locator('.v8-specimen').count()===148,'standalone museum HC integrated '+lang);
  ok(await page.locator('#family-classic-hc .v8-specimen').count()===33,'HC standalone gallery '+lang);
  for(const [id,sourceType,month] of [['v15-hc-gift-sofa','monthly-gift',1],['v15-hc-gift-hcplasto','monthly-gift',2],['v15-hc-shop-sofa','club-shop',null]]){
   await page.goto('http://127.0.0.1:4173/habbo/'+lang+'/'+unit+'/'+id+'/',{waitUntil:'networkidle'});
   ok(await page.locator('main.v13-detail-main img[src$="'+id+'.gif"]').count()===1,'record renders preserved HC sprite '+id);
   ok(await page.locator('main.v13-detail-main a[href$="/furniture/hc.html"]').count()===1,'source Habborator link '+id);
   ok((await page.locator('main.v13-detail-main .v13-detail-series').textContent()).includes(sourceType==='monthly-gift'?(en?'Monthly Habbo Club gifts':'Presentes mensais do Habbo Club'):(en?'Habbo Club Shop':'Loja Habbo Club')),'HC subseries not collapsed '+id);
   if(month)ok((await page.locator('main .v13-hc-month').textContent()).includes(String(month)),'archival month recorded '+id);
   ok((await page.locator('main.v13-detail-main .v13-detail-note').textContent()).includes(en?'not necessarily a limited-release catalogue rare':'não significa necessariamente') || (await page.locator('main.v13-detail-main .v13-detail-note').textContent()).toLowerCase().includes('necessariamente'),'HC membership gift is not mislabeled as limited catalogue rare');
  }
  await page.goto('http://127.0.0.1:4173/habbo/'+lang+'/'+unit+'/v13-monolith-pink/',{waitUntil:'networkidle'});
  ok((await page.locator('main.v13-detail-main h1').textContent()).startsWith(en?'Pink Monolith':'Monolito rosa'),'Monolito accent correction in records '+lang);
  await ctx.close();
 }
 const ctx=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});
 const p=await ctx.newPage();await p.goto('http://127.0.0.1:4173/habbo/pt-br/',{waitUntil:'load'});
 ok(await p.locator('#raros .v11-family-grid a:visible').count()===15,'no JS retains 15 families');
 ok(await p.locator('#raros .v9-family:visible').count()===15,'no JS exposes all 15 archive families');
 ok(await p.locator('#raros-family-classic-hc [data-v9-item]').count()===33,'no JS preserves HC catalog');
 await ctx.close();
}finally{await browser.close();}
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'passed',checks:count,archiveSpecimens:148,hcItems:33,monthlyGiftRenders:24,clubShop:9,originalAssets:81,rareFamilies:15,globalBadges:101},null,2));
console.log('V15 CLASSIC HC PASS '+count+' checks');
