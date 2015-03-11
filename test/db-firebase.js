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

   // var $rootScope;
   // beforeEach( inject(function(_$rootScope_){
   //    $rootScope = _$rootScope_;
   // }));


   var applyInterval;
   var startApply = inject(function($rootScope) {
      applyInterval = setInterval(function() {
         $rootScope.$apply();
         // $rootScope.$digest();
      }, 500);
   });
   var stopApply = function() {
      clearInterval(applyInterval);
   };


   // verify that a promises success callback is called with an expected value
   var expectPromiseSuccess = function(promise, expected, done) {
      promise.then(function(value) {
         expect(value).toBe(expected);
      }).finally(function() {
         stopApply();
         done();
      });
      startApply();
   };



   // set firebase data for testing
   var useFixture = function(path, fixture, done) {
      path = path || '/'; // default to root
      fb.child(path).set(fixture, function onComplete(error) {
         if (error !== null) throw new Error("Failed setting fixture", fixture);
         done();
      });
   };

   // query and verify returned data
   var verifyData = function(query, expected, done) {
      query.once('value', function successCallback(data) {
         // use jasmine toEqual matcher for this
         var equals = jasmine.matchers.toEqual(jasmine.matchersUtil).compare;
         var result = equals( data.val(), expected );
         if ( !result.pass ) throw new Error("Data not as expected");
         done();
      });
   };

   var ensureUserCreated = function(credentials, done) {
      fb.createUser(credentials, function onComplete (error) {
         console.log(error);
         if (error !== null && error.code !== 'EMAIL_TAKEN') throw new Error('Failed adding user');
         done();
      });
   };

   var ensureUserRemoved = function(credentials, done) {
      fb.removeUser(credentials, function onComplete (error) {
         if (error !== null && error.code !== 'INVALID_USER') throw new Error('Failed removing user');
         done();
      });
   };


   // test the setup itself
   describe('testing setup', function() {
      it('should use the overridden firebase', function() {
         expect(db.getRefURL()).toEqual(fb.toString())
      });

      var fixture = {'test' : true};
      describe('use fixture', function() {
         it('successfully sets firebase to a fixture', function(done) {
            expect(function () {
               useFixture( '/', fixture, done);
            }).not.toThrow();
         });
      });

      describe('verify data', function() {
         it('checks that firebase holds the expected data', function(done) {
            expect(function () {
               verifyData( fb, fixture, done );
            }).not.toThrow();
         });
      });

      var credentials = {email:'jd@example.com', password:'asdf'};
      describe('ensure user created', function() {
         it('can be called two times without throwing an error', function(done) {
            expect(function () { ensureUserCreated(credentials, done); }).not.toThrow();
            expect(function () { ensureUserCreated(credentials, done); }).not.toThrow();
         });
      });

      describe('ensure user removed', function() {
         it('can be called two times without throwing an error', function(done) {
            expect(function () { ensureUserRemoved(credentials, done); }).not.toThrow();
            expect(function () { ensureUserRemoved(credentials, done); }).not.toThrow();
         });
      });
   });


   // beforeEach(function () {
   //    startApply();
   // });
   //
   // afterEach(function () {
   //    stopApply();
   // });

   describe('authentication and session management', function()    {
      describe('createUser function', function() {
         var credentials = {email:'jd@example.com', password:'asdf'};

         //ensureUserCreated(credentials);

         it('resolves its promise', function(done) {
            expectPromiseSuccess( db.createUser(credentials), undefined, done );
         });

      });
   });


});
