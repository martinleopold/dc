var f = angular.module('dc.filters', ['dc.img']); // create filters module


/**
 * Compute begin time of a dinner.
 * @param  {dinner} 'dinner'
 */
f.filter('getBeginTime', function() {
   return function(dinner) {
      if (!dinner) return '';
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


/**
 * get named user image url
 * @param  {string} 'public_id' cloudinary public id (== userId)
 * @param  {string} 'name' named image version
 * @return {string} image url
 */
f.filter('imageURL', function(img) {
   return function(public_id, name) {
      if (!public_id) return undefined;
      name = name || 'default';
      return img.urls(public_id)[name];
   };
});


/**
 * get transformed user image url
 * @param  {string} 'public_id' cloudinary public id (== userId)
 * @param  {string} 'transform' cloudinary transform string
 * @return {string} image url
 */
f.filter('imageURLWithTransforms', function(img) {
   return function(public_id, transform) {
      if (!public_id) return undefined;
      transform = transform || '';
      return img.url(public_id, transform);
   };
});
