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

   // wrap angular promise to make sure it's resolved
   var when = function(promise, done) {
      var newPromise = promise.finally(function() {
         stopApply();
         if (typeof done === 'function') done();
      });
      startApply();
      return newPromise;
   };

   // set firebase data for testing
   var useFixture = function(path, fixture) {
      path = path || '/'; // default to root
      return new Promise(function(resolve) {
         fb.child(path).set(fixture, function onComplete(error) {
            if (error !== null) throw new Error("Failed setting fixture", fixture);
            resolve();
         });
      });
   };

   // query and verify returned data
   var verifyData = function(query, expected) {
      return new Promise(function(resolve) {
         query.once('value', function successCallback(data) {
            // use jasmine toEqual matcher for this
            var equals = jasmine.matchers.toEqual(jasmine.matchersUtil).compare;
            var result = equals( data.val(), expected );
            if ( !result.pass ) throw new Error("Data not as expected");
            resolve();
         });
      });
   };

   var ensureUserCreated = function(credentials) {
      return new Promise(function(resolve) {
         fb.createUser(credentials, function onComplete (error) {
            if (error !== null && error.code !== 'EMAIL_TAKEN') throw new Error('Failed adding user');
            resolve();
         });
      });
   };

   var ensureUserRemoved = function(credentials) {
      return new Promise(function(resolve) {
         fb.removeUser(credentials, function onComplete (error) {
            if (error !== null && error.code !== 'INVALID_USER') throw new Error('Failed removing user');
            resolve();
         });
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
               useFixture('/', fixture).then(done);
            }).not.toThrow();
         });
      });

      describe('verify data', function() {
         it('checks that firebase holds the expected data', function(done) {
            expect(function () {
               verifyData(fb, fixture).then(done);
            }).not.toThrow();
         });
      });

      var credentials = {email:'jd@example.com', password:'asdf'};
      describe('ensure user created', function() {
         it('can be called two times without throwing an error', function(done) {
            expect(function () { ensureUserCreated(credentials).then(done); }).not.toThrow();
            expect(function () { ensureUserCreated(credentials).then(done); }).not.toThrow();
         });
      });

      describe('ensure user removed', function() {
         it('can be called two times without throwing an error', function(done) {
            expect(function () { ensureUserRemoved(credentials).then(done); }).not.toThrow();
            expect(function () { ensureUserRemoved(credentials).then(done); }).not.toThrow();
         });
      });
   });


   describe('authentication and session management', function()    {
      var credentials = {email:'jd@example.com', password:'asdf'};

      describe('createUser function', function() {
         it('resolves its promise when the user is not already created', function(done) {
            ensureUserRemoved(credentials).then(function() {
               when( db.createUser(credentials), done ).then(function(error) {
                  expect(error).toBeUndefined();
               });
            });
         });

         it('rejects its promise when the user is already created', function(done) {
            ensureUserCreated(credentials).then(function() {
               when( db.createUser(credentials), done ).catch(function(error) {
                  expect(error.code).toBe('EMAIL_TAKEN');
               });
            });
         });
      });

      describe('loginUser function', function() {
         it('resolves its promise with an uid on success', function(done) {
            ensureUserCreated(credentials);
            when( db.loginUser(credentials), done ).then(function(uid) {
               expect(uid).toBeDefined();
            });
         });

         fit('rejects its promise if the user is not present', function(done) {
            ensureUserRemoved(credentials);
            when( db.loginUser(credentials), done ).catch(function(error) {
               expect(error).toBeDefinded();
            });
         });
      });




   });


});
