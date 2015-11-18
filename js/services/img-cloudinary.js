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
      // TODO
      upload: function(dataURI, public_id) {
         var timestamp = moment().unix();
         var extractData = function(obj) { return obj.data; }; // return data property of an object
         
         // this runs a POST request with 'Content-Type: application/json; charset=UTF-8'
         // and data is automatically sent as JSON
         return $http({
            method: 'POST',
            url: 'https://api.cloudinary.com/v1_1/dinner-collective/image/upload',
            // headers: {'Content-Type': 'application/json; charset=UTF-8'},
            data: {
               file: dataURI,
               public_id: public_id,
               api_key: secrets.cloudinary.api_key,
               timestamp: timestamp,
               signature: sign(public_id, timestamp)
            }
         }).then(extractData, extractData);
      },

      delete: function(imageID) {
         imageID = null;
         return imageID;
      }

   };
}]);
