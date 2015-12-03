/**
 * Dinner
 */
angular.module('dc.controllers')
.controller('DinnerCtrl', function($scope, db, resumeSession, $stateParams, uiGmapGoogleMapApi, $state) {

   console.log('Controller: dinner');

   $scope.userIs = {
      hosting : false,
      applying : false,
      pending : false,
      accepted : false
   };

   // accepted guest numbers
   $scope.numAccepted = {
      dineIn : 0,
      takeAway : 0,
      total : 0
   };

   $scope.checkbox = {
      dineIn: false,
      takeAway: false
   };

   $scope.applicationSpots = {
      dineIn:1,
      takeAway:1
   };

   // pending numbers
   $scope.numPending = {
      dineIn : 0,
      takeAway : 0,
      total : 0
   };

   // load user data
   var resumePromise = resumeSession();

   // load dinner
   var dinnerPromise = db.dinner.get($stateParams.dinnerId).then(function (dinner) {
      console.log('dinner', dinner);
      $scope.dinner = dinner;
      return dinner;
   });

   // load host details
   dinnerPromise.then(function () {
      db.user.get($scope.dinner.hostedByUser).then(function (user) {
         console.log('host', user);
         $scope.host = user;
      });
   });

   // set user role flags
   var rolePromise = resumePromise.then(function () {
      return db.dinner.getUserRole($stateParams.dinnerId, $scope.user.userId);
   }).then(function (userFlags) {
      console.log('userIs', userFlags);
      $scope.userIs = userFlags;
      return userFlags;
   });

   // load guests
   var guestsPromise = dinnerPromise.then(function () {
      db.dinner.getGuests($scope.dinner.dinnerId).then(function (guests) {
         console.log('guests', guests);
         $scope.guests = guests;
         return guests;
      });
   });

   // compute guest numbers
   guestsPromise.then(function () {
      var num = {
         dineIn : 0,
         takeAway : 0,
         total : 0
      };
      $scope.numAccepted = _.reduce($scope.guests, function (num, guest) {
         var details = guest.application.details;
         if (details.spotsDinein) {
            num.dineIn += details.spotsDinein;
            num.total += details.spotsDinein;
         }
         if (details.spotsTakeaway) {
            num.takeAway += details.spotsTakeaway;
            num.total += details.spotsTakeaway;
         }
         return num;
      }, num);
   });

   // load applicants (if user is hosting)
   rolePromise.then(function () {
      if ($scope.userIs.hosting) {
         db.dinner.getPending($stateParams.dinnerId).then(function (users) {
            console.log('applicants', users);
            $scope.applicants = users;
         });
      }
   });

   // load pending application details (if user is pending)
   rolePromise.then(function () {
      if ($scope.userIs.pending) {
         db.user.getApplicationsForDinner($scope.user.userId, $stateParams.dinnerId).then(function (apps) {
            console.log(apps);
            if (apps) {
               var details = apps[0].details;
               $scope.numPending = {
                  dineIn : details.spotsDinein,
                  takeAway : details.spotsTakeaway,
                  total : details.spotsTotal
               };
            }
         });
      }
   });

   /**
    * Map
    */
   $scope.map = {
      zoom: 16,
      options: {
         disableDefaultUI: true,
         disableDoubleClickZoom: true,
         draggable: false,
         scrollwheel: false
      }
   };

   uiGmapGoogleMapApi.then(function (gmaps) {
      $scope.marker = {
         id: 0,
         options: {
            icon: {
               url: './img/pin@2x.png',
               scaledSize: new gmaps.Size(23, 32)
            }
         }
      };
   });


   /**
    * Application details
    */
   $scope.addSpot = function(prop, val) {
      if (!prop) return;
      val = val || 1;
      var newVal = $scope.applicationSpots[prop] + val;
      if (newVal > 9) newVal = 9;
      if (newVal < 1) newVal = 1;
      return $scope.applicationSpots[prop] = newVal;
   };

   $scope.subSpot = function(prop, val) {
      if (!prop) return;
      val = -val || -1;
      return $scope.addSpot(prop, val);
   };

   $scope.apply = function() {
      // fill out the application
      var app = {
         details : {
            spotsDinein : 0,
            spotsTakeaway: 0
         }
      };
      app.byUser = $scope.user.userId;
      app.forDinner = $scope.dinner.dinnerId;
      app.host = $scope.dinner.hostedByUser;

      if ($scope.checkbox.dineIn) {
         app.details.spotsDinein = $scope.applicationSpots.dineIn;
      }
      if ($scope.checkbox.takeAway) {
         app.details.spotsTakeaway = $scope.applicationSpots.takeAway;
      }
      app.details.spotsTotal = app.details.spotsDinein + app.details.spotsTakeaway;
      if (!app.details.spotsTotal) return; // sanity check TODO: real validation
      console.log('application', app);
      $state.go( $state.current, $stateParams, {reload: true, notify: true} );
      // db.application.create(app, $scope.user).then(function () {
      //    $state.go( $state.current, $stateParams, {reload: true, notify: true} );
      // });
   };

});
