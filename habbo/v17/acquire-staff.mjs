import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sources=[
 {id:'flecha',name:'Flecha',type:'2011'},
 {id:'mordomo',name:'Mordomo',type:'2011'},
 {id:'paty-nestle',name:'Paty-Nestle',type:'2011'},
 {id:'4queijos',name:'4Queijos',type:'2021'},
 {id:'disco-lee',name:'Disco-Lee',type:'2021'},
 {id:'missfurby',name:'MissFurby',type:'2021'},
 {id:'reeet',name:'Reeet',type:'2021'},
 {id:'thedjhabbo',name:'TheDJHabbo',type:'2021'},
 {id:'sir-lawnrence',name:'Sir-Lawnrence',type:'2011'}
];
const originalSource={
 '2011':'https://haddicas-habbo.blogspot.com/2011/12/personagens-hotel.html',
 '2021':'https://viajovem.blogspot.com/2021/02/staffs.html'
};
const output=path.join(root,'assets/v17/staff');fs.mkdirSync(output,{recursive:true});
const check=process.argv.includes('--check');
const ledgerFile=path.join(root,'v17/sprite-ledger.json');
const existing=check?JSON.parse(fs.readFileSync(ledgerFile,'utf8')):null;
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#38;','&');
const htmls={};
if(!check)for(const [era,url] of Object.entries(originalSource)){
 const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (verified historical Habbo staff archive)'},signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error('History source inaccessible '+url+' '+r.status);
 htmls[era]=await r.text();
}
const entries=[];
for(const source of sources){
 let url;
 const file=path.join(output,source.id+'.png');
 if(!check){
  const html=htmls[source.type],n=source.name;
  if(source.type==='2021'){
   // Name caption is emitted after its 64x110 illustration, not as image alt.
   const marker=n+' (';
   const at=html.indexOf(marker);
   if(at<0)throw Error('Source caption missing '+n);
   const leading=html.slice(Math.max(0,at-2500),at);
   const images=[...leading.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)];
   url=images.at(-1)?.[1];
   if(!url||!url.includes('blogger.googleusercontent.com/'))throw Error('No original historical full-body sprite for '+n);
  }else{
   // 2011 table structure: <strong>NAME</strong> precedes its associated image.
   const nameRe=new RegExp('<strong>\\s*'+n+'\\s*<\\/strong>[\\s\\S]{0,500}?<img\\b[^>]*\\bsrc="([^"]+)"','i');
   const match=html.match(nameRe);
   url=match?.[1];
   if(!url||!url.includes('googleusercontent.com/'))throw Error('2011 original illustration missing '+n);
  }
  url=decode(url);
  const u=new URL(url);
  if(u.protocol!=='https:')throw Error('Unsafe URL');
  const r=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Mozilla/5.0'}});
  if(!r.ok)throw Error('Cannot preserve '+n+': '+r.status+' '+url);
  const bytes=Buffer.from(await r.arrayBuffer());
  if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Not PNG source '+n+' '+bytes.subarray(0,12).toString('hex'));
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  if(width<45||height<80||width>256||height>300)throw Error('Suspect room sprite dimensions '+n+' '+width+'x'+height);
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
if(ids.size!==9||entries.length!==9)throw Error('Expected nine verified sprite originals');
if(!check)fs.writeFileSync(ledgerFile,JSON.stringify({schema:1,notes:'Only 9 historical full-body sprite references found, do not invent the other 3. Unverified names remain text-only until authenticated original is obtained.',sourceList:originalSource,sprites:entries,pending:['acapulca','prefeita','djapamala']},null,2)+'\n');
console.log('STAFF_ORIGINAL_SPRITES_VERIFIED',entries.length,'PENDING_REFERENCE',3);
