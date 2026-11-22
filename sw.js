/* OtakuLink — service worker : notifications push (app fermée ou en arrière-plan) */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));

self.addEventListener('push',e=>{
  let d={};
  try{d=e.data?e.data.json():{};}catch(_){d={body:e.data?e.data.text():''};}
  const title=d.title||'OtakuLink';
  // iOS exige qu'un push affiche toujours une notification : on l'affiche systématiquement.
  e.waitUntil(self.registration.showNotification(title,{
    body:d.body||'Tu as une nouvelle notification.',
    icon:'apple-touch-icon.png',
    badge:'apple-touch-icon.png',
    tag:d.tag||'otakulink',
    renotify:true,
    vibrate:[120,60,120],
    data:{url:d.url||'./'}
  }));
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
  e.waitUntil((async()=>{
    const wins=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const w of wins){if(w.url.startsWith(self.registration.scope)){await w.focus();return;}}
    await self.clients.openWindow(url);
  })());
});
