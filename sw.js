'use strict';
importScripts('./precache.js');
const SHELL='reel-shell-v11',MEDIA='reel-media-v8';
self.addEventListener('install',event=>event.waitUntil(caches.open(SHELL).then(c=>c.addAll(self.REEL_PRECACHE))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('reel-shell-')&&key!==SHELL)await caches.delete(key);await self.clients.claim();})()));
async function ranged(response,range){const bytes=await response.arrayBuffer(),size=bytes.byteLength;const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});let start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));let end=match[1]?(match[2]?Math.min(Number(match[2]),size-1):size-1):size-1;if(start>=size||end<start||!Number.isSafeInteger(start)||!Number.isSafeInteger(end))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':response.headers.get('Content-Type')||'video/mp4','Content-Length':String(end-start+1),'Content-Range':`bytes ${start}-${end}/${size}`,'Accept-Ranges':'bytes'}});}
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||!req.url.startsWith(self.registration.scope)||url.origin!==location.origin)return;
if(url.pathname.endsWith('.mp4')){event.respondWith((async()=>{const hit=await(await caches.open(MEDIA)).match(url.href);if(hit)return req.headers.has('Range')?ranged(hit,req.headers.get('Range')):hit;try{return await fetch(req);}catch{return new Response('Video not saved offline',{status:503});}})());return;}
if(req.mode==='navigate'){event.respondWith(fetch(req).catch(()=>caches.match(new URL('./index.html',self.registration.scope).href)));return;}
event.respondWith((async()=>{const hit=await(await caches.open(SHELL)).match(req);return hit||fetch(req);})());
});
