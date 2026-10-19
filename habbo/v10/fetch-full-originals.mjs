import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'habbo/v10/full-render-ledger.json'),'utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
let verified=0;
for(const record of manifest.assets){
 const target=path.resolve(root,record.local);
 if(!target.startsWith(root+path.sep))throw Error('Unsafe output path');
 let bytes;
 if(fs.existsSync(target) && hash(bytes=fs.readFileSync(target))===record.sha256){
   console.log('REUSING_VERIFIED',record.id);
 }else {
   const u=new URL(record.url);
   if(u.protocol!=='https:'||!['habborator.org','habboxwiki.com'].includes(u.host))throw Error('Unreviewed host '+u.host);
   const res=await fetch(u,{signal:AbortSignal.timeout(18000)});
   if(!res.ok)throw Error('Source missing '+res.status+' '+u.href);
   bytes=Buffer.from(await res.arrayBuffer());
 }
 if(bytes.subarray(0,6).toString('ascii')!=='GIF89a'&&bytes.subarray(0,6).toString('ascii')!=='GIF87a')throw Error('Not original GIF: '+record.id);
 if(bytes.readUInt16LE(6)!==record.width||bytes.readUInt16LE(8)!==record.height)throw Error('Dimensions changed: '+record.id);
 if(hash(bytes)!==record.sha256)throw Error('Original sprite hash does not match: '+record.id);
 if(bytes.length>2000000||bytes.length<100)throw Error('Implausible original sprite length: '+record.id);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,bytes);
 verified++;
 console.log('VERIFIED_ORIGINAL_RENDER',record.id,record.width+'×'+record.height,bytes.length,record.sha256);
}
if(verified!==9)throw Error('Expected all nine genuine furniture renders, got '+verified);
console.log('NINE_FULL_ORIGINALS_VERIFIED');
