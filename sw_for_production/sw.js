var cacheName = 'Global';

var staticAssets = ['/', 'index.html', 'index.js', 'sub.js', 'manifest.json', 'restaurant.html', 'sub.css', 'index.css'];


self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName)
    .then(function(cache) {
      return cache.addAll(staticAssets);
    })
  );
});



self.addEventListener('fetch', function cachingOrServingRequests(event) {
  if (event.request.method != 'GET') return;
  event.respondWith(
    caches.open(cacheName).then(function findResponseInCache(cache) {
      return cache.match(event.request).then(function serveResponseIfFound(response) {
        return response || fetch(event.request).then(function ifNotServeFromNetworkAndCache(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});


self.addEventListener('activate', function cachesCleanUp(event){
	event.waitUntil(
		caches.keys().then(function deleteTheCachesIdontNeed(cacheNames){
			return Promise.all(
				cacheNames.filter(function(cache){
					return cache !== cacheName;
				}).map(function removeFilteredCaches(cache_to_remove){
					return cache.delete(cache_to_remove);
				})
			);
		})
		)
});