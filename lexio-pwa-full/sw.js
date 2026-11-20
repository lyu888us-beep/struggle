/* Lexio 乐词 PWA shell cache. Bump the cache version whenever app assets change. */
const CACHE_NAME = 'lexio-shell-v28-listen-light';
const SHELL_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './pricing.config.json',
  './wordbank.config.json',
  './data/daily-conversation.json',
  './media/install-guide.mp4',
  './media/install-guide-poster.jpg',
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

const bulkAssets=['./data/original-site-wordbank.json',...["card-1", "card-2", "card-3", "card-4", "business-1", "business-2", "business-3", "daily-1", "daily-2", "daily-3", "dining", "shopping", "taxi", "hotel", "flight", "pharmacy", "meeting", "phone", "help", "business-4", "card-5", "card-6", "card-7", "card-8", "card-9", "card-10", "card-11", "card-12", "card-13", "card-14", "s-61eebcc4f149d257", "s-e6855285c174f56d", "s-41f12d9e73831d6e", "s-e40c20cb58450a17", "s-a89d22611821be4f", "s-8d413edff6a2189b", "s-ee5ec6830267c6d6", "s-ad6bc4bb47060387", "s-e41ebecf6274d1d0", "s-9f9641d531114fbc", "s-95a7ebac84a26258", "s-0602c5e6559ea5da", "s-4c8c082d61460318", "s-022adef34c2968ab", "s-c05ff8beeffd771b", "s-773ed0a8a937424b", "s-685f080ea0007777", "s-00ea3529f6942511", "s-e1ed9b7a9c994997", "s-808bfc3491559a7a", "s-251de9171638659e", "s-33c6528e65f5586b", "s-47e830190e3e9880", "s-20b7714c4e6e240f", "s-c13d375aa79ec1f9", "s-696f99971bb85781", "s-73a8c75d9fc0608c", "s-b9462adb598fd238", "s-76089f8f59599eb5", "s-3247e60ab592b24f", "s-e741e657b7e3d4cc", "s-166eae95100b0cf6", "s-f8b504158869c57e", "s-cdacc9472d5559a3", "s-48db8a5ab190125f", "s-61ebb501204f20f0", "s-b2c9a48adbb1f134", "s-e7a782613c71232b", "s-a84d55c18a746383", "s-293e1c76091c6f5c", "s-79418272797280e4", "s-aa1a2447fdc4d3d0", "s-25f364cb7372199f", "s-492c8474ad167f19", "s-9c905d4a5a92e597", "s-7ec73a482fda1969", "s-d94815a082b655ad", "s-1e59a22f6e3034cb", "s-d0c812a12e505dbf", "s-fe434fccdf756bc3", "s-240bd461b8e9ee3c", "s-1677c4de349ce084", "s-f6b6d642905b5d27", "s-2de0a612bc09e0bb", "s-0b8bbccc6e941f6f", "s-41abe0685dca6227", "s-1239f3b5b4c99fb4", "s-9e30b9be3553685b", "s-cbe92c565b16d849", "s-d9279f19b4c7952f", "s-e3a23e76115c4634", "s-aee9cafb388a841c", "s-bf41594e6881edef", "s-6e3901179fba81ba", "s-9957c4f53747dd08", "s-b5acea071e286dcc", "s-0310ffed1fc785d4", "s-03330ab0fff55c56", "s-f41f0d8c8c423152", "s-26d337e80f55c27d", "s-19d3459978935313", "s-6e2d3a6b3fca406b", "s-c197d05216a41c9c", "s-c72438acbacf0171", "s-ef3d0dd5630375e0", "s-cf2fc260bdb371bf", "s-5e60d3b215cc83f8", "s-5faf0a504f7cecf2", "s-08929af5fc30b3c0", "s-0ada36f7e290fa2b", "s-e576b819d172827c", "s-dc1e24301d8ed438", "s-da4c09565648ab8b", "s-2ebf255bb408a0bb", "s-fd2c428bffdabad4", "s-877b22b93367f803", "s-894490614e61de31", "s-b00247732c37b936", "s-24b383891a4ff62e", "s-36560128298fc7ed", "s-4ddd10d0ecc26edf", "s-34d0d4e65a26eef0", "s-e10d03bb011150d4", "s-42152db615fe6416", "s-8763691c7b23f42f", "s-6acc648f8d79bb6f", "s-849f87756bacb10c", "s-1b02d5de3da1f995", "s-e24726b23f75d71d", "s-27540948bef85ff6", "s-c10e5e477abfbe18", "s-d8aeac602e294c2d", "s-bc731f8fea435dbf", "s-598fe3f9fe1e96bc", "s-aab1af08c479d8b7", "s-031a442100bf439b", "s-000261f34f350057", "s-179c204e4845b519", "s-fb64d28d1373a723", "s-e249ff6cf6b052b2", "s-8229eb4febdde346", "s-82af2f1e5cfe0e9e", "s-a0e932f761ab5d1a", "s-03642c92eeb04a9a", "s-08135d529f031b08", "s-35e42879623b1f91", "s-67e51461a6307e95", "s-4244d2c7e3a79ead"].map(n=>'./media/voice/'+n+'.mp3')];
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
self.addEventListener('fetch', event => {
  const request = event.request;
  if (!['GET','HEAD'].includes(request.method)) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if(url.pathname.includes('/media/voice/') && url.pathname.endsWith('.mp3')){
    // A full disk or unavailable Cache Storage must not silence a playable online MP3.
    event.respondWith(localAsset(url.href).then(async r=>mediaResponse(await r.arrayBuffer(),request,'audio/mpeg')).catch(()=>fetch(request)));return;
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
          if (response && response.ok) {
            const copy=response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)).catch(()=>{}));
          }
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
          if (response && response.ok) {
            const copy=response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)).catch(()=>{}));
          }
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
