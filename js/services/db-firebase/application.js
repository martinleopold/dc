angular.module('dc.db.application', ['dc.db.base'])

.factory('dbApplication', ['dbBase', '$q', function(dbBase, $q) {
   var db = dbBase;
   var ref = db.ref;
   var fb = db.ref.root;

   var app = {};


   ref.application = fb.child('application');

   // create a new application and transfer credits from user
   // user object needed for current credits
   app.create = function (application, user) {
      application = _.cloneDeep(application); // don't modify the passed data
      db.util.checkObject(application, 'byUser', 'forDinner', 'details', 'host');
      db.util.checkObject(application.details, 'spotsDinein', 'spotsTakeaway', 'spotsTotal');
      var applicationId = ref.application.push().key(); // generate new push id
      application.createdAt = Firebase.ServerValue.TIMESTAMP;
      application.state = 'PENDING';
      application.credits = application.details.spotsTotal;
      var credits = user.credits ? user.credits : 0;

      // prepare cross tree update (user credits, application)
      var update = {};

      update[`user/${user.userId}/credits`] = credits - application.details.spotsTotal;
      update[`application/${applicationId}`] = application;
      console.log('update', update);
      return db.query.update(ref.root, update);
   };

   app.host_accepts = function(application) {
      var applicationId = application.key();
      return db.query.update(
         ref.root.child(applicationId), {
            state: 'ACCEPTED.IDLE'
         }
      );
   };

   app.host_rejects = function(application) {
      var applicationId = application.key();
      return db.query.update(
         ref.root.child(applicationId), {
            state: 'REFUND_PENDING'
         }
      );
   };

   app.dinner_happened = function(application) {
      var applicationId = application.key();
      return db.query.update(
         ref.root.child(applicationId), {
            state: 'TRANSFER_PENDING'
         }
      );
   };

   app.do_refund = function(application, user) {
      return transferCredits(application, user);
   };

   app.do_transfer = function(application, user) {
      return transferCredits(application, user);
   };

   // transfers the credits from the application to a user (doRefund or doTransfer)
   var transferCredits = function (application, user) {
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



   // // change application details (before the application is ACCEPTED)
   // app.guestChange = function (application, user) {
   //    return $q(function(resolve) {
   //       db.util.checkObject(application, 'details');
   //       db.util.checkObject(application.details, 'numSpots', 'isDineIn', 'notifyUntil');
   //       resolve(
   //          db.query.update(application.ref().child('details'), application.details)
   //       );
   //    });
   // };



   return app;
}]);
