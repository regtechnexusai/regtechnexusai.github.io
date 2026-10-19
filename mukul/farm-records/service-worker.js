const CACHE='mukul-farm-records-v0.7';
const FILES=['./','./index.html','./styles.css','./manifest.webmanifest','./privacy.html','./source-register.html','./icons/mukul-icon.svg','/mukul/shared-shell.css?v=20261019-6'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('mukul-farm-records-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 const navigation=event.request.mode==='navigate';
 const stylesheet=url.pathname.endsWith('.css');
 if(navigation||stylesheet){
  event.respondWith((async()=>{
   try{
    const response=await fetch(event.request,{cache:'no-store'});
    if(response.ok&&response.type==='basic'){
     const cache=await caches.open(CACHE);
     await cache.put(event.request,response.clone());
    }
    return response;
   }catch(error){
    const cached=await caches.match(event.request);
    if(cached)return cached;
    if(navigation)return(await caches.match('./index.html'))||Response.error();
    return Response.error();
   }
  })());
  return;
 }
 event.respondWith((async()=>{
  const cached=await caches.match(event.request);
  if(cached)return cached;
  try{
   const response=await fetch(event.request);
   if(response.ok&&response.type==='basic')caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));
   return response;
  }catch(error){return Response.error();}
 })());
});