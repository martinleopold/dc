/**
 * Look for Dinners
 */
angular.module('dc.controllers')
.controller('LookForDinnersCtrl', function($scope, db, resumeSession, $filter, toArray, sliderToDistance, uiGmapGoogleMapApi, $state) {

   console.log('Controller: lookfor');
   // empty models to avoid errors
   $scope.dinners = [];
   $scope.query = {};
   $scope.marker = {};

   resumeSession().then(function () {
      // search query
      $scope.query = {
         center: $scope.user.location,
         radius: sliderToDistance($scope.user.settings.searchradius)
      };
      console.log('dinner query', $scope.query);

      db.dinner.getLocal($scope.query.center, $scope.query.radius).then(function (dinners) {
         // filter: own dinners, past dinners
         // TODO: filter past dinners
         dinners = _.filter(dinners, function (dinner) {
            return dinner.hostedByUser != $scope.user.userId;
         });
         dinners = _.map(dinners, function (dinner, idx) {
            dinner.markerId = idx;
            return dinner;
         });
         $scope.dinners = dinners;
         console.log('dinners found', dinners);
      });
   });

   // $scope.dinners = db.dinner.getAll().then(function (dinners) {
   //    $scope.dinners = toArray(dinners);
   //    console.log('dinners', $scope.dinners);
   // });

   $scope.getBeginTime = $filter('getBeginTime'); // TODO: put on rootScope

   /**
    * Map
    */
   $scope.isMapView = true;

   $scope.map = {
      zoom: 12,
      options: {
         disableDefaultUI: true,
         disableDoubleClickZoom: false,
         draggable: true,
         scrollwheel: false
      }
   };

   uiGmapGoogleMapApi.then(function (gmaps) {
      $scope.marker = {
         options: {
            icon: {
               url: './img/pin@2x.png',
               scaledSize: new gmaps.Size(23, 32)
            }
         }
      };
   });

   $scope.markerClicked = function(marker, eventName, dinner) {
      $state.go('app.dinner', {dinnerId:dinner.dinnerId});
   };
});
