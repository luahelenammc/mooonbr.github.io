import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const base='https://habborator.org/furniture/';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const ids={
 'holiday-romance':['other_rare/romance.gif'],
 'santa-and-elf':['other_rare/lapland.gif'],
 'aloe-vera':['other_rare/aloe.gif'],
 'dj-turntable':['other_rare/deck.gif'],
 'crusoes-hammock':['other_rare/hammock.gif'],
 'snow-globe':['other_rare/globe.gif'],
 'speakers-corner':['other_rare/speaker.gif'],
 'cola-machine':['other_rare/cola.gif'],
 'infobus-poster':['other_rare/gallery_infobus.gif','other_rare/infobus.gif','other_rare/infobus_poster.gif','other_rare/poster_infobus.gif','posters/infobus.gif','other_rare/infobusposter.gif','other_rare/gallery_infobus_poster.gif']
};
for(const [id,urls] of Object.entries(ids)){
 const tested=[];
 for(const rel of urls){
  const url=base+rel;
  try{
   const resp=await fetch(url,{signal:AbortSignal.timeout(12000)});
   if(!resp.ok){tested.push({url,code:resp.status});continue;}
   const bytes=Buffer.from(await resp.arrayBuffer());
   if(bytes.subarray(0,3).toString()!=='GIF'){tested.push({url,badformat:true});continue;}
   const [w,h]=[bytes.readUInt16LE(6),bytes.readUInt16LE(8)];
   const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
   const dest='habbo/assets/v10/full-rares/'+id+'.gif';
   if(w>38||h>38){
    const file=path.join(root,dest);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);
    tested.push({url,w,h,bytes:bytes.length,sha256,stage:dest,fullCandidate:true});
   }else tested.push({url,w,h,bytes:bytes.length,sha256,fullCandidate:false});
  }catch(e){tested.push({url,error:String(e)})}
 }
 console.log('FULL_NATIVE_SCOUT '+id+' '+JSON.stringify(tested));
}
