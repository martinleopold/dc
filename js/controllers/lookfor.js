/**
 * Look for Dinners
 */
angular.module('dc.controllers')
.controller('LookForDinnersCtrl', function($scope, db, resumeSession, $filter) {

   console.log('Controller: lookfor');
   resumeSession($scope);

   $scope.dinners = db.dinner.getAll().then(function (dinners) {
      $scope.dinners = dinners;
      console.log('dinners', $scope.dinners);
   });

   $scope.getBeginTime = function(dinner) {
      // TODO: seems not be called
      //console.log('test');
      return $filter('getBeginTime')(dinner);
   };

});
