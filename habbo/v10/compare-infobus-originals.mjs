import crypto from 'node:crypto';
for(const url of [
'https://habboxwiki.com/wiki/images/e/ee/Gallery_7.gif',
'https://habboxwiki.com/wiki/images/5/50/Infobus.gif',
'https://habbox.com/wp-content/uploads/2018/04/Infobus-1.gif'
]){
 try{
  const resp=await fetch(url,{signal:AbortSignal.timeout(12000)});
  const bytes=Buffer.from(await resp.arrayBuffer());const gif=bytes.subarray(0,3).toString()==='GIF';
  console.log('INFOBUS_REAL_GIF',JSON.stringify({url,status:resp.status,bytes:bytes.length,
   size:gif?[bytes.readUInt16LE(6),bytes.readUInt16LE(8)]:null,
   sha256:crypto.createHash('sha256').update(bytes).digest('hex'),gif}));
 }catch(e){console.log('INFOBUS_REAL_ERROR',url,String(e))}
}
