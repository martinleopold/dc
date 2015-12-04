/**
 * New Dinner
 */
angular.module('dc.controllers')
.controller('NewDinnerCtrl', function($scope, db, $rootScope, $state, resumeSession, isoTime) {

   console.log('Controller: newdinner');
   resumeSession($scope);

   $scope.dinner = {};

   /*
    * Create dinner
    */
   $scope.create = function() {
      var dinner = _.cloneDeep($scope.dinner);

      if ($scope.user) {
         dinner.hostedByUser = $scope.user.userId;
         dinner.address = $scope.user.address;
         dinner.location = $scope.user.location;
      }

      dinner.isPublic = true;
      dinner.dineinAt = isoTime(dinner.dineinAt);
      dinner.takeawayFrom = isoTime(dinner.takeawayFrom);
      dinner.takeawayUntil = isoTime(dinner.takeawayUntil);

      db.dinner.create(dinner).then(function() {
         console.log('Dinner created', dinner);
         $state.go('app.lookfor');
      }, function(error) {
         console.error('Error creating dinner', error);
      });
   };

});
