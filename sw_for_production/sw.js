var cacheName = 'images';
var cacheFile = 'files'

self.addEventListener('install', function runWhenInstalling(event){
	event.waitUntil(
		caches.open(cacheName).then(function caheAll(db){
		db.addAll([
			 './images/1-300_x1.jpg',
			 './images/1-300_x2.jpg',
			 './images/1-500_x1.jpg',
			 './images/1-500_x2.jpg',
			 './images/1-1000_x1.jpg',
			 './images/1-1000_x2.jpg',
			 './images/2-300_x1.jpg',
			 './images/2-300_x2.jpg',
			 './images/2-500_x1.jpg',
			 './images/2-500_x2.jpg',
			 './images/2-1000_x1.jpg',
			 './images/2-1000_x2.jpg',
			 './images/3-300_x1.jpg',
			 './images/3-300_x2.jpg',
			 './images/3-500_x1.jpg',
			 './images/3-500_x2.jpg',
			 './images/3-1000_x1.jpg',
			 './images/3-1000_x2.jpg',
			 './images/4-300_x1.jpg',
			 './images/4-300_x2.jpg',
			 './images/4-500_x1.jpg',
			 './images/4-500_x2.jpg',
			 './images/4-1000_x1.jpg',
			 './images/4-1000_x2.jpg',
			 './images/5-300_x1.jpg',
			 './images/5-300_x2.jpg',
			 './images/5-500_x1.jpg',
			 './images/5-500_x2.jpg',
			 './images/5-1000_x1.jpg', 
			 './images/5-1000_x2.jpg',
			 './images/6-300_x1.jpg',
			 './images/6-300_x2.jpg',
			 './images/6-500_x1.jpg',
			 './images/6-500_x2.jpg',
			 './images/6-1000_x1.jpg',
			 './images/6-1000_x2.jpg',
			 './images/7-300_x1.jpg',
			 './images/7-300_x2.jpg',
			 './images/7-500_x1.jpg',
			 './images/7-500_x2.jpg',
			 './images/7-1000_x1.jpg',
			 './images/7-1000_x2.jpg',
			 './images/8-300_x1.jpg',
			 './images/8-300_x2.jpg',
			 './images/8-500_x1.jpg',
			 './images/8-500_x2.jpg',
			 './images/8-1000_x1.jpg',
			 './images/8-1000_x2.jpg',
		     './images/9-300_x1.jpg',
		     './images/9-300_x2.jpg',
			 './images/9-500_x1.jpg',
		     './images/9-500_x2.jpg',
			 './images/9-1000_x1.jpg',
		     './images/9-1000_x2.jpg',
		     './images/10-300_x1.jpg',
			 './images/10-300_x2.jpg',
		     './images/10-500_x1.jpg',
		     './images/10-500_x2.jpg',
		     './images/10-1000_x1.jpg',
		     './images/10-1000_x2.jpg',
			]);
	}).then(function(){caches.open(cacheFile)}).then(function caheAll(db){
	db.addAll([
		     './index.html',
			 './restaurant.html',
			 './index.js',
			 './sub.js',
			]);
	}).catch(function cachingFailed(err){console.log(err);})
	);
});	
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(cacheName).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
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