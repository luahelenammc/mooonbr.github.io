import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.join(root,'qa','v6-recovery-artifacts');
fs.mkdirSync(evidence,{recursive:true});
const origin=(process.env.HABBO_QA_URL || 'http://127.0.0.1:4173/habbo');
const base=origin.endsWith('/')?origin.slice(0,-1):origin;
const browser = await chromium.launch({headless:true});
let total = 0;
try {
  for(const [locale, route] of [['pt','pt-br/raros/'],['en','en/rares/']]){
    for(const [screen,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
      const context = await browser.newContext({viewport,reducedMotion:'reduce'});
      const page = await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base + '/' + route,{waitUntil:'networkidle'});
      assert.equal(await page.locator('main.v6-rare-experience').count(),1,'V6 rare enhancement mounted');
      assert.ok(await page.locator('.family').count()>10,'full V5 collection retained in DOM');
      assert.equal(await page.locator('.family[data-v6-visible="true"]').count(),1,'one active family');
      assert.equal(await page.locator('.rail a[aria-current="true"]').count(),1,'active family indicator');
      assert.equal(await page.locator('.v6-family-line button').count(),1,'show all fallback');
      await page.screenshot({path:path.join(evidence,locale+'-'+screen+'-initial.png'),fullPage:true});
      const first=await page.locator('.family[data-v6-visible="true"]').getAttribute('id');
      await page.locator('.rail a[href^="#family-"]').nth(1).click();
      const second=await page.locator('.family[data-v6-visible="true"]').getAttribute('id');
      assert.notEqual(second,first,'navigation selects a different family');
      assert.equal(await page.locator('.rail a[aria-current="true"]').count(),1);
      await page.locator('.v6-family-line button').click();
      assert.equal(await page.locator('main.v6-show-all').count(),1,'show all fallback');
      await page.screenshot({path:path.join(evidence,locale+'-'+screen+'-all.png'),fullPage:false});
      assert.equal(await page.locator('dialog[open]').count(),0,'no unwanted modal');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1),false,'no horizontal page overflow');
      assert.deepEqual(errors,[],'no page errors');
      total+=10;
      await context.close();
    }
  }
} finally { await browser.close(); }
fs.writeFileSync(path.join(evidence,'report.json'),JSON.stringify({tests:total,status:'passed'},null,2));
console.log('V6 safe display browser QA PASS ('+total+' checks)');
