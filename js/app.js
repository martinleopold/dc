// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var dc = angular.module('dc', ['ionic', 'dc.controllers', 'dc.services', 'dc.filters', 'dc.db', 'dc.img', 'dc.directives', 'dc.dev']);


// ionic setup
dc.run(function($ionicPlatform) {
   $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
         cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      /* global StatusBar */
      if (window.StatusBar) {
         // org.apache.cordova.statusbar required
         StatusBar.styleDefault();
      }
   });
});


// app states (ui-router)
dc.config(function($stateProvider, $urlRouterProvider) {

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
      onEnter: function(logout) {
         logout();
      }
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

   .state('app.dinnerlist', {
      url: '/dinner_list',
      views: {
         'mainContent': {
            templateUrl: "templates/dinner_list.html",
            controller: 'DinnerListCtrl'
         }
       }
   });


   $stateProvider
   .state('test', {
      url: '/test',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
   })
   .state('test.tabs', {
      url: "/tabs",
      views: {
         'mainContent': {
            templateUrl: "templates/test/tabs.html"
         }
      }
   });


   // if none of the above states are matched, use this as the fallback
   $urlRouterProvider.otherwise('/login');
});



// timezone support
/* global moment */
dc.run(function () {
   moment.tz.setDefault('Europe/Vienna');

   // define a specialized locale (settings are inherited from 'en')
   moment.locale('en-dc', {
      longDateFormat : {
         LT : "HH:mm",
         LTS : "HH:mm:ss",
         L : "MMM D, YYYY" // Aug 12, 2015 14:00
      },
      calendar : {
         lastDay : '[Yesterday,] LT',
         sameDay : '[Today,] LT',
         nextDay : '[Tomorrow,] LT',
         lastWeek : '[last] dddd[,] LT',
         nextWeek : 'dddd[,] LT',
         sameElse : 'L'
      }
   });
});
