import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sources=[
 {id:'flecha',name:'Flecha',type:'2021'},
 {id:'paty-nestle',name:'Paty-Nestle',type:'2021'},
 {id:'4queijos',name:'4Queijos',type:'2021'},
 {id:'disco-lee',name:'Disco-Lee',type:'2021'},
 {id:'missfurby',name:'MissFurby',type:'2021'},
 {id:'reeet',name:'Reeet',type:'2021'},
 {id:'thedjhabbo',name:'TheDJHabbo',type:'2021'},
 {id:'acapulca',name:'Acapulca',type:'2021'}
];
const originals=JSON.parse(fs.readFileSync(path.join(root,'v17/staff-source-urls.json'),'utf8'));
const originalSource=originals.originalArticles;
const output=path.join(root,'assets/v17/staff');fs.mkdirSync(output,{recursive:true});
const check=process.argv.includes('--check');
const ledgerFile=path.join(root,'v17/sprite-ledger.json');
const existing=check?JSON.parse(fs.readFileSync(ledgerFile,'utf8')):null;
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const entries=[];
for(const source of sources){
 let url;
 const file=path.join(output,source.id+'.png');
 if(!check){
  url=originals.images[source.id]?.url;
  if(!url||originals.images[source.id]?.source!==source.type)throw Error('No pinned historical image for '+source.name);
  const u=new URL(url);
  if(u.protocol!=='https:')throw Error('Unsafe URL');
  const r=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Mozilla/5.0'}});
  if(!r.ok)throw Error('Cannot preserve '+source.name+': '+r.status+' '+url);
  const bytes=Buffer.from(await r.arrayBuffer());
  if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Not PNG source '+source.name+' '+bytes.subarray(0,12).toString('hex'));
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  if(width<45||height<80||width>256||height>300)throw Error('Suspect room sprite dimensions '+source.name+' '+width+'x'+height);
  fs.writeFileSync(file,bytes);
  entries.push({id:source.id,name:source.name,local:'habbo/assets/v17/staff/'+source.id+'.png',sourceArticle:originalSource[source.type],sourceImage:url,sourcePublication:source.type==='2011'?'2011 classic persona archive':'2021 compilation of historical classic staff sprites',width,height,sha256:sha(bytes),bytes:bytes.length,status:'archived-sprite'});
  console.log('ARCHIVED_STAFF',source.name,width+'x'+height,bytes.length,'SHA256',sha(bytes).slice(0,20));
 }else{
  const entry=existing.sprites.find(x=>x.id===source.id);
  if(!entry)throw Error('Missing ledger '+source.id);
  const bytes=fs.readFileSync(file);
  if(sha(bytes)!==entry.sha256||entry.width!==bytes.readUInt32BE(16)||entry.height!==bytes.readUInt32BE(20))throw Error('Sprite hash/dimension mismatch '+source.id);
  entries.push(entry);
 }
}
const ids=new Set(entries.map(x=>x.id));
if(ids.size!==8||entries.length!==8)throw Error('Expected eight source-downloadable archive sprite originals');
if(!check)fs.writeFileSync(ledgerFile,JSON.stringify({schema:1,notes:'Eight named historical full-body sprite images could be retrieved and verified. 2011 proxy originals for Mordomo and Sir-Lawnrence are documented but their remote PNG files return HTTP 404; never claim they are present.',sourceList:originalSource,sprites:entries,pending:['mordomo','sir-lawnrence','prefeita','djapamala']},null,2)+'\n');
console.log('STAFF_ORIGINAL_SPRITES_VERIFIED',entries.length,'PENDING_REFERENCE',4);
