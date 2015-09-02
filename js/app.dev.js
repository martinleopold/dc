
angular.module( 'dc.dev', [] )

.config(function($stateProvider, $urlRouterProvider) {
   $stateProvider

   .state('dev', {
      url: '/dev',
      abstract: true,
      templateUrl: 'templates/menu.html',
   })

   .state('dev.menu', {
      url: "/menu",
      views: {
         'mainContent': {
            templateUrl: "templates/developer.html"
         }
      }
   })

   .state('dev.login', {
      url: "/login",
      views: {
         'mainContent': {
            templateUrl: "templates/login.html"
         }
      }
   })

   .state('dev.signup', {
      url: "/signup",
      views: {
         'mainContent': {
            templateUrl: "templates/signup.html"
         }
      }
   })

   .state('dev.newdinner', {
      url: "/newdinner",
      views: {
         'mainContent': {
            templateUrl: "templates/newdinner.html"
         }
      }
   })

   .state('dev.lookfor', {
      url: "/lookfor",
      views: {
         'mainContent': {
            templateUrl: "templates/lookfor.html"
         }
      }
   })

   .state('dev.lookfor_filter', {
      url: "/lookfor_filter",
      views: {
         'mainContent': {
            templateUrl: "templates/lookfor_filter.html"
         }
      }
   })

   .state('dev.profile', {
      url: "/profile",
      views: {
         'mainContent': {
            templateUrl: "templates/profile.html"
         }
      }
   })

   .state('dev.dinner', {
      url: "/dinner",
      views: {
         'mainContent': {
            templateUrl: "templates/dinner.html"
         }
      }
   })

   .state('dev.settings', {
      url: "/settings",
      views: {
         'mainContent': {
            templateUrl: "templates/settings.html"
         }
      }
   })

   .state('dev.notifications', {
      url: "/notifications",
      views: {
         'mainContent': {
            templateUrl: "templates/notifications.html"
         }
      }
   })

   .state('dev.dinner_list', {
      url: "/dinner_list",
      views: {
         'mainContent': {
            templateUrl: "templates/dinner_list.html"
         }
      }
   })

   .state('dev.person_list', {
      url: "/person_list",
      views: {
         'mainContent': {
            templateUrl: "templates/person_list.html"
         }
      }
   })

   .state('dev.person_list_interactive', {
      url: "/person_list_interactive",
      views: {
         'mainContent': {
            templateUrl: "templates/person_list_interactive.html"
         }
      }
   })

   .state('dev.confirm_application', {
      url: "/confirm_application",
      views: {
         'mainContent': {
            templateUrl: "templates/confirm_application.html"
         }
      }
   })

});
