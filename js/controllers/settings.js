/* global Camera */
/* eslint no-unused-vars:0 */

/**
 * Settings
 */
angular.module('dc.controllers')
.controller('SettingsCtrl', function($scope, db, $rootScope, $state, resumeSession, img, $q, getImageFromPhone) {

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

});
