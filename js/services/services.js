var s = angular.module('dc.services', []);


/**
 * resume the user session if there is one, otherwise redirect to login page
 * $rootScope.user is populated on sucess
 * @return {Promise} user on sucess, null on failure
 */
s.factory('resumeSession', function($rootScope, db, $state) {
   return function() {
      return db.auth.getCurrentSession()
      .then(function onFulfilled (userId) {
         if ($rootScope.user && $rootScope.user.uid === userId) {
            // no need to refetch user data
            return _.cloneDeep($rootScope.user);
         } else {
            console.log('resuming session for user', userId);
            // fetch user data
            return db.user.get(userId).then(function(user) {
               console.log('resume successful', user);
               $rootScope.user = user;
               return _.cloneDeep($rootScope.user);
            });
         }
      }).catch(function onRejected () {
         $state.go('app.login');
         return null;
      });
   };
});


s.factory('login', function($rootScope, db, $state) {
   return function(user) {
      console.log("logging in", user);

      return db.auth.login(user).then(function(userId) {
         console.log("getting user", userId);
         db.user.get(userId).then(function (user) {
            console.log("login successful", user);
            $rootScope.user = user;
            $state.go('app.settings');
         });
      }, function(error) {
         console.error('error logging in', error);
         throw error;
      });
   };
});


s.factory('logout', function($rootScope, db, $state) {
   return function() {
      console.log("logging out");
      $rootScope.user = {}; // immediately remove user from scope
      db.auth.logout().then(function() {
         console.log('logout sucessful');
      }, function (error) {
         console.error('error logging out', error);
      });
      $state.go('login'); // immediately go to login page
   };
});


// ping pending state of a promise to a variable $scope.name
s.factory('bindPending', function() {
   return function(promise, $scope, name) {
      if (!name) name = 'pending';
      // console.log(name);

      function done () {
         console.log('resetting isBusy');
         $scope[name] = false;
      }
      console.log('setting isBusy');
      $scope[name] = true;

      return promise.then(function onResolve (value) {
         done();
         return value;
      }, function onReject (error) {
         done();
         throw error;
      });
   };
});


/* global Camera */
s.factory('getImageFromPhone', function($q) {
   return function getImageFromPhone(source) {
      var options = {
         destinationType: Camera.DestinationType.DATA_URL,
         sourceType: source == 'camera' ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY
      };
      return $q(function resolver(resolve, reject) {
         navigator.camera.getPicture(function onSuccess(imageData) {
            resolve("data:image/jpeg;base64," + imageData);
         }, function onError(message) {
            reject(message);
         }, options);
      });
   };
});


s.factory('sliderToDistance', function() {
   return function sliderToDistance(idx) {
      var dist = [1, 3, 5, 10, 30, 100];
      if (idx < 0) { idx = 0; }
      else if (idx > 5) { idx = 5; }
      return dist[idx];
   };
});


/**
 * convert object to array, preserving the keys as $id.
 * used to be able to order in ng-repeat (which only supports array)
 * @param  obj 'obj' the object to be converted
 * @return {array} the converted array.
 */
s.factory('toArray', function() {
   return function toArray(obj) {
      if (!(obj instanceof Object)) return obj;
      return _.map(obj, function(val, key) {
         return Object.defineProperty(val, '$id', {__proto__: null, value: key});
      });
   };
});


s.factory('locationArray', function() {
   return function locationArray(obj) {
      if (!obj.latitude || !obj.longitude) return undefined;
      return [obj.latitude, obj.longitude];
   };
});


s.factory('locationObject', function() {
   return function locationObject(arr) {
      if (arr.length < 2) return undefined;
      return {
         latitude: arr[0],
         longitude: arr[1]
      };
   };
});


/**
 * convert time string to ISO8601 e.g. '2013-02-04T22:44:30.652Z'
 * @param  {string} 'timeStr' time string to convert
 * @return {string} the iso time string or null if not parseable
 */
s.factory('isoTime', function() {
   return function isoTime(timeStr) {
      if ( !timeStr ) return null;
      var time = moment(timeStr);
      if ( !time.isValid() ) return null;
      return time.toISOString();
   };
});


/**
 * convert time string to unix timestamp (seconds after epoc)
 * @param  {string} 'timeStr' time string to convert
 * @return {string} the unix timestamp or null if not parseable
 */
s.factory('unixTime', function() {
   return function unixTime(timeStr) {
      if ( !timeStr ) return null;
      var time = moment(timeStr);
      if ( !time.isValid() ) return null;
      return time.unix();
   };
});
