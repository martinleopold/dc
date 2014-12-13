var c = angular.module('dc.controllers', []);

c.controller('DashCtrl', function($scope) {
})

.controller('FriendsCtrl', function($scope, Friends) {
	$scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
	$scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
	// Form data for the login modal
	$scope.loginData = {};

	// Create the login modal that we will use later
	$ionicModal.fromTemplateUrl('templates/login.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});

	// Triggered in the login modal to close it
	$scope.closeLogin = function() {
		$scope.modal.hide();
	};

	// Open the login modal
	$scope.login = function() {
		$scope.modal.show();
	};

	// Perform the login action when the user submits the login form
	$scope.doLogin = function() {
		console.log('Doing login', $scope.loginData);

		// Simulate a login delay. Remove this and replace with your login
		// code if using a login system
		$timeout(function() {
			$scope.closeLogin();
		}, 1000);
	};
})

.controller('PlaylistsCtrl', function($scope) {
	$scope.playlists = [
		{ title: 'Reggae', id: 1 },
		{ title: 'Chill', id: 2 },
		{ title: 'Dubstep', id: 3 },
		{ title: 'Indie', id: 4 },
		{ title: 'Rap', id: 5 },
		{ title: 'Cowbell', id: 6 }
	];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});


/* Sign up */
c.controller('SignupCtrl', function($scope, db, $rootScope) {
	$scope.user = {};
	$scope.signup = function() {
		console.log('signing up', $scope.user);
		db.signup($scope.user).then( function(userData) {
			console.log('Signup successful', userData);
			$rootScope.user = userData;
			$state.go('app.settings');
		}, function(error) {
			console.error('Error signing up', error);
		});
	};
});

/* Log in */
c.controller('LoginCtrl', function($scope, db, $rootScope, $state) {
	$scope.user = {};
	$scope.login = function() {
		console.log("logging in", $scope.user);
		db.login($scope.user).then(function(userData) {
			console.log("Login successful", userData);
			$rootScope.user = userData;
			$state.go('app.settings');
		}, function(error) {
			console.error('Error logging in', error);
		});
	};
});

/* User Settings*/
c.controller('SettingsCtrl', function($scope, db, $rootScope, $state) {
	console.log('using user:', $rootScope.user);
	$scope.user = $rootScope.user;
	
	$scope.update = function() {
		db.updateUserData($scope.user).then(function() {
			console.log('User update sucessful', $scope.user);
		}, function(error) {
			console.error('Error updating user', error);
		});
	};

	$scope.mapCreated = function(map) {
		$scope.map = map;
	};
});
