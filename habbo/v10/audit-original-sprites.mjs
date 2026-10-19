import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const names=[
 ['holiday-romance','holiday'],['santa-and-elf','lappland'],
 ['aloe-vera','aloe'],['dj-turntable','deck'],['crusoes-hammock','hammock'],
 ['snow-globe','globe'],['speakers-corner','speaker'],
 ['cola-machine','cola'],['infobus-poster','gallery_infobus']
];
function dims(buf) {
 if(buf.subarray(0,3).toString()==='GIF')return {width:buf.readUInt16LE(6),height:buf.readUInt16LE(8),format:'GIF'};
 if(buf.subarray(1,4).toString()==='PNG')return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20),format:'PNG'};
 return {format:'unknown'};
}
const local=names.map(([id,file])=>{
 const p='habbo/assets/v6/rares/'+file+'.gif',bytes=fs.readFileSync(path.join(root,p));
 return {id,existing:p,bytes:bytes.length,...dims(bytes)};
});
console.log('EXISTING RARE ASSETS:',JSON.stringify(local,null,2));
const urls=['https://habborator.org/furniture/rare.html','https://habborator.org/furniture/list.html','https://habborator.org/furniture/v7.html','https://www.habborator.org/furniture/rare.html'];
for(const url of urls){
 try {
  const res=await fetch(url,{signal:AbortSignal.timeout(15000)});
  const html=await res.text();
  console.log('PAGE',url,'HTTP',res.status,'LEN',html.length,'IMAGE-REF-SAMPLE',JSON.stringify([...html.matchAll(/(?:src|href)=["']([^"']+\.(?:gif|png))["']/gi)].slice(0,35).map(m=>m[1])));
  for(const [id,key] of names){
   let excerpts=[];
   const reg=new RegExp('('+key+'|'+id.replaceAll('-','[_ -]?')+')','gi');
   let m;while((m=reg.exec(html))&&excerpts.length<4){
    excerpts.push(html.slice(Math.max(0,m.index-260),Math.min(html.length,m.index+330)).replace(/\s+/g,' ').slice(0,550));
   }
   if(excerpts.length)console.log('CANDIDATE',id,'PAGE',url,'EXCERPTS',JSON.stringify(excerpts));
  }
 }catch(err){console.error('FETCH_ERROR',url,String(err));}
}
