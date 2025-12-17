/* eslint-env serviceworker */
const VERSION = 'v1';
const CACHE_NAME = `unnamed-markbind-app-${VERSION}`;

async function cacheFirstWithRefresh(request) {
  const fetchResponsePromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return (await caches.match(request) || (fetchResponsePromise));
}

self.addEventListener('fetch', (event) => {
  event.respondWith(cacheFirstWithRefresh(event.request));
});
