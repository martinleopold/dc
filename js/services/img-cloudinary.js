angular.module('dc.img', ['dc.secrets']) // define module (with dependencies)

.factory('img', ['$http', 'secrets', function($http, secrets) {
   function sign(public_id, timestamp) {
      var str = '';
      if (public_id) {
         str += 'public_id=' + public_id + '&';
      }
      str += 'timestamp=' + timestamp;
      str += secrets.cloudinary.api_secret;
      return sha1(str);
   }

    return {

      upload(dataURI, public_id) {
         var data = new FormData();
         var timestamp = moment().unix();
         data.append('file', dataURI);
         if (public_id) {
            data.append('public_id', public_id);
         }
         data.append('api_key', secrets.cloudinary.api_key);
         data.append('timestamp', timestamp);
         data.append('signature', sign(public_id, timestamp));

         return $http.post({
            url: 'https://api.cloudinary.com/v1_1/dinner-collective/image/upload',
            headers: {
               'Content-Type': 'multipart/form-data'
            },
            data
         });
      },

      delete(imageID) {
         imageID = null;
         return imageID;
      }

   };
}]);
