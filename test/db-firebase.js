describe("firebase db service", function() {

   // load db module
   beforeEach( module('dc.db') );

   // override firebase ref used
   var fb = new Firebase("https://dc-test.firebaseio.com");
   beforeEach( module(function($provide) {
      $provide.value( 'fb', fb ); // $provide is the same interface, angular.module has
   }));

   // make db interface available to all tests
   var db;
   beforeEach( inject(function(_db_) {
      db = _db_;
      db.settings.checkArguments = true; // enable arguments checking
   }));

   /*
    * PROMISE HELPERS
    */

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

   // wrap tests, so angular promises ($q) are properly resolved
   function ngApplyWrap() {
      beforeEach(startApply);
      afterEach(stopApply);
   }

   // wrap a single angular promise in an ES6 promise
   // and make sure its resolved
   // deprecated. use chain() instead.
   var when = function(promise) {
      return new Promise(function(resolve, reject) {
         promise.then(function onFulfilled(result) {
            // console.log('success:', result);
            stopApply();
            resolve(result);
         }, function onRejected(error) {
            // console.log('error:', error);
            stopApply();
            reject(error);
         });
         startApply();
      });
   };

   // turn something into a function that returns it
   // constant function
   // function cfn(something) {
   //    return function giveMeIt () {
   //       return something;
   //    };
   // }

   // add partial application to function prototype
   // used to be able to pass a promise to .then (which expects a function, that can return a promise)
   // deprecated. use chain() instead
   Function.prototype.partial = function partial() {
      // this: the function partial was called on
      // call bind on the function: this.bind(null, arg1, arg2, arg3, ...)
      var args = Array.prototype.slice.call(arguments); // make a real array
      args.unshift(undefined);
      return Function.prototype.bind.apply(this, args);
   };

   // simple chaining of promises
   // (simpler than when + partial in .then chains...)
   function chain() {
      var promise = Promise.resolve();
      var args = Array.prototype.slice.call(arguments);
      args.forEach(function(arg) {
         promise = promise.then(function() {
            return Promise.resolve( arg ); // assimilate, if not already a promise
         });
      });
      return promise;
   }


   /*
    * TESTING HELPERS (Firebase specific)
    */

   // set firebase data for testing
   var useFixture = function(ref, fixture) {
      ref = ref || fb; // if ref is falsy, use root

      return new Promise(function resolver (resolve) {
         ref.set(fixture, function onComplete(error) {
            if (error !== null) {
               reject( new Error("Failed setting fixture ", fixture) );
            } else {
               resolve();
            }
         });
      });
   };

   // query and verify returned data
   // if returned data is an object, all expected properties need to match, but the returned object can have, additional properties
   // query is a firebase reference, possibly queries with startAt, etc..
   var verifyData = function(query, expected) {

      // compare objects using jasmine toEqual matcher
      function isEqual( o1, o2 ) {
         var equals = jasmine.matchers.toEqual(jasmine.matchersUtil).compare;
         return  equals(o1, o2).pass;
      }

      return new Promise(function resolver (resolve, reject) {
      // return $q(function resolver (resolve) {
         query.once('value', function successCallback(data) {
            var returned = data.val();
            var match = false;
            if (typeof returned === 'object' && typeof expected === 'object') {
               // match expected properties
               match = Object.keys(expected).every(function (propertyName) {
                  var propertyMatch = isEqual(returned[propertyName], expected[propertyName]);
                  return propertyMatch;
               });
            } else {
               match = isEqual(returned, expected);
            }
            // don't just throw the exception here, since firebase will handle it
            if ( !match ) {
               // console.log('rejecting');
               reject( new Error("Unexpected Data:\nGot: " + JSON.stringify(returned) + '\nExpected: ' + JSON.stringify(expected)) );
            } else {
               // console.log('resolving');
               resolve();
            }
         });
      });
   };

   var ensureUserCreated = function(credentials) {
      return new Promise(function(resolve, reject) {
         fb.createUser(credentials, function onComplete (error) {
            if (error !== null && error.code !== 'EMAIL_TAKEN') {
               reject( new Error('ensureUserCreated: ' + JSON.stringify(error)) );
            } else {
               resolve();
            }
         });
      });
   };

   var ensureUserRemoved = function(credentials) {
      return new Promise(function(resolve, reject) {
         fb.removeUser(credentials, function onComplete (error) {
            if (error !== null && error.code !== 'INVALID_USER') {
               reject( new Error('ensureUserRemoved: ' + JSON.stringify(error)) );
            } else {
               resolve();
            }
         });
      });
   };

   var ensureUserLoggedIn = function(credentials) {
      return new Promise(function(resolve, reject) {
         fb.authWithPassword(credentials, function onComplete (error, session) {
            if (error !== null || !session.uid) {
               console.log(error, session);
               reject( new Error('ensureUserLoggedIn: ' + JSON.stringify(error)) );
            } else {
               resolve();
            }
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


   fdescribe('ES6 Promise', function() {
      it('should fail if a callback returns a failing promise', function(done) {
         Promise.resolve()
         .then( function() {
            return Promise.reject( new Error('just because.') );
         })
         .then( fail, done );
      });

      it('should work with the custom chain method', function(done) {
         var timeoutPromise = new Promise(function(resolve, reject) {
            setTimeout(function() {
               resolve();
            }, 2000);
         });
         chain('a', timeoutPromise, 'b')
         .then(function(result) {
            expect(result).toBe('b');
            done();
         }, fail);
      });
   });

   // test the setup itself
   describe('testing setup', function() {
      it('should use the overridden firebase', function() {
         expect(db.util.getRefURL()).toEqual(fb.toString());
      });

      var fixture = {'test' : true};
      describe('useFixture function', function() {
         it('fulfills its promise', function(done) {
            useFixture(fb, fixture).then(done, fail);
         });
      });

      describe('verifyData function', function() {
         it('fulfills its promise if the data is as written', function(done) {
            useFixture(fb, fixture)
            .then( verifyData.partial(fb, fixture) )
            .then( done, fail );
         });

         it("rejects its promise if the data doesn't match", function(done) {
            useFixture(fb, fixture)
            .then( verifyData.partial(fb, {'test' : false}) )
            .then( fail, done );
         });
      });

      var credentials = {email:'jd@example.com', password:'asdf'};
      describe('ensure user created', function() {
         it('can be called two times without throwing an error', function(done) {
            ensureUserCreated(credentials)
            .then( ensureUserCreated.partial(credentials) )
            .then( done, fail );
         });
      });

      describe('ensure user removed', function() {
         it('can be called two times without throwing an error', function(done) {
            ensureUserRemoved(credentials)
            .then( ensureUserRemoved.partial(credentials) )
            .then( done, fail );
         });
      });

      describe('ensure user logged out', function() {
         it('logs the user out', function(done) {
            ensureUserCreated(credentials)
            .then( ensureUserLoggedIn.partial(credentials) )
            .then( ensureUserLoggedOut )
            .then( done, fail );
         });
      });

      describe('ensure user logged in', function() {
         it('logs the user in', function(done) {
            ensureUserCreated(credentials)
            .then( ensureUserLoggedIn.partial(credentials) )
            .then( done, fail );
         });
      });
   });


   describe('authentication and session management', function() {
      var credentials = {email:'jd@example.com', password:'asdf'};

      describe('createUser function', function() {
         it('resolves its promise when the user is not already created', function(done) {
            ensureUserRemoved(credentials)
            .then( when.partial(db.auth.createUser(credentials)) )
            .then( done, fail );
         });

         ngApplyWrap();
         it('rejects its promise when the user is already created', function(done) {
            chain(
               ensureUserCreated(credentials),
               db.auth.createUser(credentials)
            ).then( fail, function onReject (error) {
               console.log(error);
               expect(error.code).toBe('EMAIL_TAKEN');
               done();
            });
         });
      });

      ngApplyWrap();
      describe('loginUser function', function() {
         it('resolves its promise with an uid on success', function(done) {
            chain(
               ensureUserCreated(credentials),
               ensureUserLoggedOut(),
               db.auth.login(credentials)
            ).then(function(uid) {
               console.log(uid);
               expect(uid).toBeDefined();
               done();
            }, fail);
         });

         xit('rejects its promise if the user is not present', function(done) {
            chain(
               ensureUserLoggedOut(),
               ensureUserRemoved(credentials),
               db.auth.login(credentials)
            ).then(fail, function(error) {
               expect(error.code).toBe('INVALID_USER');
               done();
            });
         });
      });

      describe('logoutUser function', function() {
         it('resolves its promise', function(done) {
            chain(
               ensureUserCreated(credentials),
               ensureUserLoggedIn(credentials),
               db.auth.logout()
            ).then(done, fail);
         });
      });

      describe('getCurrentSession function', function() {
         xit('resolves its promise when logged in', function(done) {
            chain(
               ensureUserCreated(credentials),
               ensureUserLoggedIn(credentials),
               db.auth.getCurrentSession()
            ).then( function(uid) {
               expect(uid).toBeDefined();
            }).then(done, fail);

            // ensureUserCreated(credentials)
            // .then( ensureUserLoggedIn(credentials) )
            // .then( when(db.auth.getCurrentSession()) ) // promise fails, but next then is called
            // .then( function(uid) {
            //    console.log(uid);
            //    expect(uid).toBeDefined();
            // }).then(done, fail);
         });

         it('rejects its promise when not logged in', function(done) {
            chain(
               ensureUserLoggedOut(credentials),
               db.auth.getCurrentSession()
            ).then(fail, done);
         });
      });
   });

   ngApplyWrap();
   describe('utility function', function() {
      describe('checkObject', function() {
         it('should handle undefined object', function() {
            var obj; // its value is undefined
            expect(function() { db.util.checkObject(obj) }).toThrow();
            expect(function() { db.util.checkObject() }).toThrow();
            expect(function() { db.util.checkObject(undefined) }).toThrow();
            expect(function() { db.util.checkObject(null) }).toThrow();
         });

         it('should handle non-object', function() {
            expect(function() { db.util.checkObject("") }).toThrow();
            expect(function() { db.util.checkObject("xyz") }).toThrow();
            expect(function() { db.util.checkObject(0) }).toThrow();
            expect(function() { db.util.checkObject(1) }).toThrow();
            expect(function() { db.util.checkObject(true) }).toThrow();
            expect(function() { db.util.checkObject(false) }).toThrow();
            expect(function() { db.util.checkObject(function(arguments) {
            }) }).toThrow();
         });

         it('should handle not giving properties', function() {
            var result;
            expect(function() { result = db.util.checkObject({}) }).not.toThrow();
            expect(result).toBe(true);
         });

         it('should handle properties array', function() {
            var result;
            expect(function() { result = db.util.checkObject({x:"", y:"", z:""}, ["x", "y", "z"]) }).not.toThrow();
            expect(result).toBe(true);
            expect(function() { db.util.checkObject({x:"", y:""}, ["x", "y", "z"]) }).toThrow();
         });

         it('should handle properties as arguments', function() {
            expect(function() { db.util.checkObject({x:"", y:"", z:""}, "x", "y", "z") }).not.toThrow();
            expect(function() { db.util.checkObject({x:"", y:""}, "x", "y", "z") }).toThrow();
         });
      });
   });

   describe('user function', function() {
      var user;
      var userRef;

      beforeEach(function() {
         user = {
            userId: "user:id:xyz:123",
            firstName: "John",
            lastName: "Doe",
            email: "jd@example.com"
         };
         userRef = db.ref.user.child(user.userId);
      });

      describe('create', function() {
         it('creates a user object and sets basic data', function(done) {
            chain(
               db.user.create(user),
               verifyData(userRef, user)
            ).then( done, fail );

            // when( db.user.create(user) )
            // .then( verifyData(userRef, user) )
            // .then( done, fail );
         });
      });

      describe('update', function() {
         it('updates existing and adds non-existing properties', function(done) {
            var update = {
               userId: user.userId,
               firstName: "Tiberius",
               extraInfo: "xyz"
            };
            var expected = _.extend( {}, user, update );

            chain(
               useFixture(userRef, user),
               db.user.update(update),
               verifyData(userRef, expected)
            ).then(done, fail);

            // useFixture(userRef, user)
            // .then( when(db.user.update(update)) )
            // .then( verifyData(userRef, expected) )
            // .then(done, fail);
         });
      });
   });


});
