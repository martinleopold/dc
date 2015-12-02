/**
 * Dinner
 */
angular.module('dc.controllers')
.controller('DinnerCtrl', function($scope, db, resumeSession, $stateParams, uiGmapGoogleMapApi) {

   console.log('Controller: dinner');

   $scope.userIs = {
      hosting : false,
      applying : false,
      pending : false,
      accepted : false
   };

   $scope.application = {
      spotsDinein:1,
      spotsTakeaway:1
   };

   // load user data
   var resumePromise = resumeSession();

   // load dinner and host details
   db.dinner.get($stateParams.dinnerId).then(function (dinner) {
      $scope.dinner = dinner;
      console.log('dinner', dinner);
      //dinner.hostedByUser
      return db.user.get(dinner.hostedByUser);
   }).then(function (user) {
      console.log('host', user);
      $scope.host = user;
   });

   // set user role flags
   resumePromise.then(function () {
      return db.dinner.getUserRole($stateParams.dinnerId, $scope.user.userId);
   }).then(function (userFlags) {
      console.log('userIs', userFlags);
      $scope.userIs = userFlags;
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
    * Spot controls
    */
   $scope.add = function(prop, val) {
      if (!prop) return;
      val = val || 1;
      var newVal = $scope.application[prop] + val;
      if (newVal > 9) newVal = 9;
      if (newVal < 1) newVal = 1;
      return $scope.application[prop] = newVal;
   };

   $scope.sub = function(prop, val) {
      if (!prop) return;
      val = -val || -1;
      return $scope.add(prop, val);
   };


   // $scope.applications = db.getDinnerApplicationsSync($stateParams.dinnerId);

   // $scope.addCount = function(count, min, max) {
   //    var newCount = $scope.application.count += count;
   //    if (newCount < min) newCount = min;
   //    else if (newCount > max) newCount = max;
   //    $scope.application.count = newCount;
   // };
   //
   // $scope.apply = function(dinein) {
   //    if (dinein) $scope.application.dinein = true;
   //    else $scope.application.dinein = false;
   //    $scope.application.userId = $scope.user.uid;
   //    $scope.application.dinnerId = $scope.dinner.$id;
   //    db.newApplication($scope.application).then(function(application) {
   //       console.log('application created:', application);
   //       // $state.go('app.dinner', {dinnerId: application.dinnerId});
   //    }, function(error) {
   //       console.log('error creating application:', error);
   //    });
   // };
   //
   // $scope.applicationState = function() {
   //    var state = "";
   //    angular.forEach($scope.applications, function(application) {
   //       if (application.userId === $scope.user.uid) {
   //          //console.log(application);
   //          state = application.state;
   //          $scope.application = application;
   //       }
   //    });
   //    return state;
   // };
   //
   // $scope.isHost = function() {
   //    return ($scope.user && $scope.dinner.user === $scope.user.uid);
   // };
   //
   // $scope.acceptApplication = function(a) {
   //    a.state = 'accepted';
   //    db.updateApplicationState(a.$id, 'accepted').then(function() {
   //       console.log('application accepted');
   //    }, function(error) {
   //       console.error('error accepting application', error);
   //    });
   // };
   //
   // $scope.declineApplication = function(a) {
   //    a.state = 'declined';
   //    db.updateApplicationState(a.$id, 'declined').then(function() {
   //       console.log('application declined');
   //    }, function(error) {
   //       console.error('error declining application', error);
   //    });
   // };

});
