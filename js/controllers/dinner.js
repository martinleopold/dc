/**
 * Dinner
 */
angular.module('dc.controllers')
.controller('DinnerCtrl', function($scope, db, resumeSession, $stateParams) {

   console.log('Controller: dinner');
   resumeSession($scope);

   $scope.application = { count:1 };

   // $scope.dinner = db.getDinnerSync($stateParams.dinnerId);
   db.dinner.get($stateParams.dinnerId).then(function (dinner) {
      $scope.dinner = dinner;
      console.log('dinner', dinner);
   });

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
