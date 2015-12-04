angular.module('dc.db.base', ['firebase'])

// define firebase ref as value service so it can be overridden easily
.value( 'fb', new Firebase("https://dinner-collective.firebaseio.com/") )

/*
   dbBase contains:
   ref
   ref.root (=fb)
   settings
   util
   query
*/
.factory('dbBase', ['$rootScope', '$q', '$firebase', 'fb', 'locationArray', 'locationObject', function($rootScope, $q, $firebase, fb, locationArray, locationObject) {
   var ref = { root: fb }; // store firebase references. place the main ref in there as 'root' as well, even though is shorter just to use 'fb'

   var db = {}; // the db interface to be exported (as 'db')
   db.ref = ref; // make refs available for testing
   db.settings = {};
   db.settings.checkArguments = false; // set true to check arguments using the checkObject function

   db.util = {};
   /**
    * Get current firebase URL. Used for testing.
    * @return {String} - URL of the firebase reference currently in use.
    */
   db.util.getRefURL = function() {
      return fb.toString();
   };

   // check that an object is defined and optionally has some defined properties
   // properties can be given as array of strings or as separate string arguments
   function checkObject (obj, properties) {
      if ( ! db.settings.checkArguments ) return true;
      // check obj itself
      if ( typeof obj != 'object' || obj == undefined ) {
         throw new Error(obj + ' is expected to be an object.');
      }
      // if properties is not given or is not an array, create the properties array from arguments
      if ( properties == undefined || !Array.isArray(properties) ) { // == undefined tests for null and undefined
         properties = Array.prototype.slice.call(arguments, 1);
      }
      // check properties
      properties.forEach( function checkProperties (p) {
         if ( obj[p] === undefined ) {
            throw new Error(obj.p + ' is expected to be defined.');
         }
      });
      return true;
   }
   db.util.checkObject = checkObject; // make it available for testing

   // TODO: complete
   // function checkObjectAlt(obj, propLists) {
   //    if ( ! db.settings.checkArguments ) return true;
   //    // check obj itself
   //    if ( typeof obj != 'object' || obj == undefined ) {
   //       throw new Error(obj + ' is expected to be an object.');
   //    }
   //
   // }


   function createError (name, message) {
      var error = new Error(message);
      error.name = name;
      return error;
   }
   db.util.createError = createError;

   db.error = {
      unauthorized : 'UNAUTHORIZED',
      notFound : 'NOT_FOUND'
   };

/*
 * queries can be grouped due to different criteria:
 * technical type (create, update, delete)
 * by context (the view where they might be used)
 * by the data they operate on (type created or returned)
 *
 * general API considerations
 */


/**
 * TODO: return defined errors
 * TODO: move errors and util functions to a seperat file
 * TODO: firebase query helpers: push obj + return id, update object, get by id, get by child
 *
 */


/**
 * @callback successCallback
 * @param result - The result.
 */

/**
 * @callback errorCallback
 * @param reason - The rejection reason.
 */

/**
 * @callback callback
 */

/**
 * Calls one of the success or error callbacks asynchronously as soon as the result is available.
 * @typedef {function} thenFunction
 * @param {successCallback}
 * @param {errorCallback}
 * @returns {Promise} - This promise is fulfilled with the return value of either callback. It is rejected with the error if either callback throws an exception.
 */

/**
 * Sugar for Promise.then(undefined, errorCallback)
 * @typedef {function} catchFunction
 * @param {errorCallback}
 * @returns {Promise} - This promise is fulfilled with the return value of the error callback.
 */

/**
 * Calls the callback as soon as the promise is either fulfilled or rejected. Useful for cleanup.
 * @typedef {function} finallyFunction
 * @param {callback}
 */

/**
 * Angular Promise. Usually from the $q service.
 * @typedef {Object} Promise
 * @property {thenFunction} then
 * @property {catchFunction} catch
 * @property {finallyFunction} finally
 */


/*
 * generic firebase query functions
 * using angular promises
 */
db.query = {};

db.query.set = function set (ref, data) {
   return $q(function resolver (resolve, reject) {
      ref.set(data, function onComplete (error) {
         if (error === null) {
            resolve();
         } else {
            reject(error);
         }
      });
   });
};

db.query.delete = function delete_ (ref) {
   return db.query.set( ref, null );
};

db.query.push = function push (ref, data) {
   return $q(function resolver (resolve, reject) {
      var newRef = ref.push(data, function onComplete (error) {
         if (error === null) {
            resolve(newRef.key());
         } else {
            reject(error);
         }
      });
   });
};

db.query.update = function update (ref, data) {
   return $q(function resolver (resolve, reject) {
      ref.update(data, function onComplete (error) {
         if (error === null) {
            resolve();
         } else {
            reject(error);
         }
      });
   });
};

db.query.get = function get (ref) {
   return $q(function resolver (resolve, reject) {
      ref.once('value', function callback (dataSnapshot) {
         var data = dataSnapshot.val();
         if (data === null) {
            // TODO: alter tests to reflect this change
            // reject( createError(db.error.notFound, 'db.query.get: no data.') );
            resolve(null);
         } else {
            resolve(data);
         }
      }, function cancelCallback (error) {
         reject( createError(db.error.unauthorized, error.message) );
      });
   });
};


   db.geo = {};

   db.geo.set = function set (ref, id, locationObj) {
      var gf = new GeoFire(ref);
      return $q.when( gf.set(id, locationArray(locationObj)) );
   };

   db.geo.get = function get (ref, id) {
      var gf = new GeoFire(ref);
      return $q.when( gf.get(id) );
   };

   db.geo.delete = function get (ref, id) {
      var gf = new GeoFire(ref);
      return $q.when( gf.remove(id) );
   };

   /**
    * distance based query
    * @param  {object} ref       firebase ref with geofire index
    * @param  {object} centerObj center of search. object with latitude and longitude properties
    * @param  {number} radius    search radius in km
    * @return {Promise} array with result objects {key, location, distance} on success
    */
   db.geo.query = function set (ref, centerObj, radius) {
      var gf = new GeoFire(ref);
      return $q(function resolver(resolve) {
         var gq = gf.query({
            center: locationArray(centerObj),
            radius: radius
         });
         var results = [];
         gq.on('key_entered', function (key, location, distance) {
            results.push({
               key: key,
               location: locationObject(location),
               distance: distance
            });
            // console.log(key, location, distance);
         });
         gq.on('ready', function () {
            // console.log('initial state loaded');
            gq.cancel();
            resolve(results);
         });
      });
   };

   return db;
}]);
