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

   /**
    * get cloudinary image url with applied transforms
    * @param {string} public_id
    * @param {string} transforms cloudinary transforms string
    * @return {string} image url
    */
   var imageURLWithTransforms =  function(public_id, transforms) {
      if (!transforms) { transforms = ''; }
      return secrets.cloudinary.base_url + '/image/upload/' + transforms + '/' + public_id + '.jpg';
   };

   return {
      /**
       * upload an image to cloudinary
       * @param  {string} dataURI image data (base64 utf8)
       * @param  {string} public_id id used to later retrieve the image
       * @return {Promise} cloudinary image data (public_id, url, width, height, ...) on success.
       */
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

      /**
       * delete an image
       * @param  {string} public_id
       * @return {Promise}
       */
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
      },

      /**
       * get cloudinary image url with applied transforms
       * @param {string} public_id
       * @param {string} transforms cloudinary transforms string
       * @return {string} image url
       */
      url: imageURLWithTransforms,

      /**
       * get predefined/named cloudinary image urls
       * @param {string} public_id
       * @return {string} hash of name to image url
       */
      urls: function(public_id) {
         var defaultURL = imageURLWithTransforms(public_id);
         return {
            'undefined': defaultURL,
            'default' : defaultURL,
            'thumbnail' : imageURLWithTransforms(public_id, 'w_100,h_100,c_fill,g_face:center')
         };
      }

   };
}]);
