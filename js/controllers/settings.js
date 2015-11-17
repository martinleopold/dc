/**
 * Settings
 */
angular.module('dc.controllers')
.controller('SettingsCtrl', function($scope, db, $rootScope, $state, resumeSession) {

   console.log('Controller: settings');
   resumeSession($scope);

   $scope.update = function() {
      console.log('updating user');
      db.user.update($scope.user).then(function() {
         console.log('update successful');
      }, function(error) {
         console.error('update failed', error);
      });
   };

   $scope.mapCreated = function(map) {
      $scope.map = map;
   };

});
