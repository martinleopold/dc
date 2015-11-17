/**
 * Sign up
 */
angular.module('dc.controllers')
.controller('SignupCtrl', function($scope, db, $rootScope, $state, login) {

   console.log('Controller: signup');
   $scope.user = {};

   $scope.signup = function() {
      console.log('signing up', $scope.user);
      var user;
      db.auth.createUser($scope.user)
      .then(function(userId) {
         user = {
            userId: userId,
            firstName: $scope.user.firstName,
            lastName: $scope.user.lastName,
            email: $scope.user.email
         };
         return db.user.create(user);
      }).then(function() {
         console.log('signup successful');
         login($scope.user);
      }).catch(function (error) {
         console.error('error signing up', error);
      });
   };

});
