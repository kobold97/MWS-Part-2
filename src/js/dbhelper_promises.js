import idb from './indexedDB_library.js';


export class DBHelper{

	static dbPromise() {
		return idb.open('db', 1, function(upgradeDb) {
		  switch (upgradeDb.oldVersion) {
			case 0:
			  upgradeDb.createObjectStore('restaurants', {
				keyPath: 'id'
				});
			  var reviewsStore = upgradeDb.createObjectStore('reviews', {
				keyPath: 'id'
				});
				reviewsStore.createIndex('restaurant', 'restaurant_id');
			 }
		});
	  }

	static fetchRestaurants(){
		var self = this;
		return this.dbPromise().then(function(db){
			var tx = db.transaction('restaurants');
			var restaurantStore = tx.objectStore('restaurants');
			return restaurantStore.getAll();
		}).then(function(restaurants){
			if(restaurants.length !== 0){
				return Promise.resolve(restaurants);
			}
			return self.fetchAndCacheRestaurants();
		});
	}

	static fetchAndCacheRestaurants(){
		var self = this;
		return fetch('http://localhost:1337/restaurants').then(function(response){
			return response.json()
		}).then(function(restaurants){
			return self.dbPromise().then(function(db){
				var tx = db.transaction('restaurants', 'readwrite');
				var restaurantStore = tx.objectStore('restaurants');
				restaurants.forEach(function(restaurant){
					restaurantStore.put(restaurant);
				});

				return tx.complete.then(function(){
					return Promise.resolve(restaurants);
				})
			});
		});
	}

	static fetchRestaurantById(id){
		return DBHelper.fetchRestaurants().then(function(restaurants){
			const restaurant = restaurants.find(r => r.id == id);
			if(restaurant){
				return restaurant;
			}
			else throw new Error('No such a restaurant was found');
		});
	}

	static fetchRestaurantByCuisine(cuisine){
		DBHelper.fetchRestaurants().then(function(restaurants){
        	const results = restaurants.filter(r => r.cuisine_type == cuisine);
        	return results;
		});
	}

	static fetchRestaurantByNeighborhood(neighborhood){
		DBHelper.fetchRestaurants().then(function(restaurants){
			const results = restaurants.filter(r => r.neighborhood == neighborhood);
			return results;
		});
	}

	static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood){
		return DBHelper.fetchRestaurants().then(function(restaurants){
			let results = restaurants;
			if(cuisine != 'all'){
				results = results.filter(r => r.cuisine_type == cuisine);
			}
			if (neighborhood != 'all'){
				results = results.filter( r => r.neighborhood == neighborhood);
			}
			return results;
			});
	}

	static fetchNeighborhoods(){
		return DBHelper.fetchRestaurants().then(function(restaurants){
			const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
			const uniqueNeighborhoods = neighborhoods.filter((v , i) => neighborhoods.indexOf(v) == i);
			(uniqueNeighborhoods);
			return uniqueNeighborhoods;
		});
	}

	static fetchCuisines(){
		return DBHelper.fetchRestaurants().then(function(restaurants){
			var cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
			var uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
			return uniqueCuisines;
		});
	}

	static urlForRestaurant(restaurant){
		return (`./restaurant.html?id=${restaurant.id}`);
	}

	static imageUrlForRestaurant(restaurant){
   		/*that suffix is gonna be calculated and later on added to my url*/
   	 	let img_suffix;
   		/*I'm getting screen width*/
    	let screen_width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    	/*I'm gettin dpi*/
    	let device_pixel_ratio = window.devicePixelRatio;
    	/*I cut '.jpg' part of the restaurant.photograph value*/
    	let sliced_photo = restaurant.photograph;
    	/*I'm implementing picture like logic*/
    	if( screen_width <= 550 ){
      	if( device_pixel_ratio <= 1.5 ){
        img_suffix = '-300_x1.jpg';
      	}
      	else {
        img_suffix = '-300_x2.jpg';
      	}
    	}
    	else if ( screen_width <= 900 ){
      	if( device_pixel_ratio <= 1.5 ){
        img_suffix = '-500_x1.jpg';
      	}
      	else {
        img_suffix = '-500_x2.jpg';
      	}
    	} else if ( screen_width >= 901 ){
      	if( device_pixel_ratio <= 1.5 ){
        img_suffix = '-1000_x1.jpg';
      	}
      	else {
        img_suffix = '-1000_x2.jpg';
      	}
    	}
        return (`/images/${sliced_photo}${img_suffix}`);
	}

  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng], {
      title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
    })
    marker.addTo(window.map);
    return marker;
  }
	
  static getStoredObjectById(table, idx, id) {
    return this.dbPromise()
      .then(function(db) {
        if (!db) return;
        const store = db.transaction(table).objectStore(table);
        const indexId = store.index(idx);
        return indexId.getAll(id);
      });
	}
	
	static fetchReviewsByRestId(id) {
    return fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`)
      .then(response => response.json())
      .then(reviews => {
        this.dbPromise()
          .then(db => {
            if (!db) return;
            let tx = db.transaction('reviews', 'readwrite');
            const store = tx.objectStore('reviews');
            if (Array.isArray(reviews)) {
              reviews.forEach(function(review) {
                store.put(review);
              });
            } else {
              store.put(reviews);
            }
          });
        return Promise.resolve(reviews);
      })
      .catch(error => {
        return DBHelper.getStoredObjectById('reviews', 'restaurant', id)
          .then((storedReviews) => {
            return Promise.resolve(storedReviews);
          })
      });
	}

	static addReview(review) {
    if (!navigator.onLine) {
      DBHelper.sendDataWhenOnline(review);
      return Promise.resolve(10000);
    }
    let reviewSend = {
      "restaurant_id": parseInt(review.restaurant_id),
      "name": review.name,
      "rating": parseInt(review.rating),
      "comments": review.comments
    };
    var fetch_options = {
      method: 'POST',
      body: JSON.stringify(reviewSend),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
		};
		
    return fetch(`http://localhost:1337/reviews`, fetch_options).then(function(response) {
			return response.json();
		}).then(function(json){
			return json.id;
	}).then((data) => {(`Fetch successful!`);
		return data;
		})
    .catch(error => ('error:', error));
	}
	
	static sendDataWhenOnline(data) {
		(data);
		var local_key = 0;
		while(localStorage.getItem(local_key)){
			local_key++;
		}
		var json = JSON.stringify(data);
    localStorage.setItem(local_key, json);
    window.addEventListener('online', (event) => {
      let data = JSON.parse(localStorage.getItem(local_key));
      [...document.querySelectorAll(".reviews_offline")]
      .forEach(el => {
        el.classList.remove("reviews_offline");
        [...document.querySelectorAll(".offline_label")].forEach(function(element){
					element.innerText = 'Refresh to delete';
				});
      });
      if (data !== null){
        DBHelper.addReview(data);
        localStorage.removeItem('data');
      }
    });
	}
	
	static updateFavoriteStatus(id, status){
		fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=${status}`, {method: 'PUT'}).then(function(){
			('status');
		}).then(function(){
				DBHelper.dbPromise().then(function(db){
					var tx = db.transaction('restaurants', 'readwrite');
					var restaurantsStore = tx.objectStore('restaurants');
					restaurantsStore.get(id).then(function(restaurant){
						restaurant.is_favorite = status;
						restaurantsStore.put(restaurant);
					});
				});
		})
	}

	static deleteReview(id){
		fetch(`http://localhost:1337/reviews/${id}`,{ method: 'DELETE'}).then(function(){
			DBHelper.dbPromise().then(function(db) {
				var tx = db.transaction('reviews', 'readwrite');
				var store = tx.objectStore('reviews');
				store.delete(id);
				return tx.complete;
			}).then(function() {
			});
	});
}

}
