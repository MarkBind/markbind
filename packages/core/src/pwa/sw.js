/* eslint-env serviceworker */
const VERSION = 'v1';
const CACHE_NAME = `unnamed-markbind-app-${VERSION}`;

/**
 * Performs request and updates cache if successful.
 * Returns cached response if request fails.
 * Adapted from: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  event.respondWith(networkFirst(event.request));
});
