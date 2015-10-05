angular.module('dc.db.application', ['dc.db.base'])

.factory('dbApplication', ['dbBase', function(dbBase) {
   var db = dbBase;
   // var fb = db.ref.root;
   // var ref = db.ref;

   var app = {};
   return app;
}]);
