/**
 * Look for Dinners
 */
angular.module('dc.controllers')
.controller('LookForDinnersCtrl', function($scope, db, resumeSession) {

   console.log('Controller: lookfor');
   resumeSession($scope);
   $scope.dinners = db.dinner.getAll().then(function (dinners) {
      $scope.dinners = dinners;
      console.log('dinners', $scope.dinners);
   });

   // TODO: remove this. use filter instead
   $scope.getBeginTime = function(dinner) {
      var time;
      if (dinner.dinein && dinner.dinein.enabled) time = dinner.dinein.time;
      else if (dinner.takeaway && dinner.takeaway.enabled) time = dinner.takeaway.from;
      return time;
   };

});
