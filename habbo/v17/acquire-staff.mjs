import fs from 'node:fs';
import crypto from 'node:crypto';
const baseDir='habbo/assets/v17/staff';
const gallery='habbo/v17/staff-originals.json';
const examples=[
 ['flecha','Flecha (24/01/2006)'],['reeet','Reeet (02/02/2006)'],
 ['paty-nestle','Paty-Nestle (08/08/2006)'],['4queijos','4Queijos (23/11/2007)'],
 ['thedjhabbo','TheDJHabbo (09/06/2008)'],['acapulca','Acapulca (16/09/2008)'],
 ['disco-lee','Disco-Lee (01/12/2008)'],['missfurby','MissFurby (13/08/2010)']
];
const blog='https://viajovem.blogspot.com/2021/02/staffs.html';
const older='https://haddicas-habbo.blogspot.com/2011/12/personagens-hotel.html';
const imageSources=[];
function nearestImageBefore(html,marker){
 const i=html.indexOf(marker);
 if(i<0)throw Error('Historic staff name not found '+marker);
 const before=html.slice(Math.max(0,i-2200),i);
 const imgs=[...before.matchAll(/<img\b[^>]*>/gi)].map(x=>x[0]);
 const img=imgs.at(-1);
 const url=img?.match(/\bsrc=["']([^"']+)["']/i)?.[1]?.replaceAll('&amp;','&');
 if(!url)throw Error('No original img for '+marker);
 return url;
}
function imageAfter(html,name){
 const i=html.search(new RegExp('>\\s*'+name+'\\s*<','i'));
 if(i<0)throw Error('Historical figure entry missing '+name);
 const after=html.slice(i+name.length, i+name.length+1500);
 const m=after.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
 if(!m)throw Error('No original img after '+name);
 return m[1].replaceAll('&amp;','&');
}
function dims(b){
 if(b.subarray(0,8).toString('hex')==='89504e470d0a1a0a')return {format:'png',width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
 if(b.subarray(0,6).toString('ascii').startsWith('GIF8'))return {format:'gif',width:b.readUInt16LE(6),height:b.readUInt16LE(8)};
 throw Error('Not a GIF or PNG');
}
const UA={'User-Agent':'Mozilla/5.0 (museum archive historic staff sprite verification)'};
async function get(u){const r=await fetch(u,{signal:AbortSignal.timeout(27000),headers:UA});if(!r.ok)throw Error('HTTP '+r.status+' '+u.slice(0,130));return Buffer.from(await r.arrayBuffer());}
const pageA=(await get(blog)).toString('utf8');
for(const [id,marker] of examples)imageSources.push({id,sourcePage:blog,url:nearestImageBefore(pageA,marker),period:'archived 2006-2010 looks'});
const pageB=(await get(older)).toString('utf8');
for(const [id,n] of [['mordomo','Mordomo'],['sir-lawnrence','Sir-Lawnrence']])imageSources.push({id,sourcePage:older,url:imageAfter(pageB,n),period:'archived 2011 page'});
imageSources.push({id:'djapamala',sourcePage:'https://habbo.fandom.com/pt-br/wiki/Gerentes',url:'https://static.wikia.nocookie.net/habbo/images/c/cf/Perfil_DJapamala.png/revision/latest?cb=20111113160839&path-prefix=pt',period:'2011 uploaded wiki artwork'});
const results=[];
fs.mkdirSync(baseDir,{recursive:true});
for(const s of imageSources){
 try {
  let bytes,err;
  for(let attempt=1;attempt<=3;attempt++){try{bytes=await get(s.url);break;}catch(e){err=e;}}
  if(!bytes)throw err;
  const {format,width,height}=dims(bytes);
  if(width<25||height<50||width>600||height>600)throw Error('Non-sprite dimensions '+width+'x'+height);
  const dest=baseDir+'/'+s.id+'.'+format;
  fs.writeFileSync(dest,bytes);
  const d={...s,local:dest,width,height,format,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
  results.push(d);console.log('SAVED',s.id,width+'x'+height,format,bytes.length,s.url);
 }catch(e){console.log('MISSING',s.id,e.message)}
}
fs.writeFileSync(gallery,JSON.stringify({schema:1,policy:'Preserved unchanged original online pixels; never synthetic portraits or current avatars.',assets:results},null,2)+'\n');
console.log('ARCHIVED_HISTORIC_STAFF_SPRITES',results.length,'OUT_OF',imageSources.length);
if(results.length<9)throw Error('Archive insufficient to publish');
