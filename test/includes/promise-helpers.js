/* eslint-env jasmine */
/* global inject */

var promiseHelpers = {};

(function() {
   var applyInterval;
   var startApply = function startApply(interval) {
      interval = interval || 500;
      inject(function($rootScope) {
         applyInterval = setInterval(function() {
            $rootScope.$apply();
            // $rootScope.$digest();
         }, interval);
      });
   };
   var stopApply = function() {
      clearInterval(applyInterval);
   };

   // wrap tests, so angular promises ($q) are properly resolved
   promiseHelpers.ngApplyWrap = function(interval) {
      beforeEach(function () {
         startApply(interval);
      });
      afterEach(stopApply);
   };

   // chain (promise-returning) functions
   // makes sure the functions are called in sequence
   // if a function doesn't return a promise, a promise that fulfills with its return value is used instead
   // thus promises can also be used instead of functions
   // returns a promise that resolves when all input functions resloved its promises
   promiseHelpers.chainFns = function() {
      var promise = Promise.resolve();
      var args = Array.prototype.slice.call(arguments);
      args.forEach(function(fn) {
         promise = promise.then(function() {
            var result;
            if (typeof fn == 'function') result = fn.apply(null, arguments); // call function with incoming arguments
            else result = fn;
            return Promise.resolve( result ); // assimilate, if not already a promise
         });
      });
      return promise;
   };

   // add partial application to function prototype
   // returns the function with the given parameters already bound to it
   // used to be able to pass a promise to .then (which expects a function that returns a promise)
   // also used with chainFns()
   Function.prototype.partial = function partial() {
      // this: the function partial was called on
      // call bind on the function: this.bind(null, arg1, arg2, arg3, ...)
      var args = Array.prototype.slice.call(arguments); // make a real array
      args.unshift(null); // adds null to beginning of args array
      return Function.prototype.bind.apply(this, args);
   };

}());
