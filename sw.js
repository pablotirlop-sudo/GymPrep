/* GymPrep - service worker: guarda la app en caché para funcionar sin conexión.
   Si algún día cambias el index.html, sube este número de versión (v2, v3...). */
const CACHE='gymprep-v1';

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html'])).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  /* Navegación: primero red (para recibir actualizaciones), si no hay conexión -> caché */
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(res=>{
      const cl=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cl));return res;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  /* Resto (fuentes, iconos...): caché primero */
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{
    const cl=res.clone();caches.open(CACHE).then(c=>c.put(req,cl));return res;
  })));
});