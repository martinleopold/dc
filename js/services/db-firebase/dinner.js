angular.module('dc.db.dinner', ['dc.db.base', 'dc.db.application'])

.factory('dbDinner', ['dbBase', '$q', function(dbBase, $q) {
   var db = dbBase;
   var fb = db.ref.root;
   var ref = db.ref;
   var checkObject = db.util.checkObject;

   /*
    * DINNER (All)
    *
    *
    * basic info (title, description, address, time, ...)
    * users that applied/were accepted/were rejected (mutally excl.)
    * messages posted regarding this dinner
    * reviews of this dinner
    *
    */


   ref.dinner = fb.child('dinner');
   ref.dinnerIndex = fb.child('dinnerIndex');
   ref.message = fb.child('message');
   ref.review = fb.child('review');
   var dinner = {};

   dinner.get = function (dinnerId) {
      return db.query.get(
         ref.dinner.orderByKey().equalTo(dinnerId)
      ).then(function (obj) {
         var id = _(obj).keys().first();
         var dinner = _(obj).values().first();
         dinner.dinnerId = id;
         dinner.$id = id;
         return dinner;
      });
   };

   dinner.getAll = function () {
      return db.query.get( ref.dinner );
   };


   dinner.getLocal = function (centerObj, radius) {
      return db.geo.query(ref.dinnerIndex, centerObj, radius).then(function (results) {
         // console.log(results);
         var dinnerPromises = _.map(results, function (result) {
            return dinner.get(result.key).then(function (dinner) {
               dinner.distance = result.distance; // add distance to dinner
               return dinner;
            });
         });
         return $q.all(dinnerPromises);
      });
   };


   dinner.getMessages = function (dinnerId) {
      return db.query.get( ref.message.orderByChild('toDinner').equalTo(dinnerId) );
   };

   dinner.getReviews = function (dinnerId) {
      return db.query.get( ref.review.orderByChild('aboutDinner').equalTo(dinnerId) );
   };

   dinner.createMessage = function (message) {
      return $q(function resolver (resolve) {
         message = _.cloneDeep(message);
         checkObject(message, 'createdAt', 'byUser', 'text');
         message.createdAt = Firebase.ServerValue.TIMESTAMP;
         // TODO: either toDinner or toGroup needs to be set.
         resolve( db.query.create(ref.message.push(message)) );
      });
   };


   dinner.getUserRole = function (dinnerId, userId) {
      var dinnerPromise = db.dinner.get(dinnerId);
      var applicationPromise = db.application.getByUserForDinner(userId, dinnerId);
      var userIs = {
         hosting : false,
         applying : false,
         pending : false,
         accepted : false
      };
      return $q.all([dinnerPromise, applicationPromise]).then(function ([dinner, apps]) {
         var application = apps[0];
         if (userId === dinner.hostedByUser) {
            userIs.hosting = true;
         } else if (!application) {
            userIs.applying = true;
         } else if (application.state === 'PENDING') {
            userIs.pending = true;
         } else if (application.state.indexOf('ACCEPTED') === 0) {
            userIs.accepted = true;
         }
         return userIs;
      });
   };

   // TODO : make this the main method
   dinner.getApplications = function(dinnerId) {
      return db.application.getAllForDinner(dinnerId);
   };

   // get all who have applied for a dinner
   // returns array. each user has an additional 'application' property
   dinner.getAllApplicants = function(dinnerId) {
      return db.dinner.getApplications(dinnerId).then(function (apps) {
         var peoplePromises = _.map(apps, function (app) {
            return db.user.get(app.byUser).then(function (user) {
               user.application = app;
               return user;
            });
         });
         return $q.all(peoplePromises);
      });
   };

   dinner.getGuests = function (dinnerId) {
      return db.dinner.getAllApplicants(dinnerId).then(function (users) {
         return _.filter(users, function (user) {
            return user.application.state.indexOf('ACCEPTED') === 0;
         });
      });
   };

   dinner.getPending = function (dinnerId) {
      return db.dinner.getAllApplicants(dinnerId).then(function (users) {
         return _.filter(users, function (user) {
            return user.application.state === ('PENDING');
         });
      });
   };


   /*
    * DINNER (Host)
    *
    * new dinner (C dinner)
    * close dinner (U dinner)
    * cancel dinner (U dinner)
    * x invite user (C invitation)
    * x invite group (C invitation)
    * accept/reject application (U applicaton)
    *
    * x users that are invited
    *
    */

   // create a new dinner
   // fulfills with the new dinnerId, rejects with the error
   // TODO: test
   dinner.create = function (dinner) {
      dinner = _.cloneDeep(dinner); // don't modify the passed data
      checkObject(dinner, 'hostedByUser', 'title', 'description', 'tags', 'isPublic'); // can throw and thus reject this promise
      // TODO: check for dineinAt or (takeawayFrom and takeawayUntil)
      dinner.createdAt = Firebase.ServerValue.TIMESTAMP;

      return db.query.push(ref.dinner, dinner).then(function (dinnerId) {
         return db.geo.set(ref.dinnerIndex, dinnerId, dinner.location);
      });
   };

   // TODO: test
   // TODO: can't close if cancelled, only possible if host of dinner
   dinner.close = function (dinnerId) {
      var dinner = {
         // dinnerId : dinnerId,
         updatedAt : Firebase.ServerValue.TIMESTAMP,
         closedAt : Firebase.ServerValue.TIMESTAMP
      };
      return db.query.update( ref.dinner.child(dinnerId), dinner );
   };

   // TODO: test
   // TODO: only possible if host of dinner
   dinner.cancel = function (dinnerId) {
      var dinner = {
         // dinnerId : dinnerId,
         updatedAt : Firebase.ServerValue.TIMESTAMP,
         cancelledAt : Firebase.ServerValue.TIMESTAMP
      };
      return db.query.update( ref.dinner.child(dinnerId), dinner );
   };


   /*
    * DINNER (Guest)
    *
    * apply (C application)
    * x accept invitation (U invitation)
    *
    */


   dinner.createReview = function (review) {
      return $q(function resolver (resolve) {
         review = _.cloneDeep(review);
         checkObject(review, 'byUser', 'text', 'aboutDinner', 'aboutUser');
         review.createdAt = Firebase.ServerValue.TIMESTAMP;
         // TODO: either toDinner or toGroup needs to be set.
         resolve( db.query.push(ref.review, review) );
      });
   };

   dinner.createMessage = function (message) {
      return $q(function resolver (resolve) {
         message = _.cloneDeep(message);
         checkObject(message, 'byUser', 'text', 'toDinner');
         message.createdAt = Firebase.ServerValue.TIMESTAMP;
         delete message.toGroup;
         resolve( db.query.push(ref.message, message) );
      });
   };

   return dinner;
}]);
