angular.module('dc.maps', []) // define module and dependencies

.factory('maps', [function() {
    return {
      addressToLocation(address) {
         return [0,0];
      }
   };
}]);
