import {DBHelper} from './dbhelper_promises.js';
/*I didn't register service worker here because it's already beeing registered in main.js
and restaurant.html and index.html are the same origin so I don't have to do anything here 
right?*/

let restaurant;
var map;

/* I do this because I have no any other idea how to rerender images when resizing.*/

window.addEventListener('resize', (event) => {
	location.reload();
});
/**
 * Initialize Google map, called from HTML.
 */
 window.initMap = () => {
 	fetchRestaurantFromURL().then(function(restaurant){
 		self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false});
 		fillBreadcrumb();
 		DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    window.addEventListener('load', function(){
    document.querySelector('iframe').setAttribute('title', 'google maps');
    });
 	});
 }


/**
 * Get current restaurant from page URL.
 */
var fetchRestaurantFromURL = () => {
	return new Promise(function(resolve, reject){
		if (self.restaurant){
			resolve(self.restaurant);
		}
		const id = getParameterByName('id');
		if(!id){//no id found in URL
			reject('no restaurant id in URL');
		}
		else{
			DBHelper.fetchRestaurantById(id).then(function(restaurant){
				self.restaurant = restaurant;
				if(!restaurant){
					reject('no such restaurant in url');
				}
				fillRestaurantHTML();
				resolve(restaurant);
			});
		}
});
}
/**
 * Create restaurant HTML and add it to the webpage
 */
 var fillRestaurantHTML = (restaurant = self.restaurant) => {
 	const name = document.getElementById('restaurant-name');
 	name.innerHTML = restaurant.name;

 	const address = document.getElementById('restaurant-address');
 	address.innerHTML = restaurant.address;

 	const image = document.getElementById('restaurant-img');
 	image.className = 'restaurant-img';
 	image.src = DBHelper.imageUrlForRestaurant(restaurant);

 	image.setAttribute('alt', 'picture representing particular restaurant');

 	const cuisine = document.getElementById('restaurant-cuisine');
 	cuisine.innerHTML = restaurant.cuisine_type;

 	//fill operating hours
 	if(restaurant.operating_hours){
 		fillRestaurantHoursHTML();
 	}
 	//fill reviews
 	fillReviewsHTML();
 }

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
var fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

var fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}
/**
 * Create review HTML and add it to the webpage.
 */
var createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
var fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
var getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
