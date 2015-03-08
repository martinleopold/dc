describe("firebase db service", function() {

   // load db module
   beforeEach( module('dc.db') );

   // override firebase ref used
   var fb = new Firebase("https://dc-test.firebaseio.com");
   beforeEach( module(function($provide) {
      $provide.value( 'fb', fb );
   }));

   // make db interface available to all tests
   var db;
   beforeEach( inject(function(_db_){
      db = _db_;
   }));

   // set firebase data for testing
   var useFixture = function(path, fixture) {
      path = path || '/'; // default to root
      it('successfully set firebase ' + path + ' to a fixture', function(done) {
         fb.child(path).set(fixture, function onComplete(error) {
            expect(error).toBe(null);
            done();
         });
      });
   };

   // query and verify returned data
   var verifyData = function(query, expected) {
      it('checked that firebase holds the expected data', function(done) {
         query.once('value', function successCallback(data) {
            expect(data.val()).toEqual(expected);
            done();
         });
      });
   };

   // test the setup itself
   describe('testing setup', function() {
      it('should use the overridden firebase', function() {
         expect(db.getRefURL()).toEqual(fb.toString())
      });

      var fixture = {'test' : true}
      describe('use fixture', function() {
         useFixture( '/', fixture);
      });

      describe('verify data', function() {
         verifyData( fb, fixture);
      });
   });










});
