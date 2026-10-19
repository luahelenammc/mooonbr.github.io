import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const input=JSON.parse(fs.readFileSync(path.join(repo,'habbo/v7/classic-general-candidates.json'),'utf8'));
const folder=path.join(repo,'habbo/assets/v7/classic-badges');
fs.mkdirSync(folder,{recursive:true});
const concurrency=8, originals=[],errors=[];
const safeFetch=async(url)=>{
 const response=await fetch(url,{signal:AbortSignal.timeout(13500),
  headers:{'User-Agent':'Mozilla/5.0 (compatible; Moon Nostalgia Archive; +https://www.mooon.com.br/habbo/)','Accept':'image/gif,image/*'}});
 if(!response.ok)throw Error(String(response.status));
 const b=Buffer.from(await response.arrayBuffer());
 if(!['GIF87a','GIF89a'].includes(b.subarray(0,6).toString('ascii')))throw Error('not GIF');
 if(b.length<80||b.length>1500000)throw Error('bad bytes '+b.length);
 const width=b.readUInt16LE(6),height=b.readUInt16LE(8);
 if(width<8||height<8||width>256||height>256)throw Error('bad dimensions '+width+'x'+height);
 return {bytes:b,width,height};
};
async function get(rec){
 const dest=path.join(folder,rec.code+'.gif');
 // Source directory is from Habborator's international pre-2012 archive.
 const urls=[
  'https://habborator.org/badges/badges/'+rec.code+'.gif',
  'https://www.habborator.org/badges/badges/'+rec.code+'.gif',
  'https://images.habbo.com/c_images/album1584/'+rec.code+'.gif'
 ];
 let last='';
 for(const url of urls){
  try{
   const x=await safeFetch(url);
   const hash=crypto.createHash('sha256').update(x.bytes).digest('hex');
   fs.writeFileSync(dest,x.bytes);
   originals.push({...rec,image:'/habbo/assets/v7/classic-badges/'+rec.code+'.gif',sha256:hash,
    sourceUrl:url,archiveSource:input.eraSource,archiveDocumentedNoLaterThan:input.cutoff,
    dateType:'archival_catalogue_snapshot',year:null,hotelDistribution:'not_verified_per_hotel',
    width:x.width,height:x.height});
   console.log('ARCHIVED',rec.code,x.bytes.length,url);
   return;
  }catch(e){last=String(e);}
 }
 errors.push({code:rec.code,reason:last});
 console.warn('MISSING',rec.code,last);
}
const all=input.candidates;
for(let i=0;i<all.length;i+=concurrency)await Promise.all(all.slice(i,i+concurrency).map(get));
const order=new Map(all.map((r,i)=>[r.code,i]));
originals.sort((a,b)=>order.get(a.code)-order.get(b.code));
const ledger={version:1,generatedAt:new Date().toISOString(),cutoff:input.cutoff,
 source:input.eraSource,meaning:'Historical general/international category, not necessarily issued to all hotels',
 families:input.families,items:originals,missing:errors,counts:{candidates:all.length,verified:originals.length,missing:errors.length}};
fs.writeFileSync(path.join(repo,'habbo/v7/classic-catalogue.json'),JSON.stringify(ledger,null,2)+'\n');
console.log('VERIFIED',originals.length,'of',all.length,'original historical GIFs');
if(originals.length<45)throw Error('Not enough verified original classic badge GIFs to publish historical gallery');
