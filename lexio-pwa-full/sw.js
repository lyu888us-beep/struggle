/* Lexio 乐词 PWA shell cache. Bump the cache version whenever app assets change. */
const CACHE_NAME = 'lexio-shell-v25-surface-hierarchy';
const SHELL_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './pricing.config.json',
  './wordbank.config.json',
  './data/daily-conversation.json',
  './media/install-guide.mp4',
  './media/install-guide-poster.jpg',
  './speech/engine.js',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('lexio-shell-') && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

importScripts('./speech/engine.js');
const bulkAssets=['./data/original-site-wordbank.json','./speech/flite.wasm',...['card-1','card-2','card-3','card-4','daily-1','daily-2','daily-3','business-1','business-2','business-3'].map(n=>'./media/voice/'+n+'.mp3')];
async function localAsset(path){
  const cache=await caches.open(CACHE_NAME), cached=await cache.match(path);
  if(cached)return cached;
  const response=await fetch(path);
  if(!response.ok || response.status!==200)throw Error('Incomplete resource');
  await cache.put(path,response.clone()); return response;
}
let warming;
self.addEventListener('message',event=>{
  if(event.data?.type!=='prepare-offline')return;
  warming ||= (async()=>{for(const path of bulkAssets)await localAsset(path);})().finally(()=>{warming=null;});
  event.waitUntil(warming.then(()=>event.ports[0]?.postMessage({ok:true}),()=>event.ports[0]?.postMessage({ok:false})));
});
function mediaResponse(data,request,type){
  const size=data.byteLength,headers={'Content-Type':type,'Accept-Ranges':'bytes'};
  const range=request.headers.get('range'); let start=0,end=size-1;
  if(range){
    const m=/^bytes=(\d*)-(\d*)$/.exec(range);
    if(m && (m[1]||m[2])){
      if(!m[1])start=Math.max(0,size-Number(m[2]));
      else {start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}
    }else start=size;
    if(start>end || start>=size)return new Response(null,{status:416,headers:{...headers,'Content-Range':`bytes */${size}`}});
    headers['Content-Range']=`bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length']=String(end-start+1);
  return new Response(request.method==='HEAD'?null:data.slice(start,end+1),{status:range?206:200,headers});
}
const recentWaves=new Map();
async function sentenceResponse(url,request){
  const text=(url.searchParams.get('text')||'').trim();
  if(!text || text.length>2000)return new Response('Invalid text',{status:400});
  if(!recentWaves.has(text)){
    if(recentWaves.size>=4)recentWaves.delete(recentWaves.keys().next().value);
    recentWaves.set(text,self.renderLexioWave(text,async()=> (await localAsset('./speech/flite.wasm')).arrayBuffer()).catch(e=>{recentWaves.delete(text);throw e;}));
  }
  return mediaResponse(await recentWaves.get(text),request,'audio/wav');
}
self.addEventListener('fetch', event => {
  const request = event.request;
  if (!['GET','HEAD'].includes(request.method)) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if(url.pathname.endsWith('/local-sentence.wav')){event.respondWith(sentenceResponse(url,request).catch(()=>new Response('Voice unavailable',{status:503})));return;}
  if(url.pathname.includes('/media/voice/') && url.pathname.endsWith('.mp3')){
    event.respondWith(localAsset(url.href).then(async r=>mediaResponse(await r.arrayBuffer(),request,'audio/mpeg')));return;
  }
  if(url.pathname.endsWith('/media/install-guide.mp4')){event.respondWith(localAsset(url.href).then(async r=>mediaResponse(await r.arrayBuffer(),request,'video/mp4')));return;}
  if(request.method!=='GET')return;

  // The app shell is served from cache when offline. Fresh navigation responses
  // are cached so the landing page can be revisited without a connection.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          }
          return response;
        })
        .catch(() => caches.match('./index.html').then(cached => cached || caches.match('./')))
    );
    return;
  }

  // Public price / source settings should refresh from the operator's latest
  // config when online, while remaining available from cache offline.
  if (url.pathname.endsWith('/pricing.config.json') || url.pathname.endsWith('/wordbank.config.json')) {
    event.respondWith(
      fetch(request, {cache:'no-store'})
        .then(response => {
          if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Word-bank / phrase content is network-first with a cache fallback.
  // Precache would otherwise pin returning users to old example sentences
  // (the app's own content migration reads this file), so a fresh copy wins
  // whenever the device is online.
  if (url.pathname.includes('/data/') && url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static app assets are cache-first. User-imported word banks are stored in
  // IndexedDB by the app and never sent to a third-party server.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
