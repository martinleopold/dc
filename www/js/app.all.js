'use strict';

angular.module('dc.dev', []).config(function ($stateProvider, $urlRouterProvider) {
   $stateProvider.state('dev', {
      url: '/dev',
      abstract: true,
      templateUrl: 'templates/menu.html'
   }).state('dev.menu', {
      url: "/menu",
      views: {
         'mainContent': {
            templateUrl: "templates/developer.html"
         }
      }
   }).state('dev.login', {
      url: "/login",
      views: {
         'mainContent': {
            templateUrl: "templates/login.html"
         }
      }
   }).state('dev.signup', {
      url: "/signup",
      views: {
         'mainContent': {
            templateUrl: "templates/signup.html"
         }
      }
   }).state('dev.newdinner', {
      url: "/newdinner",
      views: {
         'mainContent': {
            templateUrl: "templates/newdinner.html"
         }
      }
   }).state('dev.lookfor', {
      url: "/lookfor",
      views: {
         'mainContent': {
            templateUrl: "templates/lookfor.html"
         }
      }
   }).state('dev.lookfor_filter', {
      url: "/lookfor_filter",
      views: {
         'mainContent': {
            templateUrl: "templates/lookfor_filter.html"
         }
      }
   }).state('dev.profile', {
      url: "/profile",
      views: {
         'mainContent': {
            templateUrl: "templates/profile.html"
         }
      }
   }).state('dev.dinner', {
      url: "/dinner",
      views: {
         'mainContent': {
            templateUrl: "templates/dinner.html"
         }
      }
   }).state('dev.settings', {
      url: "/settings",
      views: {
         'mainContent': {
            templateUrl: "templates/settings.html"
         }
      }
   }).state('dev.notifications', {
      url: "/notifications",
      views: {
         'mainContent': {
            templateUrl: "templates/notifications.html"
         }
      }
   }).state('dev.dinner_list', {
      url: "/dinner_list",
      views: {
         'mainContent': {
            templateUrl: "templates/dinner_list.html"
         }
      }
   }).state('dev.person_list', {
      url: "/person_list",
      views: {
         'mainContent': {
            templateUrl: "templates/person_list.html"
         }
      }
   }).state('dev.person_list_interactive', {
      url: "/person_list_interactive",
      views: {
         'mainContent': {
            templateUrl: "templates/person_list_interactive.html"
         }
      }
   }).state('dev.confirm_application', {
      url: "/confirm_application",
      views: {
         'mainContent': {
            templateUrl: "templates/confirm_application.html"
         }
      }
   });
});
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

'use strict';

angular.module('dc', ['ionic', 'dc.controllers', 'dc.services', 'dc.filters', 'dc.db', 'dc.directives', 'dc.dev']).run(function ($ionicPlatform) {
   $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
         cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
         // org.apache.cordova.statusbar required
         StatusBar.styleDefault();
      }
   });
}).config(function ($stateProvider, $urlRouterProvider) {

   // Ionic uses AngularUI Router which uses the concept of states
   // Learn more here: https://github.com/angular-ui/ui-router
   // Set up the various states which the app can be in.
   // Each state's controller can be found in controllers.js
   $stateProvider.state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
   }).state('logout', {
      url: '/logout',
      onEnter: function onEnter(logout) {
         logout();
      }
   }).state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller: 'SignupCtrl'
   }).state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
   }).state('app.settings', {
      url: '/settings',
      views: {
         'mainContent': {
            templateUrl: 'templates/settings.html',
            controller: 'SettingsCtrl'
         }
      }
   }).state('app.newdinner', {
      url: "/newdinner",
      views: {
         'mainContent': {
            templateUrl: "templates/newdinner.html",
            controller: "NewDinnerCtrl"
         }
      }
   }).state('app.lookfor', {
      url: "/lookfor",
      views: {
         'mainContent': {
            templateUrl: "templates/lookfor.html"
         }
      }
   }). // controller: 'LookForDinnersCtrl' // FIXME
   state('app.user', {
      url: "/user/:userId",
      views: {
         'mainContent': {
            templateUrl: "templates/profile.html"
         }
      }
   }). // controller: 'UserCtrl'
   state('app.dinner', {
      url: "/dinner/:dinnerId",
      views: {
         'mainContent': {
            templateUrl: "templates/dinner.html"
         }
      }
   });

   // if none of the above states are matched, use this as the fallback
   // controller: 'DinnerCtrl'
   $urlRouterProvider.otherwise('/login');
});
'use strict';

var c = angular.module('dc.controllers', ['dc.services']);

// c.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
c.controller('AppCtrl', function () {
	console.log('Controller: app');
});

/**
 * Sign up
 */
c.controller('SignupCtrl', function ($scope, db, $rootScope, $state, login) {
	console.log('Controller: signup');
	$scope.user = {};

	$scope.signup = function () {
		console.log('signing up', $scope.user);
		var user;
		db.auth.createUser($scope.user).then(function (userId) {
			user = {
				userId: userId,
				firstName: $scope.user.firstName,
				lastName: $scope.user.lastName,
				email: $scope.user.email
			};
			return db.user.create(user);
		}).then(function () {
			console.log('signup successful');
			login($scope.user);
		})['catch'](function (error) {
			console.error('error signing up', error);
		});
	};
});

/**
 * Log in
 */
c.controller('LoginCtrl', function ($scope, login, bindPending) {
	console.log('Controller: login');

	$scope.user = {};
	$scope.user = {
		'email': 'jd@example.com',
		'password': 'asdf'
	};

	$scope.login = function () {
		bindPending(login($scope.user), $scope)['catch'](function (error) {
			$scope.error = error.code;
			throw error;
		});
	};
});

/**
 * Settings
 */
c.controller('SettingsCtrl', function ($scope, db, $rootScope, $state, resumeSession) {
	console.log('Controller: settings');
	resumeSession($scope);

	$scope.update = function () {
		console.log('updating user');
		db.user.update($scope.user).then(function () {
			console.log('update successful');
		}, function (error) {
			console.error('update failed', error);
		});
	};

	$scope.mapCreated = function (map) {
		$scope.map = map;
	};
});

/* User Profile */
c.controller('UserCtrl', function ($scope, db, resumeSession, $stateParams) {
	resumeSession($scope);
	db.getUserData($stateParams.userId).then(function (user) {
		$scope.user = user;
	});

	db.getUserDinners($stateParams.userId).then(function (dinners) {
		$scope.dinners = dinners;
	});
});

/* New Dinner */
c.controller('NewDinnerCtrl', function ($scope, db, $rootScope, $state, resumeSession, util) {
	console.log('Controller: newdinner');
	resumeSession($scope);

	$scope.dinner = {
		isPublic: true
	};

	if ($scope.user) $scope.dinner.hostedByUser = $scope.user.userId;

	$scope.create = function () {
		db.dinner.create($scope.dinner).then(function (data) {
			console.log('Dinner created', $scope.dinner);
			$state.go('app.lookfor');
		}, function (error) {
			console.error('Error creating dinner', error);
		});
	};

	$scope.fromNow = function () {
		$scope.dinner.takeawayFrom = util.now();
		$scope.dinner.takeawayUntil = util.now(60);
	};
});

/* Look for  Dinner */
c.controller('LookForDinnersCtrl', function ($scope, db, resumeSession) {
	console.log('Controller: lookfor');
	resumeSession($scope);
	$scope.dinners = db.getDinnersSync();
	//console.log('dinners', $scope.dinners);

	// TODO: remove this. use filter instea
	$scope.getBeginTime = function (dinner) {
		var time;
		if (dinner.dinein && dinner.dinein.enabled) time = dinner.dinein.time;else if (dinner.takeaway && dinner.takeaway.enabled) time = dinner.takeaway.from;
		return time;
	};
});

/* Dinner */
c.controller('DinnerCtrl', function ($scope, db, resumeSession, $stateParams, $state) {
	resumeSession($scope);

	$scope.application = { count: 1 };
	$scope.dinner = db.getDinnerSync($stateParams.dinnerId);
	$scope.applications = db.getDinnerApplicationsSync($stateParams.dinnerId);

	$scope.addCount = function (count, min, max) {
		var newCount = $scope.application.count += count;
		if (newCount < min) newCount = min;else if (newCount > max) newCount = max;
		$scope.application.count = newCount;
	};

	$scope.apply = function (dinein) {
		if (dinein) $scope.application.dinein = true;else $scope.application.dinein = false;
		$scope.application.userId = $scope.user.uid;
		$scope.application.dinnerId = $scope.dinner.$id;
		db.newApplication($scope.application).then(function (application) {
			console.log('application created:', application);
			// $state.go('app.dinner', {dinnerId: application.dinnerId});
		}, function (error) {
			console.log('error creating application:', error);
		});
	};

	$scope.applicationState = function () {
		var state = "";
		angular.forEach($scope.applications, function (application) {
			if (application.userId === $scope.user.uid) {
				//console.log(application);
				state = application.state;
				$scope.application = application;
			}
		});
		return state;
	};

	$scope.isHost = function () {
		return $scope.user && $scope.dinner.user === $scope.user.uid;
	};

	$scope.acceptApplication = function (a) {
		a.state = 'accepted';
		db.updateApplicationState(a.$id, 'accepted').then(function () {
			console.log('application accepted');
		}, function (error) {
			console.error('error accepting application', error);
		});
	};
	$scope.declineApplication = function (a) {
		a.state = 'declined';
		db.updateApplicationState(a.$id, 'declined').then(function () {
			console.log('application declined');
		}, function (error) {
			console.error('error declining application', error);
		});
	};
});
'use strict';

angular.module('dc.db', ['firebase']).value('fb', new Firebase("https://dinner-collective.firebaseio.com/")) // define firebase ref as value service so it can be overridden easily

.factory('db', ['$rootScope', '$q', '$firebase', 'fb', function ($rootScope, $q, $firebase, fb) {

	var ref = { root: fb }; // store firebase references. place the main ref in there as 'root' as well, even though is shorter just to use 'fb'

	var db = {}; // the db interface to be exported (as 'db')
	db.ref = ref; // make refs available for testing
	db.settings = {};
	db.settings.checkArguments = false; // set true to check arguments using the checkObject function

	db.util = {};
	/**
  * Get current firebase URL. Used for testing.
  * @return {String} - URL of the firebase reference currently in use.
  */
	db.util.getRefURL = function () {
		return fb.toString();
	};

	// check that an object is defined and optionally has some defined properties
	// properties can be given as array of strings or as separate string arguments
	function checkObject(obj, properties) {
		if (!db.settings.checkArguments) return true;
		// check obj itself
		if (typeof obj != 'object' || obj == undefined) {
			throw new Error(obj + ' is expected to be an object.');
		}
		// if properties is not given or is not an array, create the properties array from arguments
		if (properties == undefined || !Array.isArray(properties)) {
			// == undefined tests for null and undefined
			properties = Array.prototype.slice.call(arguments, 1);
		}
		// check properties
		properties.forEach(function checkProperties(p) {
			if (obj[p] === undefined) {
				throw new Error(obj.p + ' is expected to be defined.');
			}
		});
		return true;
	};
	db.util.checkObject = checkObject; // make it available for testing

	// TODO: complete
	// function checkObjectAlt(obj, propLists) {
	// 	if ( ! db.settings.checkArguments ) return true;
	// 	// check obj itself
	// 	if ( typeof obj != 'object' || obj == undefined ) {
	// 		throw new Error(obj + ' is expected to be an object.');
	// 	}
	//
	// }

	function createError(name, message) {
		var error = new Error(message);
		error.name = name;
		return error;
	};
	db.util.createError = createError;

	db.error = {
		unauthorized: 'UNAUTHORIZED',
		notFound: 'NOT_FOUND'
	};

	/*
  * queries can be grouped due to different criteria:
  * technical type (create, update, delete)
  * by context (the view where they might be used)
  * by the data they operate on (type created or returned)
  *
  * general API considerations
  */

	/**
  * TODO: return defined errors
  * TODO: move errors and util functions to a seperat file
  * TODO: firebase query helpers: push obj + return id, update object, get by id, get by child
  *
  */

	/**
  * @callback successCallback
  * @param result - The result.
  */

	/**
  * @callback errorCallback
  * @param reason - The rejection reason.
  */

	/**
  * @callback callback
  */

	/**
  * Calls one of the success or error callbacks asynchronously as soon as the result is available.
  * @typedef {function} thenFunction
  * @param {successCallback}
  * @param {errorCallback}
  * @returns {Promise} - This promise is fulfilled with the return value of either callback. It is rejected with the error if either callback throws an exception.
  */

	/**
  * Sugar for Promise.then(undefined, errorCallback)
  * @typedef {function} catchFunction
  * @param {errorCallback}
  * @returns {Promise} - This promise is fulfilled with the return value of the error callback.
  */

	/**
  * Calls the callback as soon as the promise is either fulfilled or rejected. Useful for cleanup.
  * @typedef {function} finallyFunction
  * @param {callback}
  */

	/**
  * Angular Promise. Usually from the $q service.
  * @typedef {Object} Promise
  * @property {thenFunction} then
  * @property {catchFunction} catch
  * @property {finallyFunction} finally
  */

	/*
  * generic firebase query functions
  * using angular promises
  */
	db.query = {};

	db.query.set = function set(ref, data) {
		return $q(function resolver(resolve, reject) {
			ref.set(data, function onComplete(error) {
				if (error === null) {
					resolve();
				} else {
					reject(error);
				}
			});
		});
	};

	db.query.push = function push(ref, data) {
		return $q(function resolver(resolve, reject) {
			var newRef = ref.push(data, function onComplete(error) {
				if (error === null) {
					resolve(newRef.key());
				} else {
					reject(error);
				}
			});
		});
	};

	db.query.update = function update(ref, data) {
		return $q(function resolver(resolve, reject) {
			ref.update(data, function onComplete(error) {
				if (error === null) {
					resolve();
				} else {
					reject(error);
				}
			});
		});
	};

	db.query.get = function get(ref) {
		return $q(function resolver(resolve, reject) {
			ref.once('value', function callback(dataSnapshot) {
				var data = dataSnapshot.val();
				if (data === null) {
					reject(createError(db.error.notFound, 'db.query.get: no data.'));
				} else {
					resolve(data);
				}
			}, function cancelCallback(error) {
				reject(createError(db.error.unauthorized, error.message));
			});
		});
	};

	/*
  * AUTHENTICATION
  *
  * login user
  * logout user
  * current session
  *
  */

	/**
  * @typedef {Object} UserCredentials
  * @property {string} email
  * @property {string} password
  */

	db.auth = {};
	/**
  * Create a new user
  * @param {Object} user
  * email, password
  * @return {Promise} - user id on success. Error message on error.
  */
	db.auth.createUser = function (credentials) {
		return $q(function resolver(resolve, reject) {
			fb.createUser(credentials, function onComplete(error, user) {
				if (error === null) {
					resolve(user.uid);
				} else {
					reject(error);
				}
			});
		});
	};

	/**
  * Login a user with email and password.
  * @param {UserCredentials} credentials
  * email, password
  * @return {Promise} - user id on success. error object on error.
  */
	db.auth.login = function (credentials) {
		return $q(function resolver(resolve, reject) {
			fb.authWithPassword(credentials, function onComplete(error, session) {
				if (error === null) {
					resolve(session.uid, session);
				} else {
					reject(error);
				}
			});
		});
	};

	db.auth.logout = function () {
		return $q(function resolver(resolve, reject) {
			fb.onAuth(function onAuth(session) {
				if (session === null) {
					fb.offAuth(onAuth);
					resolve();
				}
			});
			fb.unauth();
		});
	};

	/**
  * [getCurrentSession description]
  * @return {Promise} - user id on success.
  */
	db.auth.getCurrentSession = function () {
		return $q(function resolver(resolve, reject) {
			var session = fb.getAuth(); // sync
			// console.log('current session:', session);
			if (session === null) {
				// console.log('rejecting');
				reject();
			} else {
				// console.log('resolving');
				resolve(session.uid);
			}
		});
	};

	/*
  * USER
  *
  * new user (C)
  * change settings (U)
  * add photo (C)
  * remove photo (D)
  * reorder photo (U)
  *
  *
  *
  * friends of this user
  * user data incl. settings
  * gallery pictures
  *
  *
  * dinners hosted by this user
  * dinners the user applied to/was accepted to/was rejected from (mutually excl.)
  * dinners invited to
  *
  * groups with member status
  * groups with admin status
  * notifications received
  * reviews of dinners hosted by this user
  *
  */

	ref.user = fb.child('user');
	ref.notification = fb.child('notification');
	db.user = {};

	/*
 	create a user record
 	user needs to have userId (obtained from auth.createUser and auth.login)
 	other fields are optional, the ones that are present are updated
  */
	db.user.create = function (user) {
		user = _.cloneDeep(user); // don't modify the passed data
		return $q(function (resolve, reject) {
			checkObject(user, 'userId', 'firstName', 'lastName', 'email');
			user.createdAt = Firebase.ServerValue.TIMESTAMP;
			ref.user.child(user.userId).set(user, function onComplete(error) {
				if (error === null) resolve();else reject(error);
			});
		});
	};

	/*
 	update user data
 	user needs to have userId
 	other fields are optional, the ones that are present are updated
  */
	db.user.update = function (user) {
		user = _.cloneDeep(user); // don't modify the passed data

		return $q(function (resolve, reject) {
			checkObject(user, 'userId');
			user.updatedAt = Firebase.ServerValue.TIMESTAMP;
			ref.user.child(user.userId).update(user, function onComplete(error) {
				if (error === null) resolve();else reject(error);
			});
		});
	};

	db.user.updateSettings = function (userId, settings) {
		return db.query.update(ref.user.child(userId).child('settings'), settings);
	};

	db.user.createImage = function () {};

	db.user.deleteImage = function () {};

	db.user.reorderImage = function () {};

	db.user.getFriends = function (userId) {
		return db.query.get(ref.user.child(userId).child('friends'));
	};

	// user data incl. settings and pics
	db.user.get = function (userId) {
		return db.query.get(ref.user.child(userId));
	};

	db.user.getNotifications = function (userId) {
		return db.query.get(ref.notification.orderByChild('forUser').equalTo(userId));
	};

	/*
  * FRIEND REQUESTS
  *
  * send friend request (U)
  * accept friend request (U)
  * friend requests received
  *
  */
	db.friendRequest = {};
	ref.friendRequest = fb.child('friendRequest');

	// TODO: test
	// TODO: check that users exist
	db.friendRequest.send = function (byUser, toUser) {
		// TODO: check values
		var friendRequest = {
			createdAt: Firebase.ServerValue.TIMESTAMP,
			byUser: byUser,
			toUser: toUser,
			status: 'pending'
		};
		return db.query.push(ref.friendRequest, friendRequest);
	};

	// TODO: test
	// TODO: only if toUser is sending the request
	db.friendRequest.accept = function (friendRequestId) {
		var friendRequest = {
			updatedAt: Firebase.ServerValue.TIMESTAMP,
			status: 'accepted'
		};
		return db.query.update(ref.friendRequest.child(friendRequestId), friendRequest);
	};

	// TODO: test
	// TODO: only if toUser is sending the request
	db.friendRequest.reject = function (friendRequestId) {
		var friendRequest = {
			updatedAt: Firebase.ServerValue.TIMESTAMP,
			status: 'rejected'
		};
		return db.query.update(ref.friendRequest.child(friendRequestId), friendRequest);
	};

	// TODO: test
	// TODO: only if userId is sending the request
	db.friendRequest.getIncoming = function (userId) {
		return db.query.get(ref.friendRequest.orderByChild('toUser').equalTo(userId));
	};

	// TODO: test
	// TODO: only if userId is sending the request
	db.friendRequest.getOutgoing = function (userId) {
		return db.query.get(ref.friendRequest.orderByChild('fromUser').equalTo(userId));
	};

	/*
  * DINNER (All)
  *
  *
  * basic info (title, description, address, time, ...)
  * users that applied/were accepted/were rejected (mutally excl.)
  * messages posted regarding this dinner
  * reviews of this dinner
  *
  */

	db.dinner = {};
	ref.dinner = fb.child('dinner');
	ref.application = fb.child('application');
	ref.message = fb.child('message');
	ref.review = fb.child('review');

	db.dinner.get = function (dinnerId) {
		return db.query.get(ref.dinner.orderByKey().equalTo(dinnerId));
	};

	db.dinner.getMessages = function (dinnerId) {
		return db.query.get(ref.message.orderByChild('toDinner').equalTo(dinnerId));
	};

	db.dinner.getReviews = function (dinnerId) {
		return db.query.get(ref.review.orderByChild('aboutDinner').equalTo(dinnerId));
	};

	db.dinner.createMessage = function (message) {
		return $q(function resolver(resolve, reject) {
			message = _.cloneDeep(message);
			checkObject(message, createdAt, byUser, text);
			message.createdAt = Firebase.ServerValue.TIMESTAMP;
			// TODO: either toDinner or toGroup needs to be set.
			resolve(db.query.create(ref.message.push(message)));
		});
	};

	/*
  * DINNER (Host)
  *
  * new dinner (C dinner)
  * close dinner (U dinner)
  * cancel dinner (U dinner)
  * x invite user (C invitation)
  * x invite group (C invitation)
  * accept/reject application (U applicaton)
  *
  * x users that are invited
  *
  */

	// create a new dinner
	// fulfills with the new dinnerId, rejects with the error
	// TODO: test
	db.dinner.create = function (dinner) {
		return $q(function resolver(resolve, reject) {
			dinner = _.cloneDeep(dinner); // don't modify the passed data
			checkObject(dinner, 'hostedByUser', 'title', 'description', 'tags', 'isPublic'); // can throw and thus reject this promise
			// TODO: check for dineinAt or (takeawayFrom and takeawayUntil)
			dinner.createdAt = Firebase.ServerValue.TIMESTAMP;
			resolve(db.query.push(ref.dinner, dinner));
		});
	};

	// TODO: test
	// TODO: can't close if cancelled, only possible if host of dinner
	db.dinner.close = function (dinnerId) {
		var dinner = {
			// dinnerId : dinnerId,
			updatedAt: Firebase.ServerValue.TIMESTAMP,
			closedAt: Firebase.ServerValue.TIMESTAMP
		};
		return db.query.update(ref.dinner.child(dinnerId), dinner);
	};

	// TODO: test
	// TODO: only possible if host of dinner
	db.dinner.cancel = function (dinnerId) {
		var dinner = {
			// dinnerId : dinnerId,
			updatedAt: Firebase.ServerValue.TIMESTAMP,
			cancelledAt: Firebase.ServerValue.TIMESTAMP
		};
		return db.query.update(ref.dinner.child(dinnerId), dinner);
	};

	// TODO: test
	// TODO: only possible if host of dinner
	db.dinner.acceptApplication = function (applicationId) {
		var application = {
			updatedAt: Firebase.ServerValue.TIMESTAMP,
			status: 'accepted'
		};
		return db.query.update(ref.application.child(applicationId), application);
	};

	// TODO: test
	// TODO: only possible if host of dinner
	db.dinner.rejectApplication = function (applicationId) {
		var application = {
			updatedAt: Firebase.ServerValue.TIMESTAMP,
			status: 'rejected'
		};
		return db.query.update(ref.application.child(applicationId), application);
	};

	/*
  * DINNER (Guest)
  *
  * apply (C application)
  * x accept invitation (U invitation)
  *
  */

	// TODO: test
	db.dinner.createApplication = function (application) {
		return $q(function (resolve, reject) {
			application = _.cloneDeep(application); // don't modify the passed data
			checkObject(application, 'byUser', 'forDinner', 'numSpots', 'isDineIn', 'isPublic');
			// TODO: what about host property?
			// TODO: cant apply to own dinner, can't apply to closed or cancelled or past dinner.
			application.createdAt = Firebase.ServerValue.TIMESTAMP;
			application.status = 'pending';
			resolve(db.query.push(ref.application, application));
		});
	};

	db.dinner.createReview = function (review) {
		return $q(function resolver(resolve, reject) {
			review = _.cloneDeep(review);
			checkObject(review, byUser, text, aboutDinner, aboutUser);
			review.createdAt = Firebase.ServerValue.TIMESTAMP;
			// TODO: either toDinner or toGroup needs to be set.
			resolve(db.query.push(ref.review, review));
		});
	};

	db.dinner.createMessage = function (message) {
		return $q(function resolver(resolve, reject) {
			message = _.cloneDeep(message);
			checkObject(message, byUser, text, toDinner);
			message.createdAt = Firebase.ServerValue.TIMESTAMP;
			delete message.toGroup;
			resolve(db.query.push(ref.message, message));
		});
	};

	/*
  * MESSAGE
  *
  * post message to dinner (C message)
  * post message to group (C message)
  *
  */
	// db.createDinnerMessage = function (message) {
	//
	// };
	//
	// db.createGroupMessage = function (message) {
	//
	// };

	/*
  * NOTIFICATION
  *
  * post notification (C notification)
  * mark as read (U notification)
  *
  */

	db.notification = {};

	db.notification.create = function (notification) {
		return function resolver(resolve, reject) {
			notification = _.cloneDeep(notification);
			checkObject(notification, forUser, type, text, aboutUser);
			notification = Firebase.ServerValue.TIMESTAMP;
			// TODO: either toDinner or toGroup needs to be set.
			resolve(db.query.create(ref.notification.push(message)));
		};
	};

	db.notification.markAsRead = function (notificationId) {
		return function resolver(resolve, reject) {
			var notification = {
				openedAt: Firebase.ServerValue.TIMESTAMP
			};
			resolve(db.query.update(notificationId, notification));
		};
	};

	/*
  * REVIEW
  *
  * post review (C review)
  *
  */

	db.createReview = function (review) {
		return function resolver(resolve, reject) {
			checkObject(review, byUser, text);
			// TODO: either aboutDinner or aboutUser needs to be set.
			resolve(db.query.push(ref.review, review));
		};
	};

	/*
  * GROUP
  *
  * create new group (C group)
  * invite user to group (U user)
  * accept/reject group invitation (U group)
  * join group (U group)
  * leave group (U group)
  * add admin (U group)
  *
  * basic info (title, description, invite only status, ...)
  * admins
  * members
  * messages regarding this group
  *
  */
	// db.group = {};
	//
	// db.group.create = function (group) {
	//
	// };
	//
	// db.group.inviteUser = function (group) {
	//
	// };
	//
	// db.group.join = function (groupId) {
	//
	// };
	//
	// db.group.leave = function (groupId) {
	//
	// };
	//
	// db.group.get = function (group) {
	//
	// };
	//
	// db.group.getMembers = function (group) {
	//
	// };
	//
	// db.group.getAdmins = function (group) {
	//
	// };
	//
	// db.group.getMessages = function (group) {
	//
	// };

	return db;
}]);
'use strict';

angular.module('dc.db', ['firebase']).factory('db', ['$rootScope', '$q', '$firebase', function ($rootScope, $q, $firebase) {
	var fb = new Firebase("https://dinner-collective.firebaseio.com/");
	var db = {};

	/**
  * Sign up a user
  * @param  {Object} credentials  - { firstname, lastname, email, password, passwordCheck }
  * @return {Q} - userDdata on success, error on failure
  */
	db.signup = function (credentials) {
		var d = $q.defer();
		fb.createUser(credentials, function (error) {
			if (error === null) {
				fb.authWithPassword(credentials, function (error, auth) {
					if (error === null) {
						var user = fb.child('user').child(auth.uid),
						    userData = {
							uid: auth.uid,
							firstname: credentials.firstname,
							lastname: credentials.lastname,
							email: credentials.email
						};
						user.set(userData, function (error) {
							if (error === null) d.resolve(userData);else d.reject(error);
						});
					} else d.reject(error);
				});
			} else d.reject(error);
		});
		return d.promise;
	};

	/**
  * Log in a user
  * @param  {Object} credentials - { firstname, lastname, email, password, passwordCheck }
  * @return {Q} - userData on success, error on failure
  */
	db.login = function (credentials) {
		var d = $q.defer();
		fb.authWithPassword(credentials, function (error, auth) {
			if (error === null) d.resolve(auth.uid);else d.reject(error);
		});
		return d.promise.then(db.getUserData);
	};

	/**
  * Log out the user
  */
	db.logout = function () {
		fb.onAuth(function onAuth(auth) {
			if (auth === null) {
				console.log('user un-authenticated');
				fb.offAuth(onAuth);
			}
		});
		fb.unauth();
		delete $rootScope.user;
	};

	/**
  * Synchronously get current authentication session
  * @return {String} - uid on success, null if not authenticated
  */
	db.currentSession = function () {
		var auth = fb.getAuth();
		// console.log('auth:', auth);
		if (auth != null) return auth.uid;else return null;
	};

	/**
  * Get user data
  * @param  {string} uid - unique user id
  * @return {Q} - userData on success, error on failure
  */
	db.getUserData = function (uid) {
		var d = $q.defer();
		var user = fb.child('user').child(uid);
		user.once('value', function (data) {
			d.resolve(data.val());
		}, function (error) {
			d.reject(error);
		});
		return d.promise;
	};

	db.getUserSync = function (userId) {
		var user = fb.child('user').child(userId);
		return $firebase(user).$asObject();
	};

	db.updateUserData = function (userData) {
		var user = fb.child('user').child(userData.uid);
		var d = $q.defer();
		user.update(userData, function onComplete(error) {
			if (error === null) d.resolve();else d.reject(error);
		});
		return d.promise;
	};

	db.newDinner = function (dinner) {
		var dinners = fb.child('dinner');
		var d = $q.defer();
		dinners.push(dinner, function onComplete(error) {
			if (error === null) d.resolve();else d.reject(error);
		});
		return d.promise;
	};

	// db.getDinners = function(cb) {
	// 	var dinners = fb.child('dinner');
	// 	var d = $q.defer();
	// 	dinners.on('value', function(data) {
	// 		if (cb) cb( data.val() );
	// 		if (d) {
	// 			d.resolve( data.val() );
	// 			delete d;
	// 		}
	// 	});
	// 	return d.promise;
	// };

	db.getDinnersSync = function () {
		var dinners = fb.child('dinner');
		var sync = $firebase(dinners).$asArray();
		return sync;
	};

	db.getDinnerSync = function (dinnerId) {
		var dinner = fb.child('dinner').child(dinnerId);
		var sync = $firebase(dinner).$asObject();
		// TODO: proper security. only get user name
		sync.$loaded(function () {
			sync.userData = $firebase(fb.child('user').child(sync.user)).$asObject();
		});
		return sync;
	};

	// db.getUserName = function(userId) {
	// 	var firstname = fb.child('dinner').child(dinnerId)
	// };
	//

	db.getUserDinners = function (userId) {
		var dinners = fb.child('dinner').orderByChild('user').startAt(userId).endAt(userId);
		var d = $q.defer();
		dinners.once('value', function (data) {
			d.resolve(data.val());
		}, function (error) {
			d.reject(error);
		});
		return d.promise;
	};

	db.newApplication = function (application) {
		var applications = fb.child('application');
		var d = $q.defer();
		application.state = 'applied';
		applications.push(application, function onComplete(error) {
			if (error === null) d.resolve(application);else d.reject(error);
		});
		return d.promise;
	};

	db.getUserApplicationsSync = function (userId) {
		var applications = fb.child('application').orderByChild('userId').startAt(userId).endAt(userId);
		var sync = $firebase(applications).$asObject();
		return sync;
	};

	db.getDinnerApplicationsSync = function (dinnerId) {
		var applications = fb.child('application').orderByChild('dinnerId').startAt(dinnerId).endAt(dinnerId);
		var sync = $firebase(applications).$asArray();
		// load user data
		sync.$loaded(function () {
			angular.forEach(sync, function (application) {
				application.user = db.getUserSync(application.userId);
			});
		});
		return sync;
	};

	db.updateApplicationState = function (aId, state) {
		var a = fb.child('application').child(aId);
		var sync = $firebase(a).$asObject();
		return sync.$loaded(function () {
			sync.state = state;
			sync.$save();
		});
	};

	return db;
}]);
'use strict';

angular.module('dc.directives', []).directive('map', function () {
   return {
      restrict: 'E',
      scope: {
         onCreate: '&'
      },
      link: function link($scope, $element, $attr) {
         function initialize() {
            var mapOptions = {
               center: new google.maps.LatLng(48.2085, 16.373),
               zoom: 16,
               mapTypeId: google.maps.MapTypeId.ROADMAP,
               streetViewControl: false
            };
            var map = new google.maps.Map($element[0], mapOptions);

            $scope.onCreate({
               map: map
            });

            // Stop the side bar from dragging when mousedown/tapdown on the map
            google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
               e.preventDefault();
               return false;
            });
         }

         if (document.readyState === "complete") {
            initialize();
         } else {
            google.maps.event.addDomListener(window, 'load', initialize);
         }
      }
   };
})

// whenever the given expression is truthy show animated pending dots appended to the element
.directive('pendingDots', function () {
   return {
      restrict: 'EA',
      link: function link(scope, element, attr) {
         var dot = '.',
             className = 'pending-dots',
             showClassName = 'show-pending-dots',
             html = '<span class="' + className + '"><span class="dot-1">' + dot + '</span><span class="dot-2">' + dot + '</span><span class="dot-3">' + dot + '</span></span>';
         element.append(html);
         scope.$watch(attr.pendingDots, function (newVal) {
            if (newVal) element.addClass(showClassName);else element.removeClass(showClassName);
         });
      }
   };
});
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
'use strict';

var s = angular.module('dc.services', []);

/**
 * A simple example service that returns some data.
 */
s.factory('Friends', function () {
	// Might use a resource here that returns a JSON array

	// Some fake testing data
	var friends = [{ id: 0, name: 'Scruff McGruff' }, { id: 1, name: 'G.I. Joe' }, { id: 2, name: 'Miss Frizzle' }, { id: 3, name: 'Ash Ketchum' }];

	return {
		all: function all() {
			return friends;
		},
		get: function get(friendId) {
			// Simple index lookup
			return friends[friendId];
		}
	};
});

s.factory('resumeSession', function ($rootScope, db, $q, $state) {
	return function ($scope) {
		return db.auth.getCurrentSession().then(function onFulfilled(userId) {
			if ($rootScope.user && $rootScope.user.uid === userId) {
				// no need to refetch user data
				$scope.user = $rootScope.user;
				return $scope.user;
			} else {
				console.log('resuming session for user', userId);
				// fetch user data
				db.user.get(userId).then(function (user) {
					console.log('resume successful', user);
					$rootScope.user = user;
					$scope.user = user;
					return user;
				});
			}
		})['catch'](function onRejected(error) {
			$state.go('app.login');
		});
	};
});

s.factory('util', function () {
	return {
		now: function now(offsetMins) {
			offsetMins = offsetMins || 0;
			var n = new Date();
			var d = new Date(n.getTime() - n.getTimezoneOffset() * 60000 + offsetMins * 60000);
			//return (d.toISOString()).substring(0,16); // text representation
			return d;
		}
	};
});

s.factory('login', function ($rootScope, db, $state) {
	return function (user) {
		console.log("logging in", user);

		return db.auth.login(user).then(function (userId) {
			console.log("getting user", userId);
			db.user.get(userId).then(function (user) {
				console.log("login successful", user);
				$rootScope.user = user;
				$state.go('app.settings');
			});
		}, function (error) {
			console.error('error logging in', error);
			throw error;
		});
	};
});

s.factory('logout', function ($rootScope, db, $state) {
	return function () {
		console.log("logging out");
		$rootScope.user = {}; // immediately remove user from scope
		db.auth.logout().then(function () {
			console.log('logout sucessful');
		}, function (error) {
			console.error('error logging out', error);
		});
		$state.go('login'); // immediately go to login page
	};
});

// ping pending state of a promise to a variable $scope.name
s.factory('bindPending', function () {
	return function (promise, $scope, name) {
		if (!name) name = 'pending';
		// console.log(name);

		function done() {
			console.log('resetting isBusy');
			$scope[name] = false;
		}
		console.log('setting isBusy');
		$scope[name] = true;

		return promise.then(function onResolve(value) {
			done();
			return value;
		}, function onReject(error) {
			done();
			throw error;
		});
	};
});