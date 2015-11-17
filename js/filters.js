var f = angular.module('dc.filters', []); // create filters module


/**
 * Compute begin time of a dinner.
 * @param  {dinner} 'dinner'
 */
f.filter('getBeginTime', function() {
   return function(dinner) {
      return dinner.dineinAt || dinner.takeawayFrom;
   };
});


/**
 * Calendar Time relative to now.
 * Customize like so: http://momentjs.com/docs/#/customization/calendar/
 * @param  {string} 'timeStr' moment.js-parsable time string
 * @return {string} e.g. 'Today', 'Tomorrow at 2:30', 'Yesterday', etc.)
 */
f.filter('calendarTime', function() {
   return function(timeStr) {
      return moment(timeStr).calendar();
   };
});
