angular.module('dc.db', ['firebase'])

.factory('db', ['$rootScope', '$q', '$firebase', function($rootScope, $q, $firebase) {
   var fb = new Firebase("https://dinner-collective.firebaseio.com/");
   var db = {};

   /**
    * Sign up a user
    * @param  {Object} credentials  - { firstname, lastname, email, password, passwordCheck }
    * @return {Q} - userDdata on success, error on failure
    */
   db.signup = function(credentials) {
      var d = $q.defer();
      fb.createUser(credentials, function(error) {
         if (error === null) {
            fb.authWithPassword(credentials, function(error, auth) {
               if (error === null) {
                  var user = fb.child('user').child(auth.uid),
                  userData = {
                     uid: auth.uid,
                     firstname: credentials.firstname,
                     lastname: credentials.lastname,
                     email: credentials.email
                  };
                  user.set(userData, function(error) {
                     if (error === null) d.resolve(userData);
                     else d.reject(error);
                  });
               } else d.reject(error);
            });
         }
         else d.reject(error);
      });
      return d.promise;
   };

   /**
    * Log in a user
    * @param  {Object} credentials - { firstname, lastname, email, password, passwordCheck }
    * @return {Q} - userData on success, error on failure
    */
   db.login = function(credentials) {
      var d = $q.defer();
      fb.authWithPassword(credentials, function(error, auth) {
         if (error === null) d.resolve(auth.uid);
         else d.reject(error);
      });
      return d.promise.then(db.getUserData);
   };

   /**
    * Log out the user
    */
   db.logout = function() {
      fb.onAuth(function onAuth(auth) {
          if (auth === null) {
             console.log('user un-authenticated');
             fb.offAuth(onAuth);
          }
      });
      fb.unauth();
      delete $rootScope.user;
   };

   /**
    * Synchronously get current authentication session
    * @return {String} - uid on success, null if not authenticated
    */
   db.currentSession = function() {
      var auth = fb.getAuth();
      // console.log('auth:', auth);
      if (auth != null) return auth.uid;
      else return null;
   };

   /**
    * Get user data
    * @param  {string} uid - unique user id
    * @return {Q} - userData on success, error on failure
    */
   db.getUserData = function(uid) {
      var d = $q.defer();
      var user = fb.child('user').child(uid);
      user.once('value', function(data) {
         d.resolve(data.val());
      }, function(error) {
         d.reject(error);
      });
      return d.promise;
   };

   db.getUserSync = function(userId) {
      var user = fb.child('user').child(userId);
      return $firebase(user).$asObject();
   };


   db.updateUserData = function(userData) {
      var user = fb.child('user').child(userData.uid);
      var d = $q.defer();
      user.update(userData, function onComplete(error) {
         if (error === null) d.resolve();
         else d.reject(error);
      });
      return d.promise;
   };


   db.newDinner = function(dinner) {
      var dinners = fb.child('dinner');
      var d = $q.defer();
      dinners.push(dinner, function onComplete(error) {
         if (error === null) d.resolve();
         else d.reject(error);
      });
      return d.promise;
   };


   // db.getDinners = function(cb) {
   //    var dinners = fb.child('dinner');
   //    var d = $q.defer();
   //    dinners.on('value', function(data) {
   //       if (cb) cb( data.val() );
   //       if (d) {
   //          d.resolve( data.val() );
   //          delete d;
   //       }
   //    });
   //    return d.promise;
   // };

   db.getDinnersSync = function() {
      var dinners = fb.child('dinner');
      var sync = $firebase(dinners).$asArray();
      return sync;
   };


   db.getDinnerSync = function(dinnerId) {
      var dinner = fb.child('dinner').child(dinnerId);
      var sync = $firebase(dinner).$asObject();
      // TODO: proper security. only get user name
      sync.$loaded(function() {
         sync.userData = $firebase(fb.child('user').child(sync.user)).$asObject();
      });
      return sync;
   };

   // db.getUserName = function(userId) {
   //    var firstname = fb.child('dinner').child(dinnerId)
   // };
   //

   db.getUserDinners = function(userId) {
      var dinners = fb.child('dinner').orderByChild('user').startAt(userId).endAt(userId);
      var d = $q.defer();
         dinners.once('value', function(data) {
         d.resolve(data.val());
      }, function(error) {
         d.reject(error);
      });
      return d.promise;
   };


   db.newApplication = function(application) {
      var applications = fb.child('application');
      var d = $q.defer();
      application.state = 'applied';
      applications.push(application, function onComplete(error) {
         if (error === null) d.resolve(application);
         else d.reject(error);
      });
      return d.promise;
   };


   db.getUserApplicationsSync = function(userId) {
      var applications = fb.child('application').orderByChild('userId').startAt(userId).endAt(userId);
      var sync = $firebase(applications).$asObject();
      return sync;
   };


   db.getDinnerApplicationsSync = function(dinnerId) {
      var applications = fb.child('application').orderByChild('dinnerId').startAt(dinnerId).endAt(dinnerId);
      var sync = $firebase(applications).$asArray();
      // load user data
      sync.$loaded(function() {
         angular.forEach(sync, function(application) {
            application.user = db.getUserSync(application.userId);
         });
      });
      return sync;
   };

   db.updateApplicationState = function(aId, state) {
      var a = fb.child('application').child(aId);
      var sync = $firebase(a).$asObject();
      return sync.$loaded(function() {
         sync.state = state;
         sync.$save();
      });
   };

   return db;
}]);