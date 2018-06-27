var cacheName = 'Global';

var staticAssets = ['index.html', 'index.js', 'sub.js', 'manifest.json', 'restaurant.html', 'sub.css', 'index.css'
,"./images/1-300_x1.jpg", "./images/1-300_x2.jpg",
       "./images/1-500_x1.jpg", "./images/1-500_x2.jpg", "./images/1-1000_x1.jpg",
        "./images/1-1000_x2.jpg", "./images/2-300_x1.jpg", "./images/2-300_x2.jpg",
         "./images/2-500_x1.jpg", "./images/2-500_x2.jpg", "./images/2-1000_x1.jpg",
          "./images/2-1000_x2.jpg", "./images/3-300_x1.jpg", "./images/3-300_x2.jpg",
           "./images/3-500_x1.jpg", "./images/3-500_x2.jpg", "./images/3-1000_x1.jpg",
            "./images/3-1000_x2.jpg", "./images/4-300_x1.jpg", "./images/4-300_x2.jpg",
             "./images/4-500_x1.jpg", "./images/4-500_x2.jpg", "./images/4-1000_x1.jpg",
              "./images/4-1000_x2.jpg", "./images/5-300_x1.jpg", "./images/5-300_x2.jpg",
               "./images/5-500_x1.jpg", "./images/5-500_x2.jpg", "./images/5-1000_x1.jpg", 
               "./images/5-1000_x2.jpg", "./images/6-300_x1.jpg", "./images/6-300_x2.jpg",
                "./images/6-500_x1.jpg", "./images/6-500_x2.jpg", "./images/6-1000_x1.jpg",
                 "./images/6-1000_x2.jpg", "./images/7-300_x1.jpg", "./images/7-300_x2.jpg",
                  "./images/7-500_x1.jpg", "./images/7-500_x2.jpg", "./images/7-1000_x1.jpg",
                   "./images/7-1000_x2.jpg", "./images/8-300_x1.jpg", "./images/8-300_x2.jpg",
                    "./images/8-500_x1.jpg", "./images/8-500_x2.jpg", "./images/8-1000_x1.jpg",
                     "./images/8-1000_x2.jpg", "./images/9-300_x1.jpg", "./images/9-300_x2.jpg",
                      "./images/9-500_x1.jpg", "./images/9-500_x2.jpg", "./images/9-1000_x1.jpg",
                       "./images/9-1000_x2.jpg", "./images/10-300_x1.jpg", "./images/10-300_x2.jpg",
                        "./images/10-500_x1.jpg", "./images/10-500_x2.jpg", "./images/10-1000_x1.jpg",
                         "./images/10-1000_x2.jpg",
                              '/icons/icons-192.png',
                              '/icons/icons-512.png',

      ];


self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName)
    .then(function(cache) {
      return cache.addAll(staticAssets);
    })
  );
});



self.addEventListener('fetch', function cachingOrServingRequests(event) {
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