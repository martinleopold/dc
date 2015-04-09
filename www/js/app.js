// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires' 
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('dc', ['ionic', 'dc.controllers', 'dc.services', 'dc.filters', 'dc.db', 'dc.directives'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if(window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if(window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
	});
})

.config(function($stateProvider, $urlRouterProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js
	$stateProvider

		// setup an abstract state for the tabs directive
		.state('tab', {
			url: "/tab",
			abstract: true,
			templateUrl: "templates/tabs.html"
		})

		// Each tab has its own nav history stack:

		.state('tab.dash', {
			url: '/dash',
			views: {
				'tab-dash': {
					templateUrl: 'templates/tab-dash.html',
					controller: 'DashCtrl'
				}
			}
		})

		.state('tab.friends', {
			url: '/friends',
			views: {
				'tab-friends': {
					templateUrl: 'templates/tab-friends.html',
					controller: 'FriendsCtrl'
				}
			}
		})
		.state('tab.friend-detail', {
			url: '/friend/:friendId',
			views: {
				'tab-friends': {
					templateUrl: 'templates/friend-detail.html',
					controller: 'FriendDetailCtrl'
				}
			}
		})

		.state('tab.account', {
			url: '/account',
			views: {
				'tab-account': {
					templateUrl: 'templates/tab-account.html',
					controller: 'AccountCtrl'
				}
			}
		})
		.state('app', {
			url: "/app",
			abstract: true,
			templateUrl: "templates/menu.html",
			controller: 'AppCtrl'
		})

		.state('app.search', {
			url: "/search",
			views: {
				'menuContent' :{
					templateUrl: "templates/search.html"
				}
			}
		})

		.state('app.playlists', {
			url: "/playlists",
			views: {
				'menuContent' :{
					templateUrl: "templates/playlists.html",
					controller: 'PlaylistsCtrl'
				}
			}
		})
		
		.state('app.user', {
			url: "/user/:userId",
			views: {
				'menuContent' :{
					templateUrl: "templates/profile.html",
					controller: 'UserCtrl'
				}
			}
		})

		.state('app.login', {
			url: "/login",
			views: {
				'menuContent' :{
					templateUrl: "templates/login.html",
					controller: "LoginCtrl"
				}
			}
		})

		.state('app.logout', {
			url: "/logout",
			views: {
				'menuContent' :{
					controller: "LogoutCtrl"
				}
			}
		})

		.state('app.signup', {
			url: "/signup",
			views: {
				'menuContent' :{
					templateUrl: "templates/signup.html",
					controller: "SignupCtrl"
				}
			}
		})
		.state('app.newdinner', {
			url: "/newdinner",
			views: {
				'menuContent' :{
					templateUrl: "templates/newdinner.html",
					controller: "NewDinnerCtrl"
				}
			}
		})
		.state('app.dinner', {
			url: "/dinner/:dinnerId",
			views: {
				'menuContent' :{
					templateUrl: "templates/dinner.html",
					controller: 'DinnerCtrl'
				}
			}
		})
		.state('app.lookfor', {
			url: "/lookfor",
			views: {
				'menuContent' :{
					templateUrl: "templates/lookfor.html",
					controller: 'LookForDinnersCtrl'
				}
			}
		})
		.state('app.lookfor_filter', {
			url: "/lookfor_filter",
			views: {
				'menuContent' :{
					templateUrl: "templates/lookfor_filter.html",
				}
			}
		})
		.state('app.settings', {
			url: "/settings",
			views: {
				'menuContent' :{
					templateUrl: "templates/settings.html",
					controller: 'SettingsCtrl'
				}
			}
		})
		.state('app.developer', {
			url: "/developer",
			views: {
				'menuContent' :{
					templateUrl: "templates/developer.html"
				}
			}
		})
		.state('app.notifications', {
			url: "/notifications",
			views: {
				'menuContent' :{
					templateUrl: "templates/notifications.html"
				}
			}
		})
        .state('app.dinner_list', {
			url: "/dinner_list",
			views: {
				'menuContent' :{
					templateUrl: "templates/dinner_list.html"
				}
			}
		})
        .state('app.person_list', {
			url: "/person_list",
			views: {
				'menuContent' :{
					templateUrl: "templates/person_list.html"
				}
			}
		})
        .state('app.person_list_interactive', {
			url: "/person_list_interactive",
			views: {
				'menuContent' :{
					templateUrl: "templates/person_list_interactive.html"
				}
			}
		})
        .state('app.confirm_application', {
			url: "/confirm_application",
			views: {
				'menuContent' :{
					templateUrl: "templates/confirm_application.html"
				}
			}
		})
		.state('app.single', {
			url: "/playlists/:playlistId",
			views: {
				'menuContent' :{
					templateUrl: "templates/playlist.html",
					controller: 'PlaylistCtrl'
				}
			}
		});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/login');

	// if none of the above states are matched, use this as the fallback
	// $urlRouterProvider.otherwise('/tab/dash');
});

