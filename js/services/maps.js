/* global google */
angular.module('dc.maps', ['uiGmapgoogle-maps']) // define module (with dependencies)

.factory('maps', ['$q', 'uiGmapGoogleMapApi', function($q, uiGmapGoogleMapApi) {
   function compileAddress(address) {
      // 'Blutgasse 1, 1010 Wien, Austria'
      if (!address) return '';
      if (typeof address == 'string') return address;
      var str = '';
      str += address.street || '';
      str += str && address.no ? ' ' + address.no : (address.no || '');
      str += str && address.zip ? ', ' + address.zip : (address.zip || '');
      str += str && address.city ? ' ' + address.city : (address.city || '');
      str += str && address.country ? ', ' + address.country : (address.country || '');
      return str;
   }

   return {
      //
      compileAddress,

      //
      addressToLocation(address) {
         return uiGmapGoogleMapApi.then(function (gmaps) {
            return $q(function resolver(resolve, reject) {
               var geocoder = new gmaps.Geocoder();
               var request = { 'address': compileAddress(address) } ;
               geocoder.geocode(request, function callback(results, status) {
                  if (status != 'OK') {
                     reject(status);
                     return;
                  }
                  var result = results[0];
                  resolve({
                     location : {
                        latitude: result.geometry.location.lat(),
                        longitude: result.geometry.location.lng()
                     },
                     formatted_address : result.formatted_address,
                     partial_match : result.partial_match
                  });
               });
            });
         });
      },

      testResolve() {
         return $q(function resolver(resolve) {
            resolve();
         });
      },

      testReject() {
         return $q(function resolver(resolve, reject) {
            reject();
         });
      }

   };
}]);
