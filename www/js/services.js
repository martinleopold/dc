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
		return db.auth.getCurrentSession()
		.then(function onFulfilled (userId) {
			if ($rootScope.user && $rootScope.user.uid === userId) {
				// no need to refetch user data
				$scope.user = $rootScope.user;
				return $scope.user;
			} else {
				console.log('resuming session for user', userId);
				// fetch user data
				db.user.get(userId).then(function(user) {
					console.log('resume successful', user);
					$rootScope.user = user;
					$scope.user = user;
					return user;
				});
			}
		}).catch(function onRejected (error) {
			$state.go('app.login');
		});
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

s.factory('login', function($rootScope, db, $state) {
	return function(user) {
		console.log("logging in", user);

		return db.auth.login(user).then(function(userId) {
			console.log("getting user", userId);
			db.user.get(userId).then(function (user) {
				console.log("login successful", user);
				$rootScope.user = user;
				$state.go('app.settings');
			});
		}, function(error) {
			console.error('error logging in', error);
			throw error;
		});
	};
});
