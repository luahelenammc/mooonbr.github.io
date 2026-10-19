import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const manifest=JSON.parse(fs.readFileSync(path.join(repoRoot,'habbo/v6/expected-original-assets.json'),'utf8'));
const approvedHosts=new Set(['images.habbo.com','habborator.org','www.habborator.org']);
const fetchTimeout=20000;
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const pause=ms=>new Promise(done=>setTimeout(done,ms));
let successes=0;
let failures=[];
async function getImage(asset){
 const endpoint=new URL(asset.source);
 if(endpoint.protocol!=='https:'||!approvedHosts.has(endpoint.hostname))throw Error('Unknown image host '+asset.source);
 const attempts=[asset.source];
 if(endpoint.hostname==='habborator.org')attempts.push(asset.source.replace('https://habborator.org/','https://www.habborator.org/'));
 if(endpoint.hostname==='www.habborator.org')attempts.push(asset.source.replace('https://www.habborator.org/','https://habborator.org/'));
 const p=path.join(repoRoot,asset.path);
 if(!p.startsWith(repoRoot+path.sep))throw Error('Traversal denied');
 if(fs.existsSync(p)){
  const existing=fs.readFileSync(p);
  if(sha(existing)===asset.sha256){console.log('PRESENT',asset.path);successes++;return;}
 }
 for(let i=0;i<attempts.length*3;i++){
  const u=attempts[i%attempts.length];
  try{
   const response=await fetch(u,{redirect:'follow',signal:AbortSignal.timeout(fetchTimeout),headers:{'user-agent':'Mozilla/5.0 (compatible; Moon Nostalgia Historical Archive; +https://www.mooon.com.br/habbo/)','accept':'image/gif,image/*;q=0.8'}});
   if(!response.ok)throw Error('HTTP '+response.status);
   const bytes=Buffer.from(await response.arrayBuffer());
   if(bytes.length>3000000)throw Error('Unexpected image length '+bytes.length);
   const magic=bytes.subarray(0,6).toString('ascii');
   if(magic!=='GIF87a'&&magic!=='GIF89a')throw Error('Not a GIF '+magic);
   if(sha(bytes)!==asset.sha256)throw Error('SHA mismatch '+asset.path+' expected '+asset.sha256+' got '+sha(bytes));
   fs.mkdirSync(path.dirname(p),{recursive:true});
   fs.writeFileSync(p,bytes);
   console.log('VERIFIED',asset.path,bytes.length,'bytes');
   successes++;return;
  }catch(e){console.error('RETRY',i+1,asset.path,String(e));await pause(Math.min(1000*(i+1),3000));}
 }
 throw Error('Unable to verify exact archived GIF '+asset.path);
}
for(const asset of manifest.assets){try{await getImage(asset);}catch(e){failures.push(String(e));}}
console.log('Archive originals: '+successes+'/'+manifest.assets.length);
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
