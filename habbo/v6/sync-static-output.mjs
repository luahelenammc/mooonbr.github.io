import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

// V6 Pages sync: generated collection routes ONLY. Never touches the Places Dock.
// --check compares expected bytes; --write copies generated assets to Pages source.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const mode=process.argv.includes('--write')?'write':process.argv.includes('--check')?'check':'dry-run';
const scopes=['pt-br/raros','en/rares','pt-br/raro','en/rare',
 'pt-br/emblemas','en/badges','pt-br/emblema','en/badge','assets/v6','assets/v7','assets/v10'];
const singles=['assets/v5-collections.css','assets/v5-collections.js',
 'assets/v6-experience.css','assets/v6-experience.js',
 'assets/v6-global-badges.css','assets/v6-global-badges.js',
 'assets/v7-classic-display.css','assets/v7-classic-display.js','assets/v7-classic-badges.json',
 'assets/v8-museum.css','assets/v8-museum.js','assets/v8-home.css',
 'assets/v9-home.js','assets/v10-home.css','assets/v10-home.js','assets/v11-home.css','assets/v11-home.js',
 'index.html','pt-br/index.html','en/index.html'];
const report={mode,expected:0,changed:0,missing:0};
if(!fs.existsSync(dist))throw Error('Build output missing. Run BASE_PATH=/habbo node habbo/build.mjs first.');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function checkOne(relative){
 const from=path.join(dist,relative),to=path.join(root,relative);
 if(!fs.existsSync(from))return;
 report.expected++;
 const same=fs.existsSync(to)&&sha(to)===sha(from);
 if(same)return;
 report.changed++;
 if(!fs.existsSync(to))report.missing++;
 console.log((mode==='write'?'COPY':'DIFF')+' '+relative);
 if(mode==='write'){
  fs.mkdirSync(path.dirname(to),{recursive:true});
  fs.copyFileSync(from,to);
 }
}
function walk(directory){
 const base=path.join(dist,directory);
 if(!fs.existsSync(base))return;
 for(const entry of fs.readdirSync(base,{withFileTypes:true})){
  const rel=path.join(directory,entry.name);
  if(entry.isDirectory())walk(rel);
  else if(entry.isFile())checkOne(rel);
 }
}
for(const dir of scopes)walk(dir);
for(const file of singles)checkOne(file);
const obsolete=[];
for(const loc of ['pt-br/emblema','en/badge']){
 const dir=path.join(root,loc);
 if(fs.existsSync(dir))for(const name of fs.readdirSync(dir)){
  if(name.startsWith('badge-br'))obsolete.push(path.join(dir,name));
 }
}
for(const item of obsolete){
 report.changed++;
 console.log((mode==='write'?'REMOVE':'OBSOLETE')+' '+path.relative(root,item));
 if(mode==='write')fs.rmSync(item,{recursive:true,force:true});
}

console.log('V6 Pages source sync:',JSON.stringify(report));
if(mode==='check'&&report.changed)process.exit(1);
