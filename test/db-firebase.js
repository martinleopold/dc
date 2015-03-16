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
   var when = function(promise) {
      var newPromise = promise.finally(function() {
         stopApply();
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

   var ensureUserLoggedIn = function(credentials) {
      return new Promise(function(resolve) {
         fb.authWithPassword(credentials, function onComplete (error, session) {
            if (error !== null || !session.uid) throw new Error('Failed authenticating user');
            resolve();
         });
      });
   };

   var ensureUserLoggedOut = function() {
      return new Promise(function(resolve) {
         fb.onAuth(function onAuth (session) {
            if (session === null) {
               fb.offAuth(onAuth);
               resolve();
            }
         });
         fb.unauth();
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

      describe('ensure user logged out', function() {
         it('logs the user out', function(done) {
            ensureUserCreated(credentials).then(function() {
              return ensureUserLoggedIn(credentials);
           }).then(function() {
             expect(function () { ensureUserLoggedOut().then(done); }).not.toThrow();
           });
         });
      });

      describe('ensure user logged in', function() {
         it('logs the user in', function(done) {
            ensureUserCreated(credentials).then(function() {
               expect(function () { ensureUserLoggedIn(credentials).then(done); }).not.toThrow();
            });
         });
      });
   });


   describe('authentication and session management', function()    {
      var credentials = {email:'jd@example.com', password:'asdf'};

      describe('createUser function', function() {
         it('resolves its promise when the user is not already created', function(done) {
            ensureUserRemoved(credentials).then(function() {
               when( db.auth.createUser(credentials) ).then(function(error) {
                  expect(error).toBeUndefined();
                  done();
               }, fail);
            });
         });

         it('rejects its promise when the user is already created', function(done) {
            ensureUserCreated(credentials).then(function() {
               when( db.auth.createUser(credentials) ).then(fail, function(error) {
                  expect(error.code).toBe('EMAIL_TAKEN');
                  done();
               });
            });
         });
      });

      describe('loginUser function', function() {
         it('resolves its promise with an uid on success', function(done) {
            ensureUserCreated(credentials).then(function() {
               when( db.auth.login(credentials) ).then(function(uid) {
                  expect(uid).toBeDefined();
                  done();
               }, fail);
            });
         });

         it('rejects its promise if the user is not present', function(done) {
            ensureUserRemoved(credentials).then(function() {
               when( db.auth.login(credentials) ).then(fail, function(error) {
                  expect(error.code).toBe('INVALID_USER');
                  done();
               });
            });
         });
      });

      describe('logoutUser function', function() {
         it('resolves its promise', function(done) {
            ensureUserCreated(credentials).then(function() {
               return ensureUserLoggedIn(credentials);
            }).then(function() {
               when( db.auth.logout() ).then(done, fail);
           });
         });
      });

      describe('getCurrentSession function', function() {
         it('resolves its promise when logged in', function(done) {
            ensureUserCreated(credentials).then(function() {
               return ensureUserLoggedIn(credentials);
            }).then(function() {
               when( db.auth.getCurrentSession() ).then(function(uid) {
                  expect(uid).toBeDefined();
               }).then(done, fail);
           });
         });

         it('rejects its promise when not logged in', function(done) {
            ensureUserLoggedOut(credentials).then(function() {
               when( db.auth.getCurrentSession() ).then(fail, done);
           });
         });


      });


   });


});
