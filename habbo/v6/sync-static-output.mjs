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
 'pt-br/emblemas','en/badges','pt-br/emblema','en/badge','assets/v6','assets/v7'];
const singles=['assets/v5-collections.css','assets/v5-collections.js',
 'assets/v6-experience.css','assets/v6-experience.js',
 'assets/v6-global-badges.css','assets/v6-global-badges.js',
 'assets/v7-classic-badges.css','assets/v7-classic-badges.js','assets/v7-classics.json'];
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
console.log('V6 Pages source sync:',JSON.stringify(report));
if(mode==='check'&&report.changed)process.exit(1);
