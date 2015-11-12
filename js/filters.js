var f = angular.module('dc.filters', []);

/* Compute the begin time of a dinner. */
f.filter('getBeginTime', function() {
   return function(dinner) {
    return dinner.dineinAt || dinner.takeawayFrom;

   };
});
