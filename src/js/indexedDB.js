// import idb from './indexedDB_library.js';

export default fetch('http://localhost:1337/restaurants').then(function(data){
  return data.json();}).then(function(parsedData){
    return parsedData}).then(function(restaurants){
        return idb.open('restaurants', 1, function(db){
          var restaurantsOS = db.createObjectStore('restaurants', {keyPath: 'id', autoIncrement: true});
          restaurantsOS.put(restaurants);
          return db;
        });
      });

