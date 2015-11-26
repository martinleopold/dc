/**
 * New Dinner
 */
angular.module('dc.controllers')
.controller('NewDinnerCtrl', function($scope, db, $rootScope, $state, resumeSession) {

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
      dinner.dineinAt = moment(dinner.dineinAt).toISOString();
      dinner.takeawayFrom = moment(dinner.takeawayFrom).toISOString();
      dinner.takeawayUntil = moment(dinner.takeawayUntil).toISOString();

      db.dinner.create(dinner).then(function() {
         console.log('Dinner created', $scope.dinner);
         $state.go('app.lookfor');
      }, function(error) {
         console.error('Error creating dinner', error);
      });
   };

});
