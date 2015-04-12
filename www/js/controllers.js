var c = angular.module( 'dc.controllers', ['dc.services'] );


// c.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
c.controller('AppCtrl', function() {
	console.log('Controller: app');
});


/**
 * Sign up
 */
c.controller('SignupCtrl', function($scope, db, $rootScope, $state, login) {
	console.log('Controller: signup');
	$scope.user = {};

	$scope.signup = function() {
		console.log('signing up', $scope.user);
		var user;
		db.auth.createUser($scope.user)
		.then(function(userId) {
			user = {
				userId: userId,
				firstName: $scope.user.firstName,
				lastName: $scope.user.lastName,
				email: $scope.user.email
			};
			return db.user.create(user);
		}).then(function() {
			console.log('signup successful');
			login($scope.user);
		}).catch(function (error) {
			console.error('error signing up', error);
		});
	};
});


/**
 * Log in
 */
c.controller('LoginCtrl', function($scope, login) {
	console.log('Controller: login');

	$scope.user = {};
	$scope.user = {
		'email': 'jd@example.com',
		'password': 'asdf'
	};

	$scope.login = function() {
		login($scope.user);
	};
});


/**
 * Log out
 */
c.controller('LogoutCtrl', function(db, $state) {
	console.log('Controller: logout');

	db.auth.logout();
	$state.go('app.login');
});


/**
 * Settings
 */
c.controller('SettingsCtrl', function($scope, db, $rootScope, $state, resumeSession) {
	console.log('Controller: settings');
	resumeSession($scope);

	$scope.update = function() {
		console.log('updating user');
		db.user.update($scope.user).then(function() {
			console.log('update successful');
		}, function(error) {
			console.error('update failed', error);
		});
	};

	$scope.mapCreated = function(map) {
		$scope.map = map;
	};
});


/* User Profile */
c.controller('UserCtrl', function($scope, db, resumeSession, $stateParams) {
	resumeSession($scope);
	db.getUserData($stateParams.userId).then(function(user) {
		$scope.user = user;
	});

	db.getUserDinners($stateParams.userId).then(function(dinners) {
		$scope.dinners = dinners;
	});
});


/* New Dinner */
c.controller('NewDinnerCtrl', function($scope, db, $rootScope, $state, resumeSession, util) {
	console.log('Controller: newdinner');
	resumeSession($scope);

	$scope.dinner = {};
	if ($scope.user) $scope.dinner = {user: $scope.user.uid};

	$scope.create = function() {
		db.newDinner($scope.dinner).then(function(data) {
			console.log('Dinner created', $scope.dinner);
			$state.go('app.lookfor');
		}, function(error) {
			console.error('Error creating dinner', error);
		});
	};

	$scope.fromNow = function() {
		$scope.dinner.takeaway = {
			from : util.now(),
			until : util.now(60),
			enabled: true
		};
	};
});


/* Look for  Dinner */
c.controller('LookForDinnersCtrl', function($scope, db, resumeSession) {
	console.log('Controller: lookfor');
	resumeSession($scope);
	$scope.dinners = db.getDinnersSync();
	//console.log('dinners', $scope.dinners);

	// TODO: remove this. use filter instea
	$scope.getBeginTime = function(dinner) {
		var time;
		if (dinner.dinein && dinner.dinein.enabled) time = dinner.dinein.time;
		else if (dinner.takeaway && dinner.takeaway.enabled) time = dinner.takeaway.from;
		return time;
	};
});


/* Dinner */
c.controller('DinnerCtrl', function($scope, db, resumeSession, $stateParams, $state) {
	resumeSession($scope);

	$scope.application = { count:1 };
	$scope.dinner = db.getDinnerSync($stateParams.dinnerId);
	$scope.applications = db.getDinnerApplicationsSync($stateParams.dinnerId);

	$scope.addCount = function(count, min, max) {
		var newCount = $scope.application.count += count;
		if (newCount < min) newCount = min;
		else if (newCount > max) newCount = max;
		$scope.application.count = newCount;
	};

	$scope.apply = function(dinein) {
		if (dinein) $scope.application.dinein = true;
		else $scope.application.dinein = false;
		$scope.application.userId = $scope.user.uid;
		$scope.application.dinnerId = $scope.dinner.$id;
		db.newApplication($scope.application).then(function(application) {
			console.log('application created:', application)
			// $state.go('app.dinner', {dinnerId: application.dinnerId});
		}, function(error) {
			console.log('error creating application:', error);
		});
	};

	$scope.applicationState = function() {
		var state = "";
		angular.forEach($scope.applications, function(application) {
			if (application.userId === $scope.user.uid) {
				//console.log(application);
				state = application.state;
				$scope.application = application;
			}
		});
		return state;
	};

	$scope.isHost = function() {
		return ($scope.user && $scope.dinner.user === $scope.user.uid);
	};

	$scope.acceptApplication = function(a) {
		a.state = 'accepted';
		db.updateApplicationState(a.$id, 'accepted').then(function() {
			console.log('application accepted');
		}, function(error) {
			console.error('error accepting application', error);
		});
	};
	$scope.declineApplication = function(a) {
		a.state = 'declined';
		db.updateApplicationState(a.$id, 'declined').then(function() {
			console.log('application declined');
		}, function(error) {
			console.error('error declining application', error);
		});
	};
});
