import dataPromise from './indexedDB.js';


export class DBHelper{

	static fetchRestaurants(){
		return dataPromise.then(function(db){
			var tx = db.transaction('restaurants');
			var objectStore = tx.objectStore('restaurants');
			return objectStore.getAll();
		}).then(function(obj){return obj[0]});
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
				console.log(results, 'aaaaaaaaaaaaaaaaa');
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
    	let sliced_photo = restaurant.photograph.slice(0,1);
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

	static mapMarkerForRestaurant(restaurant, map){
		const marker = new google.maps.Marker({
			position: restaurant.latlng,
			title: restaurant.name,
			url: DBHelper.urlForRestaurant(restaurant),
			map: map,
			animation: google.maps.Animation.DROP});
		return marker;
	}
	
}

