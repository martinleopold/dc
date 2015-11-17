/* eslint-env jasmine */
/* global angular */

var moduleHelpers = {};

(function() {

   moduleHelpers.inject = function inject(moduleName, interfaceName) {
      interfaceName = '_' + interfaceName + '_';
      var interfaceObj = {};
      var injectFunction;

      // programmatically declare a function which parameter is named after the given interfaceName
      // this function assigns the parameter to the outside interfaceObj.
      // function(_myInterface_) {
      //    interfaceObj = _myInterface_;
      // }
      // see: https://docs.angularjs.org/api/ngMock/function/angular.mock.inject
      eval('injectFunction = function injectFunction(' + interfaceName + ') {interfaceObj=' + interfaceName + '}');

      angular.mock.module(moduleName); // load the module
      angular.mock.inject(injectFunction); // load the specified interface

      return interfaceObj; // return the intfercase
   };

}());
