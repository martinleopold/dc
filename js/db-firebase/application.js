angular.module('dc.db.application', ['dc.db.base'])

.factory('dbApplication', ['dbBase', '$q', function(dbBase, $q) {
   var db = dbBase;
   // var fb = db.ref.root;
   var ref = db.ref;

   var app = {};

   // create a new application and transfer credits from user
   app.create = function (application, user) {
      return $q(function(resolve) {
         application = _.cloneDeep(application); // don't modify the passed data
         db.util.checkObject(application, 'byUser', 'forDinner', 'numSpots', 'host', 'isPublic', 'details');
         db.util.checkObject(application.details, 'numSpots', 'isDineIn', 'notifyUntil');

         var userId = user.key();
         var applicationId = ref.application.push().key(); // generate new push id
         application.createdAt = Firebase.ServerValue.TIMESTAMP;
         application.status = 'PENDING';
         application.credits = application.numSpots;
         // prepare cross tree update
         var update = {};
         update[`user/${userId}/credits`] = user.credits - application.numSpots;
         update[`application/${applicationId}`] = application;

         resolve(
            db.query.update(ref.root, update)
         );
      });
   };

   // change application details (before the application is ACCEPTED)
   app.guestChange = function (application, user) {
      return $q(function(resolve) {
         db.util.checkObject(application, 'details');
         db.util.checkObject(application.details, 'numSpots', 'isDineIn', 'notifyUntil');
         resolve(
            db.query.update(application.ref().child('details'), application.details)
         );
      });
   };

   // transfers the credits from the application to a user (doRefund or doTransfer)
   app.transferCredits = function (application, user) {
      return $q(function(resolve) {
         var userId = user.key();
         var applicationId = application.key();
         // prepare cross tree update
         var update = {};
         update[`user/${userId}/credits`] = user.credits + application.credits;
         update[`application/${applicationId}`] = {
            updatedAt : Firebase.ServerValue.TIMESTAMP,
            status : 'RESOLVED',
            credits : 0
         };

         resolve(
            db.query.update(ref.root, update)
         );
      });
   };

   return app;
}]);
