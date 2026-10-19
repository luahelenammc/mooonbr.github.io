import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildCollections} from '../v5/build-collections.mjs';

function fixture(){
 const sandbox=fs.mkdtempSync(path.join(os.tmpdir(),'habbo-v6-'));
 const root=path.join(sandbox,'habbo');
 fs.mkdirSync(root,{recursive:true});
 const here=path.dirname(fileURLToPath(import.meta.url));
 fs.cpSync(path.resolve(here,'../v5'),path.join(root,'v5'),{recursive:true});
 fs.cpSync(path.resolve(here,'../v6'),path.join(root,'v6'),{recursive:true});fs.rmSync(path.join(root,'v6/asset-release-approval.json'),{force:true});
 fs.mkdirSync(path.join(root,'data'),{recursive:true});
 fs.writeFileSync(path.join(root,'data/v5-rares.json'),'[]');
 fs.writeFileSync(path.join(root,'data/v5-badges.json'),'[]');
 return {sandbox,root,dist:path.join(root,'dist')};
}
test('without written V6 release receipt, never generates any new badge/rare or sprite',()=>{
 const f=fixture();
 try{
  assert.deepEqual(buildCollections({root:f.root,dist:f.dist,basePath:'/habbo'}),{rares:0,badges:0});
  assert.equal(fs.existsSync(path.join(f.dist,'pt-br/emblema/hc1/index.html')),false);
  assert.equal(fs.existsSync(path.join(f.dist,'assets/v6/badges/HC1.gif')),false);
 } finally{fs.rmSync(f.sandbox,{recursive:true,force:true});}
});
test('explicit receipt without exact originals is rejected',()=>{
 const f=fixture();
 try{
  fs.writeFileSync(path.join(f.root,'v6/asset-release-approval.json'),JSON.stringify({status:'approved',evidenceUrl:'https://example.org/permission-receipt'}));
  assert.throws(()=>buildCollections({root:f.root,dist:f.dist,basePath:'/habbo'}),/approved asset missing/);
 } finally{fs.rmSync(f.sandbox,{recursive:true,force:true});}
});
test('conditional release generates 9 rares + 13 bilingual global badge records only with verified bytes',()=>{
 const f=fixture();
 try{
  const manifestPath=path.join(f.root,'v6/expected-original-assets.json');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  // Synthetic bytes exist only in temporary QA, NEVER in public repository assets.
  const dummy=Buffer.from('GIF89aQA-FIXTURE-NOT-AN-ORIGINAL');
  for(const asset of manifest.assets){
   const file=path.join(f.sandbox,asset.path);fs.mkdirSync(path.dirname(file),{recursive:true});
   fs.writeFileSync(file,dummy);asset.sha256=crypto.createHash('sha256').update(dummy).digest('hex');
  }
  fs.writeFileSync(manifestPath,JSON.stringify(manifest));

  // V10 added a room-render-only public image route. Keep it synthetic in this
  // fixture rather than copying real external copyrighted GIFs into tests.
  const candidates=JSON.parse(fs.readFileSync(path.join(f.root,'v6/recovered-candidates.json'),'utf8'));
  for(const rare of candidates.rareConcepts){
   const target=path.join(f.root,'assets/v10/full-rares',rare.id+'.gif');
   fs.mkdirSync(path.dirname(target),{recursive:true});
   fs.writeFileSync(target,dummy);
  }

  fs.writeFileSync(path.join(f.root,'v6/asset-release-approval.json'),JSON.stringify({status:'approved',evidenceUrl:'https://example.org/permission-receipt'}));
  const x=buildCollections({root:f.root,dist:f.dist,basePath:'/habbo'});
  assert.deepEqual(x,{rares:9,badges:0});
  assert.ok(fs.existsSync(path.join(f.dist,'pt-br/raro/holiday-romance/index.html')));
  assert.ok(fs.existsSync(path.join(f.dist,'en/rare/holiday-romance/index.html')));
  assert.ok(fs.existsSync(path.join(f.dist,'pt-br/emblema/hc1/index.html')));
  assert.ok(fs.existsSync(path.join(f.dist,'en/badge/hc1/index.html')));
  assert.ok(fs.existsSync(path.join(f.dist,'assets/v6/badges/HC1.gif')));
  const html=fs.readFileSync(path.join(f.dist,'pt-br/emblemas/index.html'),'utf8');
  assert.match(html,/data-v6-images-allowed="true"/);
 } finally{fs.rmSync(f.sandbox,{recursive:true,force:true});}
});
