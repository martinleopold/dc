/**
 * New Dinner
 */
angular.module('dc.controllers')
.controller('NewDinnerCtrl', function($scope, db, $rootScope, $state, resumeSession) {

   console.log('Controller: newdinner');
   resumeSession($scope);

   $scope.dinner = {
      isPublic: true
   };

   if ($scope.user) {
      $scope.dinner.hostedByUser = $scope.user.userId;
   }

   $scope.create = function() {
      var dinner = _.cloneDeep($scope.dinner);

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
