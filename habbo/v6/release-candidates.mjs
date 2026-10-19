import fs from 'node:fs';
import path from 'node:path';

// V6 candidate metadata is read only after a verified-asset, written-permission gate.
// Availability in an international archive is NOT evidence of individual hotel issuance.
export function verifiedCandidateRecords(root){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'v6/expected-original-assets.json'),'utf8'));
 const metadata=JSON.parse(fs.readFileSync(path.join(root,'v6/recovered-candidates.json'),'utf8'));
 const byName=new Map(manifest.assets.map(x=>[path.basename(x.path),x]));
 const find=(name)=>{const x=byName.get(name);if(!x)throw Error('V6 asset metadata missing '+name);return x;};
 const rareFilenames={
  'holiday-romance':'holiday.gif','santa-and-elf':'lappland.gif',
  'aloe-vera':'aloe.gif','dj-turntable':'deck.gif','crusoes-hammock':'hammock.gif',
  'snow-globe':'globe.gif','speakers-corner':'speaker.gif',
  'cola-machine':'cola.gif','infobus-poster':'gallery_infobus.gif'
 };
 const rareNames={
  'holiday-romance':['Holiday Romance','Holiday Romance'],
  'santa-and-elf':['Santa e Elfo (Lapland Greetings)','Santa and Elf (Lapland Greetings)'],
  'aloe-vera':['Aloe Vera (Small Plant)','Aloe Vera (Small Plant)'],
  'dj-turntable':['DJ Turntable (DJ Deck)','DJ Turntable (DJ Deck)'],
  'crusoes-hammock':['Rede de Crusoe',"Crusoe's Hammock"],
  'snow-globe':['Snow Globe clássico','Classic Snow Globe'],
  'speakers-corner':['Speaker’s Corner','Speaker’s Corner'],
  'cola-machine':['Máquina de refrigerante Habbo Cola','Habbo Cola Machine'],
  'infobus-poster':['Cartaz do Infobus','Infobus poster furniture']
 };
 const common=(id,asset,names)=>({
  id, code:id, name:{ptBr:names[0],en:names[1]},image:'/'+asset.path,
  provenanceRefs:[asset.source,asset.type==='badge'?'https://habborator.org/badges/general.html':'https://habborator.org/furniture/list.html'],
  hotelStatus:'unknown',rightsStatus:'cleared_by_permission',
  cutoffStatus:'verified_pre2012',year:null,
  description:{
   ptBr:'Peça clássica preservada em arquivo histórico. Presença do sprite não comprova emissão ou disponibilidade em todos os hotéis.',
   en:'Classic archival specimen. A preserved sprite does not establish issuance or availability in every hotel.'
  }
 });
 const rares=metadata.rareConcepts.map(x=>{
  const filename=rareFilenames[x.id];if(!filename)throw Error('Unknown rare '+x.id);
  return {...common(x.id,find(filename),rareNames[x.id]),image:'/habbo/assets/v10/full-rares/'+x.id+'.gif',familyId:x.id,
   familyName:{ptBr:rareNames[x.id][0],en:rareNames[x.id][1]},groupId:x.id};
 });
 const global=metadata.globalBadges.map(x=>{
  const asset=find(x.code+'.gif');
  const n=x.code.startsWith('ACH_BasicClub')?x.code.replace('ACH_BasicClub','HC nível '):
   x.code.startsWith('ACH_VipClub')?x.code.replace('ACH_VipClub','VIP nível '):x.code;
  return {...common(x.code.toLowerCase().replace(/[^a-z0-9]+/g,'-'),asset,[n,n]),
   groupId:x.family,groupName:{ptBr:x.family,en:x.family},badgeCode:x.code,scopeClass:x.scopeClass};
 });
 if(rares.length!==9||global.length!==13)throw Error('Unexpected V6 public candidate count');
 return {rares,globalBadges:global};
}
