angular.module('dc.db', ['dc.db.base', 'dc.db.auth', 'dc.db.user', 'dc.db.dinner', 'dc.db.application'])

.factory('db', ['dbBase', 'dbAuth', 'dbUser', 'dbDinner', 'dbApplication', function(base, auth, user, dinner, application) {
   // augment base object
   let db = _.assign(base, { auth, user, dinner, application });
   console.log(db);
   return db;
}]);
