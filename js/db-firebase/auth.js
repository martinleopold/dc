angular.module('dc.db.auth', ['dc.db.base'])

.factory('dbAuth', ['dbBase', '$q', function(dbBase, $q) {
   var db = dbBase;
   var fb = db.ref.root;
   // var ref = db.ref;

   /*
    * AUTHENTICATION
    *
    * login user
    * logout user
    * current session
    *
    */

   /**
    * @typedef {Object} UserCredentials
    * @property {string} email
    * @property {string} password
    */

   var auth = {};
   /**
    * Create a new user
    * @param {Object} user
    * email, password
    * @return {Promise} - user id on success. Error message on error.
    */
   auth.createUser = function (credentials) {
      return $q(function resolver (resolve, reject) {
         fb.createUser(credentials, function onComplete (error, user) {
            if (error === null) {
               resolve(user.uid);
            } else {
               reject(error);
            }
         });
      });
   };

   /**
    * Login a user with email and password.
    * @param {UserCredentials} credentials
    * email, password
    * @return {Promise} - user id on success. error object on error.
    */
   auth.login = function (credentials) {
      return $q(function resolver (resolve, reject) {
        fb.authWithPassword(credentials, function onComplete (error, session) {
          if (error === null) {
             resolve(session.uid, session);
          } else {
             reject(error);
          }
        });
      });
   };

   auth.logout = function () {
      return $q(function resolver (resolve) {
         fb.onAuth(function onAuth (session) {
            if (session === null) {
               fb.offAuth(onAuth);
               resolve();
            }
         });
         fb.unauth();
      });
   };

   /**
    * [getCurrentSession description]
    * @return {Promise} - user id on success.
    */
   auth.getCurrentSession = function () {
      return $q(function resolver (resolve, reject) {
         var session = fb.getAuth(); // sync
         // console.log('current session:', session);
         if (session === null) {
            // console.log('rejecting');
            reject();
         } else {
            // console.log('resolving');
            resolve(session.uid);
         }
      });
   };

   return auth;
}]);
