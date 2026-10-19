import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve('habbo');
const file=path.join(root,'v16/staff-manifest.json'), manifest=JSON.parse(fs.readFileSync(file,'utf8'));
const output=path.join(root,'assets/v17/managers');fs.mkdirSync(output,{recursive:true});
const sources={
 vintage2011:'https://haddicas-habbo.blogspot.com/2011/12/personagens-hotel.html',
 2021:'https://viajovem.blogspot.com/2021/02/staffs.html',
 staff:'https://habblindados.com.br/pagina/staff-habbo'
};
const rename={flecha:['2021','Flecha'],mordomo:['staff','Mordomo'],'paty-nestle':['2021','Paty-Nestle'],
 'sir-lawnrence':['staff','Sir-Lawnrence'],'4queijos':['2021','4Queijos'],'disco-lee':['2021','Disco-Lee'],
 missfurby:['2021','MissFurby'],reeet:['2021','Reeet'],thedjhabbo:['2021','TheDJHabbo'],acapulca:['2021','Acapulca'],
 prefeita:['staff','Prefeita'],djapamala:['staff','DJapamala']};
const clean=h=>{
 let imgs=[];
 let text=h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
 text=text.replace(/<img\b[^>]*>/gi,t=>{
 const src=t.match(/\bsrc=["']([^"']+)["']/i)?.[1],width=+(t.match(/data-original-width=["'](\d+)/i)?.[1]||t.match(/\bwidth=["'](\d+)/i)?.[1]||0),height=+(t.match(/data-original-height=["'](\d+)/i)?.[1]||t.match(/\bheight=["'](\d+)/i)?.[1]||0);
 imgs.push({src:src?.replace(/&amp;/g,'&'),width,height,tag:t.slice(0,380)});
 return ' [ARCHIVE_IMAGE_'+(imgs.length-1)+'] ';
 }).replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/\s+/g,' ');
 return {text,imgs};
};
const pages={};
for(const [k,url] of Object.entries(sources)){
 const cached=path.join(root,'v17/source-audit',k==='2021'?'mist2021.html':k==='vintage2011'?'haddicas2011.html':'habblindados.html');
 let html;
 if(fs.existsSync(cached))html=fs.readFileSync(cached,'utf8');
 else {const r=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Mozilla/5.0'}});if(!r.ok)throw Error('Cannot read historical page '+k+': '+r.status);html=await r.text();}
 pages[k]=clean(html);
 console.log('Source',k,'images',pages[k].imgs.length);
}
const esc=s=>s.replace(/[.*+?^$()|[\]{}]/g,'\\$&');
function vintageImage(key,name){
 const page=pages[key];
 const n=esc(name);
 let m;
 if(key==='vintage2011')m=page.text.match(new RegExp('\\b'+n+'\\s*\\[ARCHIVE_IMAGE_(\\d+)\\]','i'));
 else m=page.text.match(new RegExp('\\[ARCHIVE_IMAGE_(\\d+)\\]\\s*'+n+'\\s*\\(\\d\\d\\/\\d\\d\\/\\d{4}\\)','i'));
 if(!m)throw Error('Cannot firmly pair a historical portrait with '+name+' ('+key+')');
 const im=page.imgs[Number(m[1])];if(!im?.src)throw Error('Missing archival image for '+name);
 return {url:im.src,origin:sources[key],method:key==='vintage2011'?'2011 blog archival snapshot':'2021 historical retrospective illustrating staff',sourceType:'dated-archive',expectedWidth:im.width,expectedHeight:im.height};
}
function staffImage(name){
 const page=pages.staff;
 const encoded=encodeURIComponent(name);
 const queryRx=new RegExp('user='+encoded+'(?:&|\\b)','i');
 const found=page.imgs.find(im=>im.src&&queryRx.test(im.src));
 if(!found)return {url:'https://www.habbo.com.br/habbo-imaging/avatarimage?action=std&direction=2&head_direction=3&gesture=nrm&size=l&user='+encodeURIComponent(name),origin:'https://www.habbo.com.br/',method:'On-demand official Habbo account render by username; precise 2006–2012 outfit NOT verified',sourceType:'account-based-undated',expectedWidth:0,expectedHeight:0};
 return {url:found.src,origin:sources.staff,method:'Name-labeled former-Staff gallery with account-based Habbo avatar render; not independently dated to classic era',sourceType:'account-based-undated',expectedWidth:0,expectedHeight:0};
}
function dimensions(buf){
 if(buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {format:'png',w:buf.readUInt32BE(16),h:buf.readUInt32BE(20)};
 if(buf.toString('ascii',0,3)==='GIF')return {format:'gif',w:buf.readUInt16LE(6),h:buf.readUInt16LE(8)};
 if(buf[0]===255&&buf[1]===216){let i=2;while(i<buf.length){if(buf[i]!==255)break;const mark=buf[i+1],len=buf.readUInt16BE(i+2);if([192,193,194,195,198,199,201,202].includes(mark))return {format:'jpg',h:buf.readUInt16BE(i+5),w:buf.readUInt16BE(i+7)};i+=2+len;}}
 throw Error('Unsupported or non-image resource');}
const records=[];
for(const p of manifest.profiles){
 const [key,name]=rename[p.id]||[];if(!name)throw Error('Unmapped manager '+p.id);
 const info=key==='staff'?staffImage(name):vintageImage(key,name);
 const resp=await fetch(info.url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'Mozilla/5.0','Referer':info.origin}});
 if(!resp.ok)throw Error('Image fetch failed '+p.id+': '+resp.status);
 const data=Buffer.from(await resp.arrayBuffer()),d=dimensions(data);
 if(data.length<220||d.w<22||d.h<45||d.w>480||d.h>500)throw Error('Not a valid room-scale avatar: '+p.id+' '+JSON.stringify({bytes:data.length,...d}));
 const ext=d.format;const loc='habbo/assets/v17/managers/'+p.id+'.'+ext;
 fs.writeFileSync(path.join(root,'assets/v17/managers',p.id+'.'+ext),data);
 const hash=crypto.createHash('sha256').update(data).digest('hex');
 Object.assign(p,{sprite:'/'+loc,spriteSource:info.url,spriteArchive:info.origin,spriteSourceType:info.sourceType,spriteMethod:info.method,spriteSha256:hash,spriteWidth:d.w,spriteHeight:d.h});
 records.push({id:p.id,name:p.name,bytes:data.length,dimensions:d,sha256:hash,local:loc,...info});
 console.log('VERIFIED',p.name,d.w+'×'+d.h,d.format,hash.slice(0,16),info.sourceType);
}
if(records.length!==12||new Set(records.map(x=>x.sha256)).size!==12)throw Error('Exactly 12 distinct avatar sprites required');
fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(root,'v17/sprite-ledger.json'),JSON.stringify({sourcePolicy:'Original archived Habbo sprites only; never AI-generated. Undated account render is labeled and not claimed historically contemporary.',records},null,2)+'\n');
console.log('ACQUIRED',records.length);
