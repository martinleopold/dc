/* eslint-env jasmine */
/* global promiseHelpers, moduleHelpers */

describe("dc.maps module", function() {

   // make interface available to all tests
   var maps;
   beforeEach(function() {
      maps = moduleHelpers.inject('dc.maps', 'maps'); // load maps interface from dc.maps module
   });

   jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000; // timeout for async calls

   // wrap tests for angular promises to work (see promise helpers)
   promiseHelpers.ngApplyWrap();




   it('testResolve', function(done) {
      maps.testResolve().then(function() {
         done();
      });
   });

   it('testReject', function(done) {
      maps.testReject().catch(function() {
         done();
      });
   });

   it('addressToLocation success case', function (done) {
      maps.addressToLocation('1010 Wien, Blutgasse 1, AT').then(function(result) {
         expect(result.location).toEqual([48.2079414, 16.374646100000064]);
         expect(result.formatted_address).toEqual('Blutgasse 1, 1010 Wien, Austria');
         done();
      }).catch(function(error) {
         done.fail(error);
      });
   });

   it('addressToLocation error case', function (done) {
      maps.addressToLocation('67892487ghjdsj').then(function() {
         done.fail();
      }).catch(function(error) {
         expect(error).toEqual('ZERO_RESULTS');
         done();
      });
   });

});
