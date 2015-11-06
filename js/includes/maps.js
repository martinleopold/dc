/* global google */
angular.module('dc.maps', []) // define module and dependencies

.factory('maps', ['$q', function($q) {
    return {

      //
      addressToLocation(address) {
         return $q(function resolver(resolve, reject) {
            var geocoder = new google.maps.Geocoder();
            var request = { 'address': address } ;
            geocoder.geocode(request, function callback(results, status) {
               if (status != 'OK') {
                  reject(status);
                  return;
               }
               var result = results[0];
               resolve({
                  location : [result.geometry.location.lat(), result.geometry.location.lng()],
                  formatted_address : result.formatted_address,
                  partial_match : result.partial_match
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
