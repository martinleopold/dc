/* global Camera */
/* eslint no-unused-vars:0 */

/**
 * Settings
 */
angular.module('dc.controllers')
.controller('SettingsCtrl', function($scope, db, $rootScope, $state, resumeSession, img, $q, getImageFromPhone, maps) {

   console.log('Controller: settings');
   resumeSession($scope);

   /**
    * Update User Data
    */
   $scope.update = function() {
      console.log('updating user');
      db.user.update($scope.user).then(function() {
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
         console.log('image uploaded ', imageRecord);
         $rootScope.user.image = imageRecord;
         $scope.user.image = imageRecord;
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
      center: { latitude: 48.2087105, longitude: 16.372654600000033 }, // Stephansplatz 1, 1010 Wien
      zoom: 16,
      options: {
         disableDefaultUI: true,
         disableDoubleClickZoom: true,
         draggable: false,
         scrollwheel: false
      }
   };

   $scope.marker = {
      id: 'settings'
   };

   $scope.$watch("user.address", function(address) {
      // console.log( "address changed:", address );
      maps.addressToLocation(address).then(function (result) {
         // console.log(result.formatted_address, result.location);
         $scope.map.center = result.location;
         $scope.marker.coords = result.location;
      });
   }, true);

});
