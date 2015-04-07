describe("firebase db service", function() {

   // TODO: get rid of .partial calls
   // TODO: get rid of when() calls, since applyWrap() is used globally

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

   jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000; // timeout for async calls


   function generateUUID() {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
   };


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

   // wrap tests for angular promises to work (see promise helpers)
   ngApplyWrap();

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
   // used to be able to pass a promise to .then (which expects a function that returns a promise)
   // deprecated. use chain() instead
   Function.prototype.partial = function partial() {
      // this: the function partial was called on
      // call bind on the function: this.bind(null, arg1, arg2, arg3, ...)
      var args = Array.prototype.slice.call(arguments); // make a real array
      args.unshift(null); // adds null to beginning of args array
      return Function.prototype.bind.apply(this, args);
   };

   // simple chaining of promises
   // (simpler than when + partial in .then chains...)
   // FIXME: this actually doesn't ensure the proper sequence since the promises already started the race!
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

   // chain (promise-returning) functions
   // makes sure the functions are called in sequence
   // if a function doesn't return a promise, a promise that fulfills with its return value is used instead
   function chainFns() {
      var promise = Promise.resolve();
      var args = Array.prototype.slice.call(arguments);
      args.forEach(function(fn) {
         promise = promise.then(function() {
            return Promise.resolve( fn.call(null) ); // assimilate, if not already a promise
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
         fb.createUser(credentials, function onComplete (error, user) {
            if (error !== null && error.code !== 'EMAIL_TAKEN') {
               reject( new Error('ensureUserCreated: ' + JSON.stringify(error)) );
            } else {
               resolve(user);
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
               // console.log(error, session);
               reject( new Error('ensureUserLoggedIn: ' + JSON.stringify(error)) );
            } else {
               resolve(session);
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

   var randomCredentials = function() {
      return {
         email: generateUUID() + '@example.com',
         password: 'asdf'
      };
   };

   // test get-type function
   // fn is a function that returns a promise.
   // * check that promise is fulfilled (requires promise)
   // * check that returned data is the data at the get location (requires, ref)
   var testGetFn = function (fn, ref) {
      return fn().then(function onFulfilled (data) {
         return verifyData(ref, data);
      });
   };

   // test a push-type query function
   // * check that promise returns an id (requires promise)
   // * check data under the new id (requires ref, expected data)
   var testPushFn = function (fn, ref, expectedData) {
      return fn().then(function onFulfilled (id) {
         if (!id) throw new Error('testPush: id expected, got ' + id);
         return verifyData(ref.child(id), expectedData);
      });
   };

   // test update-type function
   // * check that promise is fulfilled (requires promise)
   // * check that old data is still present, updated, and new data also present (requires expected data, ref)
   var testUpdateFn = function (fn, ref, expectedData) {
      var fixture = { 'someOldData': generateUUID() };
      return chain(
         useFixture(ref, fixture),
         fn(),
         verifyData(ref, fixture),
         verifyData(ref, expectedData)
      );
   };

   // test a set-type function
   // * check that promise is fulfilled (requires promise)
   // * check that data that old data is not present
   // * check that expected data is present (requires ref, expected data)
   var testSetFn = function (fn, ref, expectedData) {
      var fixture = { 'someOldData': generateUUID() };
      return chain(
         useFixture(ref, fixture),
         fn(),
         verifyData(ref, fixture).then(function onFulfilled () {
            // old data is still present
            throw new Error('testSet: old data not removed');
         }, function onRejected () {
            // old data is not present anymore
            return undefined;
         }),
         verifyData(ref, expectedData)
      );
   };


   describe('ES6 Promise', function() {
      var stack = [undefined];

      function getTimeoutPromise(time) {
         return new Promise(function(resolve, reject) {
            stack.push(time);
            setTimeout(function() {
               resolve();
            }, time);
         });
      }

      fit('should call chained promise functions in the proper sequence', function(done) {
         chainFns(
            getTimeoutPromise.partial(1000),
            function() {
               stack.push(1);
            },
            getTimeoutPromise.partial(666),
            function () {
               stack.push(2);
            },
            getTimeoutPromise.partial(333),
            function () {
               stack.push(3);
            }
         ).then(function() {
            expect(stack).toEqual([undefined, 1000, 1, 666, 2, 333, 3]);
            done();
         }, done.fail);
      });

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

      describe('user function', function () {
         var fixedUser, randomUser;

         beforeEach(function(done){
            fixedUser = { email:'jd@example.com', password:'asdf' };
            randomUser = randomCredentials();
            chain(
               ensureUserCreated(fixedUser),
               ensureUserLoggedOut()
            ).then(done, fail);
         });

         describe('ensureUserCreated', function() {
            it('resolves its promise', function(done) {
               ensureUserCreated(randomUser).then( done, fail );
            });

            it('can be called two times without throwing an error', function(done) {
               chain(
                  ensureUserCreated(randomUser),
                  ensureUserCreated(randomUser)
               ).then( done, fail );
            });
         });

         describe('ensureUserRemoved', function() {
            it('resolves its promise', function(done) {
               chain(
                  ensureUserCreated(randomUser),
                  ensureUserRemoved(randomUser)
               ).then( done, fail );
            });

            it('can be called two times without throwing an error', function(done) {
               chain(
                  ensureUserCreated(randomUser),
                  ensureUserRemoved(randomUser),
                  ensureUserRemoved(randomUser)
               ).then( done, fail );
            });
         });

         describe('ensureUserLoggedOut', function() {
            it('logs the user out', function(done) {
               chain(
                  ensureUserLoggedIn(fixedUser),
                  ensureUserLoggedOut()
               ).then( done, fail );
            });

            it('can be called two times', function(done) {
               chain(
                  ensureUserLoggedIn(fixedUser),
                  ensureUserLoggedOut(),
                  ensureUserLoggedOut()
               ).then( done, fail );
            });
         });
      });

      describe('ensureUserLoggedIn', function() {
         it('logs the user in', function(done) {
            chain(
               ensureUserLoggedIn(fixedUser)
            ).then( done, fail );
         });

         it('can be called two times', function(done) {
            chain(
               ensureUserLoggedIn(fixedUser),
               ensureUserLoggedIn(fixedUser)
            ).then( done, fail );
         });

         it("fails if the user doesn't exist", function(done) {
            chain(
               ensureUserRemoved(randomUser),
               ensureUserLoggedIn(randomUser)
            ).then( fail, done );
         });
      });

      describe('generic query function', function() {
         var ref, fixture;

         beforeAll(function () {
            ref = fb.child('test');
            fixture = {'a': 0, 'b': 1, 'c': 2};
         });

         describe('get', function() {
            it('passes testGetFn', function(done) {
               var getFn = db.query.get.partial(ref);
               chain(
                  useFixture(ref, fixture),
                  testGetFn( getFn, ref )
               ).then(done, done.fail);
            });
         });

         describe('push', function() {
            it('passes testPush', function(done) {
               var pushFn = db.query.push.partial(ref, fixture);
               testPushFn(pushFn, ref, fixture).then(done, done.fail);
            });
         });

         describe('update', function() {
            it('passes testUpdateFn', function(done) {
               var updateFn = db.query.update.partial(ref, fixture);
               testUpdateFn(updateFn, ref, fixture).then(done, done.fail);
            });
         });

         describe('set', function() {
            it('passes testSetFn', function(done) {
               var setFn = db.query.set.partial(ref, fixture);
               testSetFn(setFn, ref, fixture).then(done, done.fail);
            });
         });
      });
   });


   describe('authentication and session management', function() {
      // var credentials = {email:'jd@example.com', password:'asdf'};

      var fixedUser, randomUser;
      beforeEach(function(done){
         fixedUser = { email:'jd@example.com', password:'asdf' };
         randomUser = randomCredentials();
         chain(
            ensureUserCreated(fixedUser),
            ensureUserLoggedOut()
         ).then(done, fail);
      });


      describe('createUser function', function() {
         it('resolves its promise when the user is not already created', function(done) {
            db.auth.createUser(randomUser).then(done, fail);
         });

         it('rejects its promise when the user is already created', function(done) {
            db.auth.createUser(fixedUser).then( fail, function onReject (error) {
               // console.log(error);
               expect(error.code).toBe('EMAIL_TAKEN');
               done();
            });
         });
      });

      describe('loginUser function', function() {
         it('resolves its promise with an uid on success', function(done) {
            db.auth.login(fixedUser).then(function(uid) {
               // console.log(uid);
               expect(uid).toBeDefined();
               done();
            }, fail);
         });

         it('rejects its promise if the user is not present', function(done) {
            chain(
               ensureUserRemoved(randomUser),
               db.auth.login(randomUser)
            ).then(fail, function(error) {
               expect(error.code).toBe('INVALID_USER');
               done();
            });
         });
      });

      describe('logoutUser function', function() {
         it('resolves its promise', function(done) {
            chain(
               ensureUserLoggedIn(fixedUser),
               db.auth.logout()
            ).then(done, fail);
         });
      });

      describe('getCurrentSession function', function() {
         // FIXME rejects its promise even when logged in...
         xit('fulfills its promise when logged in', function(done) {
            console.log('start');
            chain(
               ensureUserLoggedIn(fixedUser),
               db.auth.getCurrentSession()
            ).then( function onFulfilled(uid) {
               console.log('current session', uid);
               expect(uid).toBeDefined();
               done();
            }, function onRejected(error) {
               console.log('no current session');
               done.fail(error);
               console.log(done.fail);
            });
         });

         it('rejects its promise when not logged in', function(done) {
            db.auth.getCurrentSession().then(fail, done);
         });
      });
   });

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



   // describe('query function', function() {
   //    describe('push', function() {
   //       // body...
   //    });
   // });

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
         });
      });

      describe('get', function() {
         it('passes testGetFn', function(done) {
            chain(
               useFixture(userRef, user),
               testGetFn( db.user.get.partial(user.userId), userRef )
            ).then(done, done.fail);
         });
      });

   });

});
