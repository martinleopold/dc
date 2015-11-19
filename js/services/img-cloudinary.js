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

   // return data property of an object
   var extractData = function(obj) {
      return obj.data;
   };

    return {
      upload: function(dataURI, public_id) {
         var timestamp = moment().unix();

         // this runs a POST request with 'Content-Type: application/json; charset=UTF-8'
         // and data is automatically sent as JSON
         return $http({
            method: 'POST',
            url: secrets.cloudinary.api_url + '/image/upload',
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

      delete: function(public_id) {
         var timestamp = moment().unix();
         return $http({
            method: 'POST',
            url: secrets.cloudinary.api_url + '/image/destroy',
            // headers: {'Content-Type': 'application/json; charset=UTF-8'},
            data: {
               public_id: public_id,
               api_key: secrets.cloudinary.api_key,
               timestamp: timestamp,
               signature: sign(public_id, timestamp)
            }
         }).then(extractData, extractData);
      }

   };
}]);
