var f = angular.module('dc.filters', ['dc.img']); // create filters module


/**
 * Compute begin time of a dinner.
 * @param  {dinner} 'dinner'
 * @param  {string} 'formatStr' optional moment.js format string
 * @return iso time string or undefined if no valid time found
 */
f.filter('getBeginTime', function() {
   return function(dinner, formatStr) {
      if (!dinner) return '';
      var time = dinner.dineinAt || dinner.takeawayFrom;
      if (!time) return undefined;

      if (!formatStr) return moment(time).toISOString();
      return moment(time).format(formatStr);
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


/**
 * flatten address object
 * @param  {object} 'address' address object
 * @return {string} string representation of address
 */
f.filter('flattenAddress', function() {
   return function(address) {
      if (!address) return '';
      return `${address.street} ${address.no}, ${address.zip} ${address.city}`;
   };
});
