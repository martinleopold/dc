/**
 * User Profile
 */
angular.module('dc.controllers')
.controller('UserCtrl', function($scope, db, resumeSession, $stateParams) {

   resumeSession($scope);
   db.getUserData($stateParams.userId).then(function(user) {
      $scope.user = user;
   });

   db.getUserDinners($stateParams.userId).then(function(dinners) {
      $scope.dinners = dinners;
   });

});
