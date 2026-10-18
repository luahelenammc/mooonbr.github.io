import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import http from 'node:http';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const artifacts=path.join(root,'qa/v5-visual-artifacts');
fs.mkdirSync(artifacts,{recursive:true});
const base=(process.env.HABBO_QA_URL||'http://127.0.0.1:4173/habbo').replace(/\/$/,'');
const checks=[]; const record=(name,passed,detail='')=>checks.push({name,passed,detail});
const browser=await chromium.launch({headless:true});
async function settle(page){await page.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));await page.waitForFunction(()=>[...document.images].every(i=>i.complete));}
async function health(page,name){await settle(page);const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)}));record(name+' no overflow',!state.overflow);record(name+' no broken images',!state.broken.length,state.broken.join(','));}
for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
 const context=await browser.newContext({viewport,recordVideo:{dir:path.join(artifacts,'videos'),size:viewport}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  for(const [kind,route] of [['rares','pt-br/raros/'],['badges','pt-br/emblemas/']]){
   await page.goto(`${base}/${route}`,{waitUntil:'networkidle'});await health(page,`${label} ${kind}`);await page.screenshot({path:path.join(artifacts,`${label}-${kind}.png`),fullPage:true});
   record(`${label} ${kind} nonempty`,await page.locator('[data-view]').count()>0);record(`${label} ${kind} families`,await page.locator('.rail a').count()>0);
   if(kind==='rares')record(`${label} rare hero`,await page.locator('.rare-hero img').count()===1);
   const trigger=page.locator('[data-view]').first();const initialId=await trigger.getAttribute('data-view');await trigger.focus();await trigger.click();await page.waitForSelector('dialog[open]');record(`${label} ${kind} deep hash`,page.url().includes('#view-'));await page.screenshot({path:path.join(artifacts,`${label}-${kind}-viewer.png`)});
   const first=await page.locator('#viewer-title').innerText();await page.locator('[data-step="1"]').click();record(`${label} ${kind} touch next`,await page.locator('#viewer-title').innerText()!==first);await page.locator('[data-step="-1"]').click();record(`${label} ${kind} touch previous`,await page.locator('#viewer-title').innerText()===first);record(`${label} ${kind} language hash`,(await page.locator('dialog .viewer-language').getAttribute('href')).endsWith('#view-'+encodeURIComponent(initialId)));await page.keyboard.press('ArrowRight');record(`${label} ${kind} arrow navigation`,await page.locator('#viewer-title').innerText()!==first);await page.keyboard.press('Escape');record(`${label} ${kind} Escape`,await page.locator('dialog[open]').count()===0);record(`${label} ${kind} focus restored`,await trigger.evaluate(el=>el===document.activeElement));
   await trigger.click();const box=await page.locator('dialog').boundingBox();await page.mouse.click(Math.max(1,box.x-5),Math.max(1,box.y-5));record(`${label} ${kind} backdrop closes`,await page.locator('dialog[open]').count()===0);
   await trigger.click();await page.locator('dialog .viewer-language').click();await page.waitForSelector('dialog[open]');record(`${label} ${kind} language viewer continuity`,page.url().includes('/en/')&&page.url().endsWith('#view-'+encodeURIComponent(initialId)));await page.locator('dialog .viewer-language').click();await page.waitForSelector('dialog[open]');await page.locator('dialog .viewer-content a').click();await page.waitForLoadState('networkidle');await health(page,`${label} ${kind} detail`);record(`${label} ${kind} source links`,await page.locator('.detail a[target="_blank"]').count()>0);const ptName=await page.locator('h1').innerText();const id=page.url().split('/').filter(Boolean).at(-1);await page.locator('header>a:last-child').click();await page.waitForLoadState('networkidle');record(`${label} ${kind} language keeps item`,page.url().includes(`/en/${kind==='rares'?'rare':'badge'}/${id}/`));await page.screenshot({path:path.join(artifacts,`${label}-${kind}-detail-en.png`),fullPage:true});
   await page.goto(`${base}/${route}#view-${encodeURIComponent(initialId)}`);await page.waitForSelector('dialog[open]');record(`${label} ${kind} direct hash opens`,await page.locator('dialog[open]').count()===1);
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`${base}/pt-br/raros/`);record(`${label} reduced motion`,await page.locator('.inspect img').first().evaluate(el=>getComputedStyle(el).transitionDuration==='0s'));
  await page.goto(`${base}/pt-br/raros/`);await page.evaluate(()=>{const nav=document.querySelector('header nav');const d=document.createElement('details');const s=document.createElement('summary');s.textContent='Coleções';d.append(s);nav.replaceWith(d);d.append(nav);d.open=true;});await page.screenshot({path:path.join(artifacts,`${label}-selector-variant-b.png`)});
 }catch(e){record(label+' interaction suite',false,e.stack);}finally{record(label+' no console errors',!errors.length,errors.join('\n'));await context.close();}
}
// Preserve an actual pre-V5 comparison. The source archive is served independently.
let server;
try{
 const baseline=path.join(artifacts,'baseline-source');fs.mkdirSync(baseline,{recursive:true});const tar=path.join(artifacts,'baseline.tar');fs.writeFileSync(tar,execFileSync('git',['archive',process.env.HABBO_BASELINE_COMMIT||'c051362','habbo'],{cwd:path.dirname(root),maxBuffer:100*1024*1024}));execFileSync('tar',['-xf',tar,'-C',baseline]);
 const serving=path.join(baseline,'habbo');server=http.createServer((req,res)=>{let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/habbo/,'');let p=path.join(serving,rel);if(!p.startsWith(serving)){res.writeHead(403).end();return;}try{if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');const mime={'.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.gif':'image/gif','.html':'text/html'}[path.extname(p)]||'application/octet-stream';res.writeHead(200,{'Content-Type':mime}).end(fs.readFileSync(p));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(4174,'127.0.0.1',r));
 for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){const p=await browser.newPage({viewport});await p.goto('http://127.0.0.1:4174/habbo/pt-br/',{waitUntil:'networkidle'});await p.screenshot({path:path.join(artifacts,`${label}-baseline-v4.png`),fullPage:true});record(`${label} baseline screenshot`,true);await p.close();}
}catch(e){record('baseline comparison',false,e.message);}finally{server?.close();}
await browser.close();fs.writeFileSync(path.join(artifacts,'report.json'),JSON.stringify({generatedAt:new Date().toISOString(),checks,passed:checks.every(c=>c.passed)},null,2));console.log(JSON.stringify({checks:checks.length,failed:checks.filter(c=>!c.passed)},null,2));if(checks.some(c=>!c.passed))process.exitCode=1;
