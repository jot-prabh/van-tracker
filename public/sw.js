self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('van-tracker-cache').then(cache => {
      return cache.addAll([
        '/',
        '/driver.html',
        '/dashboard.html',
        '/style.css',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
