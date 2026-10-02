const CACHE_NAME='regtech-student-hub-v8';
const CORE=['./','./manifest.webmanifest','../regtech-nexus-ai-logo-2026.png','./bangla/','./aml-cft/','./ifrs/','./privacy.html','./ai-use.html','./knowledge-updates/','./incoterms/','./architecture/','./architecture/index.html'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;

  if(req.mode==='navigate'){
    event.respondWith(
      fetch(new Request(req,{cache:'no-store'})).then(res=>{
        const copy=res.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));
        return res;
      }).catch(()=>caches.match(req).then(r=>r||caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>cached||fetch(req).then(res=>{
      const copy=res.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));
      return res;
    }))
  );
});