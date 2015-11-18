// http://www.bradoncode.com/blog/2015/06/16/unit-test-http-ngmock-passthrough/
var httpHelpers = {};

httpHelpers.init = function() {
  angular.module('ngMock', ['ng', 'ngMockE2E']).provider({
    $exceptionHandler: angular.mock.$ExceptionHandlerProvider,
    $log: angular.mock.$LogProvider,
    $interval: angular.mock.$IntervalProvider,
    $rootElement: angular.mock.$RootElementProvider
  }).config(['$provide', function($provide) {
    $provide.decorator('$timeout', angular.mock.$TimeoutDecorator);
    $provide.decorator('$$rAF', angular.mock.$RAFDecorator);
    // From version 1.4.3 this line is removed. Uncomment for older versions.
    //$provide.decorator('$$asyncCallback', angular.mock.$AsyncCallbackDecorator);
    $provide.decorator('$rootScope', angular.mock.$RootScopeDecorator);
    $provide.decorator('$controller', angular.mock.$ControllerDecorator);
  }]);

};

httpHelpers.reset = function() {
  angular.module('ngMock', ['ng']).provider({
    $browser: angular.mock.$BrowserProvider,
    $exceptionHandler: angular.mock.$ExceptionHandlerProvider,
    $log: angular.mock.$LogProvider,
    $interval: angular.mock.$IntervalProvider,
    $httpBackend: angular.mock.$HttpBackendProvider,
    $rootElement: angular.mock.$RootElementProvider
  }).config(['$provide', function($provide) {
    $provide.decorator('$timeout', angular.mock.$TimeoutDecorator);
    $provide.decorator('$$rAF', angular.mock.$RAFDecorator);
    // From version 1.4.3 this line is removed. Uncomment for older versions.
    //$provide.decorator('$$asyncCallback', angular.mock.$AsyncCallbackDecorator);
    $provide.decorator('$rootScope', angular.mock.$RootScopeDecorator);
    $provide.decorator('$controller', angular.mock.$ControllerDecorator);
  }]);

};
