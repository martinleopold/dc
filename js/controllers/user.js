/**
 * User Profile
 */
angular.module('dc.controllers')
.controller('UserCtrl', function($scope, db, resumeSession, $stateParams) {

   resumeSession();

   db.user.get($stateParams.userId).then(function (user) {
      $scope.profile = user;
   });

   db.user.getHostedDinners($stateParams.userId).then(function(dinners) {
      $scope.dinners = dinners;
   });

});
