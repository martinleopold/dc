var s = angular.module('dc.services', []);

/**
 * A simple example service that returns some data.
 */
s.factory('Friends', function() {
   // Might use a resource here that returns a JSON array

   // Some fake testing data
   var friends = [
      { id: 0, name: 'Scruff McGruff' },
      { id: 1, name: 'G.I. Joe' },
      { id: 2, name: 'Miss Frizzle' },
      { id: 3, name: 'Ash Ketchum' }
   ];

   return {
      all: function() {
         return friends;
      },
      get: function(friendId) {
         // Simple index lookup
         return friends[friendId];
      }
   };
});


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

s.factory('util', function() {
   return {
      now: function(offsetMins) {
         offsetMins = offsetMins || 0;
         var n = new Date();
         var d = new Date( n.getTime() - n.getTimezoneOffset()*60000 + offsetMins*60000 );
         //return (d.toISOString()).substring(0,16); // text representation
         return d;
      }
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
