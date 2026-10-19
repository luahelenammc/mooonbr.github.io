import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const manifest=JSON.parse(fs.readFileSync(path.join(repo,'habbo/v13/source-manifest.json'),'utf8'));
const sources=[...manifest.animations.map(o=>({...o,animated:true})),...manifest.newRares];
const out='habbo/v13/native-ledger.json';
const check=process.argv.includes('--check');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function inspect(bytes){
 if(bytes.subarray(0,6).toString('ascii').startsWith('GIF8')){
  let p=13;
  const width=bytes.readUInt16LE(6),height=bytes.readUInt16LE(8);
  if(bytes[10]&128)p+=3*(2**((bytes[10]&7)+1));
  let frames=0;
  const skipBlocks=()=>{while(p<bytes.length){let n=bytes[p++];if(n===0)return;p+=n;}throw Error('Truncated GIF blocks');};
  while(p<bytes.length){
   const op=bytes[p++];
   if(op===0x3b)break;
   if(op===0x21){p++;skipBlocks();continue;}
   if(op===0x2c){
    frames++; if(p+9>bytes.length)throw Error('Truncated GIF frame');
    const flags=bytes[p+8];p+=9;
    if(flags&128)p+=3*(2**((flags&7)+1));
    p++;skipBlocks();continue;
   }
   throw Error('Unknown GIF chunk '+op.toString(16)+' offset '+p);
  }
  return {type:'gif',width,height,frames};
 }
 if(bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a')return {type:'png',width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),frames:1};
 throw Error('Not an original GIF or PNG');
}
const old=fs.existsSync(path.join(repo,out))?JSON.parse(fs.readFileSync(path.join(repo,out),'utf8')):null;
const ledger=[];
for(const source of sources){
 const u=new URL(source.url);
 if(u.protocol!=='https:'||!['habborator.org','habboxwiki.com'].includes(u.host))throw Error('Unreviewed asset host '+u.host);
 if(source.local.includes('..')||!source.local.startsWith('habbo/assets/v13/native/'))throw Error('Invalid native asset path');
 const dest=path.join(repo,source.local);
 let bytes;
 if(check){
  if(!fs.existsSync(dest))throw Error('Missing original '+source.id);
  bytes=fs.readFileSync(dest);
 }else{
  let err;
  for(let attempt=0;attempt<3;attempt++){
   try{
    const response=await fetch(u,{signal:AbortSignal.timeout(24000),headers:{'User-Agent':'Mozilla/5.0 (Habbo Museum historical preservation)'}});
    if(!response.ok)throw Error('HTTP '+response.status+' for '+u.href);
    bytes=Buffer.from(await response.arrayBuffer());break;
   }catch(e){err=e;}
  }
  if(!bytes)throw Error('Cannot acquire '+source.id+': '+err);
 }
 const info=inspect(bytes);
 if(!Number.isInteger(info.width)||!Number.isInteger(info.height)||info.width<20||info.height<20||info.width>600||info.height>600)throw Error('Implausible dimensions '+source.id+' '+JSON.stringify(info));
 if(bytes.length<160||bytes.length>3000000)throw Error('Implausible sprite size '+source.id+' '+bytes.length);
 if(source.animated && (info.type!=='gif'||info.frames<2))throw Error('Source is not a genuinely animated hologram '+source.id+' '+JSON.stringify(info));
 const digest=sha(bytes);
 if(check){
  const recorded=old?.assets?.find(x=>x.id===source.id);
  if(!recorded||recorded.sha256!==digest||recorded.frames!==info.frames||recorded.width!==info.width||recorded.height!==info.height)throw Error('Native asset drift '+source.id);
 }else{
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,bytes);
 }
 ledger.push({id:source.id,source:source.url,local:source.local,sha256:digest,bytes:bytes.length,...info,animated:!!source.animated});
 console.log('VERIFIED_NATIVE',source.id,info.width+'×'+info.height,info.frames+' frames',bytes.length,digest.slice(0,16));
}
if(!check)fs.writeFileSync(path.join(repo,out),JSON.stringify({schema:1,sourcePolicy:manifest.policy,assets:ledger},null,2)+'\n');
if(sources.length!==81)throw Error('Expected 81 source images, got '+sources.length);
console.log('V13_NATIVE_ASSETS_OK',ledger.length,'genuinely animated',ledger.filter(x=>x.animated).length);
