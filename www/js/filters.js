'use strict';

var f = angular.module('dc.filters', []);

/* Compute the begin time of a dinner. */
f.filter('getBeginTime', function () {
	return function (dinner) {
		var time;
		if (dinner.dinein && dinner.dinein.enabled) time = dinner.dinein.time;else if (dinner.takeaway && dinner.takeaway.enabled) time = dinner.takeaway.from;
		return time;
	};
});