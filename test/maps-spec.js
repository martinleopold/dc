/* eslint-env jasmine */
/* global module, inject */

fdescribe("dc.maps module", function() {
   // load module
   beforeEach( module('dc.maps') );

   // make interface available to all tests
   var maps;
   beforeEach( inject(function(_maps_) {
      maps = _maps_;
   }));

   it('should have a addressToLocation method', function () {
      expect(maps.addressToLocation()).toEqual([0,0]);
   });

});
