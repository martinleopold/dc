/**
 * Look for Dinners
 */
angular.module('dc.controllers')
.controller('LookForDinnersCtrl', function($scope, db, resumeSession, $filter, toArray) {

   console.log('Controller: lookfor');
   resumeSession($scope);

   $scope.dinners = db.dinner.getAll().then(function (dinners) {
      $scope.dinners = toArray(dinners);
      console.log('dinners', $scope.dinners);
   });

   $scope.getBeginTime = $filter('getBeginTime');
});
