/**
 * Look for Dinners
 */
angular.module('dc.controllers')
.controller('LookForDinnersCtrl', function($scope, db, resumeSession, $filter, toArray, sliderToDistance) {

   console.log('Controller: lookfor');
   resumeSession().then(function () {
      // search query
      $scope.query = {
         center: $scope.user.location,
         radius: sliderToDistance($scope.user.settings.searchradius)
      };
      console.log($scope.query);

      db.dinner.getLocal($scope.query.center, $scope.query.radius).then(function (dinners) {
         console.log(dinners);
         $scope.dinners = dinners;
      });
   });

   // $scope.dinners = db.dinner.getAll().then(function (dinners) {
   //    $scope.dinners = toArray(dinners);
   //    console.log('dinners', $scope.dinners);
   // });

   $scope.getBeginTime = $filter('getBeginTime'); // TODO: put on rootScope
});
