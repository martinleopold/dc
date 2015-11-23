/* eslint-env jasmine */
/* global promiseHelpers, moduleHelpers, httpHelpers */

describe("dc.img module", function() {
   httpHelpers.init(); // use ngMockE2E to allow for real $http requests

   // make interface available to all tests
   var img;
   beforeEach(function() {
      img = moduleHelpers.inject('dc.img', 'img'); // load maps interface from dc.maps module

      angular.mock.inject(function ($httpBackend) {
         $httpBackend.whenPOST(/.*/).passThrough();
      });
   });

   jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000; // timeout for async calls

   // wrap tests for angular promises to work (see promise helpers)
   promiseHelpers.ngApplyWrap();


   // module('dc.img').run(function () {
   //    console.log('RUNNING MODULE');
   // });
   // angular.mock.inject(function ($httpBackend) {
   //    console.log($httpBackend);
   // });


   function img2Data(url) {
      return new Promise(function (resolve) {
         var img = new Image();
         img.onload = function () {
             var canvas = document.createElement("canvas");
             canvas.width = this.width;
             canvas.height = this.height;

             var ctx = canvas.getContext("2d");
             ctx.drawImage(this, 0, 0);

             var dataURL = canvas.toDataURL("image/png");
             resolve(dataURL);
         };
         img.src = url;
      });
   }

   var testImage =  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

   fit('upload inline data url', function(done) {
      img.upload(testImage, 'test').then(function(result) {
         expect(result.public_id).toBe('test');
         // console.log(result);
         done();
      }).catch(function (err) {
         console.log(err);
         done.fail();
      });
   });

   it('upload bigger image', function(done) {
      img2Data('base/test/img/lenna.png').then(function (data) {
         img.upload(data, 'lenna').then(function (result) {
            // console.log(result);
            expect(result.public_id).toBe('lenna');
            done();
         }).catch(function (err) {
            console.log(err);
            done.fail();
         });
      });
   });

   fit('delete image', function(done) {
      img.delete('test').then(function (result) {
         // console.log(result);
         expect(result.result).toBe('ok');
         done();
      }).catch(function (err) {
         console.log(err);
         done.fail();
      });
   });

});
