angular.module('dc.img', []) // define module (with dependencies)

.factory('img', ['$http', function($http) {
    return {

      upload(file) {
         var data = new FormData();
         data.append('file', file);
         data.append('api_key', '762859598386344');
         data.append('timestamp', '');
         data.append('signature', '');

         return $http.post({
            url: 'https://api.cloudinary.com/v1_1/dinner-collective/image/upload',
            headers: {
               'Content-Type': 'multipart/form-data'
            },
            data
         });
      }

   };
}]);
