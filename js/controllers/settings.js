/* global Camera */
/* eslint no-unused-vars:0 */

/**
 * Settings
 */
angular.module('dc.controllers')
.controller('SettingsCtrl', function($scope, db, $rootScope, $state, resumeSession, img, $q, getImageFromPhone, maps, sliderToDistance, uiGmapGoogleMapApi) {

   console.log('Controller: settings');

   $scope.userData = {};
   resumeSession().then(function (user) {
      $scope.userData = user;
   });

   /**
    * Update User Data
    */
   $scope.update = function() {
      console.log('updating user');
      db.user.update($scope.userData).then(function() {
         $rootScope.user = $scope.userData;
         console.log('update successful');
      }, function(error) {
         console.error('update failed', error);
      });
   };


   /**
    * User Image
    */
   function uploadFrom (source) {
      getImageFromPhone(source).then(function (dataURL) {
         return img.upload( dataURL, $rootScope.user.userId );
      }).then(function (imageRecord) {
         imageRecord.urls = img.urls(imageRecord.public_id);
         console.log('image uploaded ', imageRecord);
         $rootScope.user.image = imageRecord;
         $scope.userData.image = imageRecord;
         return db.user.setImage($rootScope.user.userId, imageRecord);
      });
   }

   $scope.uploadFromLibrary = function() {
      uploadFrom('library');
   };

   $scope.uploadFromCamera = function() {
      uploadFrom('camera');
   };


   /**
    * Map
    */
   $scope.map = {
      zoom: 16,
      options: {
         disableDefaultUI: true,
         disableDoubleClickZoom: true,
         draggable: false,
         scrollwheel: false
      }
   };

   uiGmapGoogleMapApi.then(function (gmaps) {
      $scope.marker = {
         id: 0,
         options: {
            icon: {
               url: './img/pin@2x.png',
               scaledSize: new gmaps.Size(23, 32)
            }
         }
      };
   });

   $scope.$watch("userData.address", function(address) {
      // console.log( "address changed:", address );
      maps.addressToLocation(address).then(function (result) {
         console.log(result.formatted_address, result.location);
         $scope.userData.location = result.location;
      });
   }, true);


   /**
    * Default Search Radius
    */
   $scope.searchRadius = '';
   $scope.$watch("userData.settings.searchradius", function(idx) {
      $scope.searchRadius = sliderToDistance(idx) + 'km';
   });

});
