import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const candidates=JSON.parse(fs.readFileSync(path.join(root,'habbo/v7/classic-global-candidates.json'),'utf8'));
const v6=JSON.parse(fs.readFileSync(path.join(root,'habbo/v6/expected-original-assets.json'),'utf8'));
const acceptedHosts=new Set(['images.habbo.com','www.habborator.org','habborator.org']);
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const assetDir=path.join(root,'habbo/assets/v7/badges');
fs.mkdirSync(assetDir,{recursive:true});

async function readBadge(record){
  const dest=path.join(assetDir,record.code+'.gif');
  if(fs.existsSync(dest)){
    const data=fs.readFileSync(dest);
    if((data.subarray(0,6).toString('ascii')==='GIF89a'||data.subarray(0,6).toString('ascii')==='GIF87a')&&data.length<1000000){
      return {ok:true,bytes:data,sourceUrl:'verified_existing_archive',width:data.readUInt16LE(6),height:data.readUInt16LE(8)};
    }
  }
  let lastError='';
  for(const candidate of record.sourceCandidates){
    const url=new URL(candidate);
    if(url.protocol!=='https:'||!acceptedHosts.has(url.hostname)) throw Error('Unknown image host');
    for(let attempt=1;attempt<=2;attempt++){
      try{
        const response=await fetch(candidate,{redirect:'follow',signal:AbortSignal.timeout(13000),
          headers:{accept:'image/gif,image/*;q=0.7','user-agent':'Mozilla/5.0 (compatible; Moon Nostalgia historical archive; https://www.mooon.com.br/habbo/)'}});
        if(!response.ok)throw Error('HTTP '+response.status);
        const b=Buffer.from(await response.arrayBuffer());
        if(b.length<20||b.length>1000000)throw Error('Unusual GIF size: '+b.length);
        const magic=b.subarray(0,6).toString('ascii');
        if(magic!=='GIF87a'&&magic!=='GIF89a')throw Error('Not an original GIF: '+magic);
        const width=b.readUInt16LE(6),height=b.readUInt16LE(8);
        if(width<5||height<5||width>200||height>200)throw Error('Unusual badge geometry '+width+'x'+height);
        fs.writeFileSync(dest,b);
        return {ok:true,bytes:b,sourceUrl:candidate,width,height};
      }catch(e){lastError=String(e);}
    }
  }
  return {ok:false,error:lastError||'No valid sources'};
}
const processed=[];
const queue=candidates.records.slice();
const workers=Array.from({length:6},async()=>{
 while(queue.length){
  const record=queue.shift();
  const result=await readBadge(record);
  if(result.ok){
   processed.push({...record,image:'/habbo/assets/v7/badges/'+record.code+'.gif',
     sha256:digest(result.bytes),width:result.width,height:result.height,
     downloadedSource:result.sourceUrl,archivalStatus:'original_sprite_verified',releaseBasis:'conditional_noncommercial_fansite_policy'});
   console.log('VERIFIED '+record.code+' '+result.width+'x'+result.height+' '+digest(result.bytes).slice(0,12));
  }else{
   processed.push({...record,archivalStatus:'not_available',fetchError:result.error});
   console.log('PENDING '+record.code+': '+result.error);
  }
 }
});
await Promise.all(workers);
const verified=processed.filter(q=>q.archivalStatus==='original_sprite_verified');
const pending=processed.filter(q=>q.archivalStatus!=='original_sprite_verified');
const originals=v6.assets.filter(x=>x.type==='badge');
if(originals.length!==13)throw Error('V6 baseline must contain exactly 13 global badges');
const existing=originals.map(x=>{
 const local=path.join(root,x.path);
 if(!fs.existsSync(local)) throw Error('Missing V6 baseline '+x.path);
 const bytes=fs.readFileSync(local);
 if(digest(bytes)!==x.sha256)throw Error('V6 original integrity regression '+x.path);
 const code=path.basename(x.path,'.gif');
 const family=code.startsWith('ACH_')?'club':code==='EHR'?'campaigns':'club';
 const names=code==='EHR'?['Hora do Planeta','Earth Hour']:
  code.startsWith('ACH_BasicClub')?['Habbo Club · nível '+code.slice(-1),'Habbo Club · level '+code.slice(-1)]:
  code.startsWith('ACH_VipClub')?['VIP · nível '+code.slice(-1),'VIP · level '+code.slice(-1)]:
  ['Habbo Club · '+code,'Habbo Club · '+code];
 return {code,category:family,label:{ptBr:names[0],en:names[1]},
  archivedBefore:'2011-12-31',archivePage:'https://www.habborator.org/badges/general.html',
  distributionScope:'international_archive_distribution_not_necessarily_every_hotel',regionalStatus:'not_proven_for_every_hotel',
  image:'/habbo/'+x.path.replace(/^habbo\//,''),sha256:x.sha256,width:bytes.readUInt16LE(6),height:bytes.readUInt16LE(8),
  downloadedSource:x.source,archivalStatus:'original_sprite_verified',originalV6:true,
  detail:{ptBr:'/habbo/pt-br/emblema/'+code.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'/',
    en:'/habbo/en/badge/'+code.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'/'}
 };
});
const all=[...existing,...verified.sort((a,b)=>a.code.localeCompare(b.code,'en',{numeric:true}))];
if(verified.length<45)throw Error('Too few real classic global badge sprites verified: '+verified.length+' of '+candidates.records.length);
const families=[{key:'club',title:{ptBr:'Habbo Club e VIP',en:'Habbo Club and VIP'}},
 ...candidates.groups,
 {key:'campaigns',title:{ptBr:'Campanhas internacionais',en:'International campaigns'}}];
const output={schemaVersion:'7.1',status:'verified_historical_display',yearLimit:2011,
 labelWarning:{ptBr:'Presença no arquivo internacional não comprova distribuição em todos os hotéis.',
  en:'Presence in international archives does not prove issuance in every hotel.'},
 families,records:all,coverage:{existingOriginalV6:existing.length,newlyVerified:verified.length,
  totalOriginalSprites:all.length,unverifiedOrMissing:pending.length},
 pending:pending.map(x=>({code:x.code,reason:x.fetchError})),
 sourcePage:'https://www.habborator.org/badges/general.html',
 rightsUrl:'https://help.habbo.com/hc/en-us/articles/360011512480-Habbo-Fansite-Policy'};
fs.writeFileSync(path.join(root,'habbo/assets/v7-classics.json'),JSON.stringify(output,null,2)+'\n');
console.log('GLOBAL CLASSIC SPRITES: '+JSON.stringify(output.coverage));
