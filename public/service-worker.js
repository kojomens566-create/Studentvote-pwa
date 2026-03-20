const CACHE_NAME = 'studentvote-v1';
const urlsToCache = ['/','/?standalone=true','/static/js/main.js','/static/css/main.css','/manifest.json'];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => 
            cache.addAll(urlsToCache)
        ).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => 
            Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
                })
            )
        )
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(response => 
            response || fetch(event.request).then(response => {
                if (!response || response.status !== 200) return response;
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => 
                    cache.put(event.request, responseToCache)
                );
                return response;
            })
        ).catch(() => {
            if (event.request.destination === 'document') return caches.match('/');
        })
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});