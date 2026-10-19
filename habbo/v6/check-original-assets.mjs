import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'habbo/v6/expected-original-assets.json'),'utf8'));
const enforce=process.argv.includes('--require-all');
const results=[];
for(const asset of manifest.assets){
 const absolute=path.resolve(root,asset.path);
 if(!absolute.startsWith(root+path.sep))throw Error('Unsafe asset path '+asset.path);
 if(!fs.existsSync(absolute)){results.push({asset:asset.path,status:'missing'});continue;}
 const bytes=fs.readFileSync(absolute);
 const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
 const validHeader=bytes.subarray(0,6).toString('ascii');
 const ok=validHeader==='GIF89a'||validHeader==='GIF87a';
 if(!ok||sha256!==asset.sha256){results.push({asset:asset.path,status:'mismatch',sha256,header:validHeader});continue;}
 results.push({asset:asset.path,status:'verified',bytes:bytes.length});
}
const totals={verified:results.filter(x=>x.status==='verified').length,missing:results.filter(x=>x.status==='missing').length,mismatch:results.filter(x=>x.status==='mismatch').length};
console.log(JSON.stringify(totals));
for(const r of results.filter(x=>x.status!=='verified'))console.log(r.status+' '+r.asset);
if(totals.mismatch || (enforce&&totals.missing))process.exit(1);
if(!enforce)console.log('Research status only. Use --require-all as a hard gate before publishing assets.');
