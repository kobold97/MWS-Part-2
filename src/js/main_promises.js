import {DBHelper} from './dbhelper_promises.js';
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Service worker registration
/*I'm not sure weather I'm supposed to make another js file called 'service_worker_API' or smth
like that because 'main.js' is already full of code that is completely unreleated to service worker.
/* Here I decided to use delegation pattern (although I dont have other API to delegate
it to the current one yet). It's just my choice. I was also thinking about modular approach.
I'm trying to avoid classes since their implementation in js differs from the one used in other
OO launguages so I didn't even consider using them here (or anywhere else).*/
var serviceWorkerAPI = {

registerServiceWorker(){
  if(!navigator.serviceWorker) return;
  /*This single line of code here took me about 3 hours to figure out. The worst part is that I still don't know
  how this works. The problem is that when I registered it by writing  things like:
  ('service_worker.js') or when I put it into 'js' directory: ('js/service_worker.js')
  than console said that's all ok and registered but when I clicked to see the script in devTools
  than it was always empty and hence didn't do anything at all. Linking it via localhost was 
  the only way for it to work. Did I do something wrong? I'm really curious. The server I'm using
  is simple python server. To run it I go to my directory and type 'pythom -m http.server'.
  Could this behaviour be server related?*/
    navigator.serviceWorker.register('./sw.js')
  /*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
    .then
      (function onRegistered(event){
        console.log('I\'m registered', event);
      })
    .catch
      (function unableToRegister(err){
        console.log(err);
    });
  }
};

serviceWorkerAPI.registerServiceWorker();

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
let restaurants,
  neighborhoods;
window.markers = [];
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
  initMap();
});
/**In order to update the photos I'm now updating all restaurants when resizing*/
window.addEventListener('resize', (event) => {
    updateRestaurants();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
 var fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods().then(function(neighborhoods){
    self.neighborhoods = neighborhoods;
    fillNeighborhoodsHTML();
  });
 }

 var fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) =>{
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
 }

 var fetchCuisines = () => {
  DBHelper.fetchCuisines().then(function(cuisines){
    self.cuisines = cuisines;
    fillCuisinesHTML();
  });
 }

 var fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

var initMap = () => {
  window.map = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1Ijoia29ib2xkOTciLCJhIjoiY2prbDQ1cHN2MDhrejNwczdpY3VtdzVmOSJ9.eohzDoyKyqdrrHcUHVAwLA',
    maxZoom: 18,
    attribution: '',
    id: 'mapbox.streets'
  }).addTo(map);

  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
 var filter = document.querySelector('[name = "neighborhoods"]');
 var cuisines = document.querySelector('[name = "cuisines"]');
 cuisines.addEventListener('change', (event) => {
  updateRestaurants();
 });
 filter.addEventListener('change', (event) => {
  updateRestaurants();
 });

var updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood).then(function(restaurants){
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  );
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */

var resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (window.markers) {
    window.markers.forEach(marker => marker.remove());
  }
  window.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */

 var fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
      ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
 }

 /**
 * Create restaurant HTML.
 */

var createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.setAttribute('aria-label', 'tale storing informations about particular restaurant');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
/*setting alt attribute but since its just a picture@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
  image.setAttribute('alt','picture representing particular restaurant');
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  const tick = document.createElement('button');
  tick.innerHTML = '✓';
  tick.classList.add("red");
  li.append(tick);
  if (restaurant.is_favorite){
    tick.classList.add('green');
    tick.classList.remove('red');
   }
   else{
     tick.classList.add('red');
     tick.classList.remove('green');
   }
  tick.addEventListener('click', function(){
    var status = !restaurant.is_favorite;               
    DBHelper.updateFavoriteStatus(restaurant.id, status);    
    restaurant.is_favorite = !restaurant.is_favorite;      
    changeClass(tick);
  });

  return li
}

  function changeClass(element){
    element.classList.toggle("red");
    element.classList.toggle("green");
  }
 /**
 * Add markers for current restaurants to the map.
 */

var addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, window.map);
    marker.on("click", onClick);

    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
}
