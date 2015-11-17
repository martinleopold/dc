/**
 * Log in
 */
angular.module('dc.controllers')
.controller('LoginCtrl', function($scope, login, bindPending) {

   console.log('Controller: login');
   angular.element(document).ready(function () {
      $scope.debug = document[0].body.className;
      console.log($scope.debug);
   });

   $scope.user = {};
   $scope.user = {
      'email': 'jd@example.com',
      'password': 'asdf'
   };

   $scope.login = function() {
      bindPending( login($scope.user), $scope )
      .catch(function(error) {
         $scope.error = error.code;
         throw error;
      });
   };

});
