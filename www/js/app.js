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
      if (window.cordova && window.cordova.plugins.Keyboard) {
         cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
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

   .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
   })

   .state('logout', {
      url: '/logout',
      controller: 'LogoutCtrl'
   })

   .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller: 'SignupCtrl'
   })


   .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
   })

   .state('app.settings', {
      url: '/settings',
      views: {
         'mainContent': {
            templateUrl: 'templates/settings.html',
            controller: 'SettingsCtrl'
         }
      }
   })

   .state('app.newdinner', {
      url: "/newdinner",
      views: {
         'mainContent': {
            templateUrl: "templates/newdinner.html",
            controller: "NewDinnerCtrl"
         }
      }
   })



   .state('app.lookfor', {
      url: "/lookfor",
      views: {
         'mainContent': {
            templateUrl: "templates/lookfor.html",
            controller: 'LookForDinnersCtrl'
         }
      }
   })



   .state('app.user', {
      url: "/user/:userId",
      views: {
         'mainContent': {
            templateUrl: "templates/profile.html",
            controller: 'UserCtrl'
         }
      }
   })



   .state('app.dinner', {
      url: "/dinner/:dinnerId",
      views: {
         'mainContent': {
            templateUrl: "templates/dinner.html",
            controller: 'DinnerCtrl'
         }
      }
   })



	.state('app.lookfor_filter', {
      url: "/lookfor_filter",
      views: {
         'mainContent': {
            templateUrl: "templates/lookfor_filter.html",
         }
      }
   })

	.state('app.developer', {
      url: "/developer",
      views: {
         'mainContent': {
            templateUrl: "templates/developer.html"
         }
      }
   })

	.state('app.notifications', {
      url: "/notifications",
      views: {
         'mainContent': {
            templateUrl: "templates/notifications.html"
         }
      }
   })

	.state('app.dinner_list', {
      url: "/dinner_list",
      views: {
         'mainContent': {
            templateUrl: "templates/dinner_list.html"
         }
      }
   })

	.state('app.person_list', {
      url: "/person_list",
      views: {
         'mainContent': {
            templateUrl: "templates/person_list.html"
         }
      }
   })

	.state('app.person_list_interactive', {
      url: "/person_list_interactive",
      views: {
         'mainContent': {
            templateUrl: "templates/person_list_interactive.html"
         }
      }
   })

	.state('app.confirm_application', {
      url: "/confirm_application",
      views: {
         'mainContent': {
            templateUrl: "templates/confirm_application.html"
         }
      }
   })

   // if none of the above states are matched, use this as the fallback
   $urlRouterProvider.otherwise('/login');
});
