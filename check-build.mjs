import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('data/catalog.js','utf8'),ctx);vm.runInNewContext(fs.readFileSync('i18n.js','utf8'),ctx);const lessons=ctx.window.REEL_LESSONS,dict=ctx.window.REEL_I18N;
assert.equal(lessons.length,77);for(const [g,n] of Object.entries({style:15,text:20,motion:42}))assert.equal(lessons.filter(x=>x.group===g).length,n);
for(const x of lessons){for(const asset of [x.video,x.poster])assert.ok(fs.statSync(asset).size>0,asset);for(const lang of ['zh','en']){assert.ok(x.title[lang]);assert.ok(x.description[lang]);assert.equal(x.signals[lang].length,3);}}
const html=fs.readFileSync('index.html','utf8');for(const m of html.matchAll(/data-i18n(?:-html|-placeholder|-aria|-alt)?="([^"]+)"/g))for(const lang of ['zh','en'])assert.ok(dict[lang][m[1]],`${lang}:${m[1]}`);
for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const p=m[1];if(!p.startsWith('http'))assert.ok(fs.existsSync(p),p);}
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
const app=fs.readFileSync('app.js','utf8');for(const m of app.matchAll(/\$\('#([^' ]+)'\)/g))assert.ok(ids.includes(m[1]),`DOM #${m[1]}`);
assert.ok(!app.includes('scrollIntoView'));
const worker={self:{addEventListener(){},registration:{scope:'http://localhost:4177/'}},importScripts(){},Response};vm.createContext(worker);vm.runInContext(fs.readFileSync('sw.js','utf8'),worker);const data=new Uint8Array([0,1,2,3,4,5,6,7,8,9]);
for(const [range,status,expected] of [['bytes=2-5',206,[2,3,4,5]],['bytes=-3',206,[7,8,9]],['bytes=7-',206,[7,8,9]],['bytes=0-99',206,[0,1,2,3,4,5,6,7,8,9]],['bytes=20-',416,[]],['bytes=8-3',416,[]],['bytes=-',416,[]]]){const r=await worker.ranged(new Response(data),range);assert.equal(r.status,status);assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],expected);}
const pc={self:{}};vm.runInNewContext(fs.readFileSync('precache.js','utf8'),pc);for(const path of pc.self.REEL_PRECACHE)assert.ok(path==='./'||fs.existsSync(path),path);
const mediaBytes=lessons.reduce((n,x)=>n+fs.statSync(x.video).size,0);
fs.mkdirSync('QA',{recursive:true});fs.writeFileSync('QA/build-check.json',JSON.stringify({checkedAt:new Date().toISOString(),lessons:77,groups:{style:15,text:20,motion:42},interfaceStrings:Object.keys(dict.zh).length,mediaMiB:Number((mediaBytes/1024/1024).toFixed(2)),precacheFiles:pc.self.REEL_PRECACHE.length,rangeCases:7,result:'PASS',scope:'Static integrity, bilingual strings and service-worker byte ranges. No physical-device acceptance.'},null,2));console.log('PASS: 77 media pairs, bilingual strings, DOM references, 91 precache entries, 7 byte-range cases.');
