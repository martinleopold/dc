var s = angular.module('dc.services', []);

/**
 * A simple example service that returns some data.
 */
s.factory('Friends', function() {
	// Might use a resource here that returns a JSON array

	// Some fake testing data
	var friends = [
		{ id: 0, name: 'Scruff McGruff' },
		{ id: 1, name: 'G.I. Joe' },
		{ id: 2, name: 'Miss Frizzle' },
		{ id: 3, name: 'Ash Ketchum' }
	];

	return {
		all: function() {
			return friends;
		},
		get: function(friendId) {
			// Simple index lookup
			return friends[friendId];
		}
	}
});

s.factory('resumeSession', function($rootScope, db, $q, $state) {
	return function($scope) {
		var d = $q.defer();
		var uid = db.currentSession();
		console.log('user session:', uid);
		if (uid) {
			if ($rootScope.user && $rootScope.user.uid === uid) {
				// no need to refetch user data
				$scope.user = $rootScope.user;
				d.resolve($scope.user);
			} else {
				db.getUserData(uid).then(function(user) {
					$rootScope.user = user;
					$scope.user = user;
					console.log('user:', user);
					d.resolve(user);
				});
			}
		} else {
			d.reject();
			$state.go('app.login');
		}
		return d.promise;
	};
});

s.factory('util', function() {
	return {
		now: function(offsetMins) {
			offsetMins = offsetMins || 0;
			var n = new Date();
			var d = new Date( n.getTime() - n.getTimezoneOffset()*60000 + offsetMins*60000 );
			return (d.toISOString()).substring(0,16);
		}
	};
});
