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
   /*
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
   */

   // turn something into a function that returns it
   // constant function
   /*
   function cfn(something) {
      return function giveMeIt () {
         return something;
      };
   }
   */

   // add partial application to function prototype
   // returns the function with the given parameters already bound to it
   // used to be able to pass a promise to .then (which expects a function that returns a promise)
   // also used with chainFns()
   Function.prototype.partial = function partial() {
      // this: the function partial was called on
      // call bind on the function: this.bind(null, arg1, arg2, arg3, ...)
      var args = Array.prototype.slice.call(arguments); // make a real array
      args.unshift(null); // adds null to beginning of args array
      return Function.prototype.bind.apply(this, args);
   };

   // simple chaining of promises
   // (simpler than when + partial in .then chains...)
   /*
   !!! this actually doesn't ensure the proper sequence since the promises already started the race!
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
   */

   // chain (promise-returning) functions
   // makes sure the functions are called in sequence
   // if a function doesn't return a promise, a promise that fulfills with its return value is used instead
   // thus promises can also be used instead of functions
   // returns a promise that resolves when all input functions resloved its promises
   function chainFns() {
      var promise = Promise.resolve();
      var args = Array.prototype.slice.call(arguments);
      args.forEach(function(fn) {
         promise = promise.then(function() {
            var result;
            if (typeof fn == 'function') result = fn.apply(null, arguments); // call function with incoming arguments
            else result = fn;
            return Promise.resolve( result ); // assimilate, if not already a promise
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

   // compare objects using jasmine toEqual matcher
   // returns a boolean
   function isEqual( o1, o2 ) {
      var equals = jasmine.matchers.toEqual(jasmine.matchersUtil).compare;
      return  equals(o1, o2).pass;
   }

   // check if data is a superset of the expected data.
   // i.e. all the expected data must be contained in data
   function checkSuperset( data, expected ) {
      var match = false;
      if (typeof data === 'object' && typeof expected === 'object') {
         // match expected properties
         match = Object.keys(expected).every(function (propertyName) {
            var propertyMatch = isEqual(data[propertyName], expected[propertyName]);
            return propertyMatch;
         });
      } else {
         match = isEqual(data, expected);
      }
      if ( !match ) throw new Error("Unexpected Data:\nGot: " + JSON.stringify(returned) + '\nExpected: ' + JSON.stringify(expected));
      return true;
   }

   // query and verify returned data
   // if returned data is an object, all expected properties need to match, but the returned object can have, additional properties
   // query is a firebase reference, possibly queries with startAt, etc..
   var verifyData = function(query, expected) {
      return new Promise(function resolver (resolve, reject) {
      // return $q(function resolver (resolve) {
         query.once('value', function successCallback(data) {
            // don't just throw the exception here, since firebase will handle it
            try {
               checkSuperset( data.val(), expected );
            } catch (error) {
               reject( error );
               return;
            }
            resolve();
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
   // * check that returned data is the data at the get location (requires ref)
   // * check that returned data is the expected data
   var testGetFn = function (fn, ref, expectedData) {
      return fn().then(function (data) {
         return verifyData(ref, data).then(function() {
            checkSuperset( data, expectedData ); // throws on failure
         });
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
      return Promise.resolve(fn())
      .then( verifyData.partial(ref, expectedData) );
   };

   // test a set-type function
   // * check that promise is fulfilled (requires promise)
   // * check that data that old data is not present
   // * check that expected data is present (requires ref, expected data)
   var testSetFn = function (fn, ref, expectedData) {
      var fixture = { 'someOldData': generateUUID() };

      return useFixture(ref, fixture)
      .then( fn )
      .then( verifyData.partial(ref, fixture) )
      .then( function onFulfilled () {
         // old data is still present
         throw new Error('testSet: old data not removed');
      }, function onRejected () {
         // old data is not present anymore
         return undefined; // move on now
      })
      .then( verifyData.partial(ref, expectedData) );
   };



   /*
    * promises
    */
   describe('ES6 Promise', function() {
      var stack;

      beforeEach(function() {
         stack = [undefined];
      });

      function getTimeoutPromise(time) {
         return new Promise(function(resolve, reject) {
            stack.push(time);
            setTimeout(function() {
               resolve(time);
            }, time);
         });
      }

      it('should call chained promise functions in the proper sequence', function(done) {
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
         .then( done.fail, done );
      });

      it('should work with the custom chain method', function(done) {
         chainFns(
            'a',
            getTimeoutPromise.partial(1000),
            function(arg) {
               stack.push('b')
               return arg + 'b';
            }
         ).then(function(result) {
            expect(result).toBe('1000b');
            expect(stack).toEqual([undefined, 1000, 'b'])
         }).then(done, done.fail);
      });
   });



   /*
    * test the setup itself
    */
   describe('testing setup', function() {
      it('should use the overridden firebase', function() {
         expect(db.util.getRefURL()).toEqual(fb.toString());
      });

      var fixture = {'test' : true};

      describe('useFixture function', function() {
         it('fulfills its promise', function(done) {
            useFixture(fb, fixture).then(done, done.fail);
         });
      });

      describe('verifyData function', function() {
         it('fulfills its promise if the data is as written', function(done) {
            useFixture(fb, fixture)
            .then( verifyData.partial(fb, fixture) )
            .then( done, done.fail );
         });

         it("rejects its promise if the data doesn't match", function(done) {
            useFixture(fb, fixture)
            .then( verifyData.partial(fb, {'test' : false}) )
            .then( done.fail, done );
         });
      });

      describe('user function', function () {
         var fixedUser, randomUser;

         beforeEach(function(done){
            fixedUser = { email:'jd@example.com', password:'asdf' };
            randomUser = randomCredentials();
            chainFns(
               ensureUserCreated.partial(fixedUser),
               ensureUserLoggedOut
            ).then(done, done.fail);
         });

         describe('ensureUserCreated', function() {
            it('resolves its promise', function(done) {
               ensureUserCreated(randomUser).then( done, done.fail );
            });

            it('can be called two times without throwing an error', function(done) {
               chainFns(
                  ensureUserCreated.partial(randomUser),
                  ensureUserCreated.partial(randomUser)
               ).then( done, done.fail );
            });
         });

         describe('ensureUserRemoved', function() {
            it('resolves its promise', function(done) {
               chainFns(
                  ensureUserCreated.partial(randomUser),
                  ensureUserRemoved.partial(randomUser)
               ).then( done, done.fail );
            });

            it('can be called two times without throwing an error', function(done) {
               chainFns(
                  ensureUserCreated.partial(randomUser),
                  ensureUserRemoved.partial(randomUser),
                  ensureUserRemoved.partial(randomUser)
               ).then( done, done.fail );
            });
         });

         describe('ensureUserLoggedOut', function() {
            it('logs the user out', function(done) {
               chainFns(
                  ensureUserLoggedIn.partial(fixedUser),
                  ensureUserLoggedOut
               ).then( done, done.fail );
            });

            it('can be called two times', function(done) {
               chainFns(
                  ensureUserLoggedIn.partial(fixedUser),
                  ensureUserLoggedOut,
                  ensureUserLoggedOut
               ).then( done, done.fail );
            });
         });

         describe('ensureUserLoggedIn', function() {
            it('logs the user in', function(done) {
               ensureUserLoggedIn(fixedUser).then(done, done.fail);
            });

            it('can be called two times', function(done) {
               chainFns(
                  ensureUserLoggedIn.partial(fixedUser),
                  ensureUserLoggedIn.partial(fixedUser)
               ).then( done, done.fail );
            });

            it("fails if the user doesn't exist", function(done) {
               chainFns(
                  ensureUserRemoved.partial(randomUser),
                  ensureUserLoggedIn.partial(randomUser)
               ).then( done.fail, done );
            });
         });
      });

      describe('generic query function', function() {
         var ref, fixture;

         beforeEach(function () {
            ref = fb.child('test');
            fixture = {'a': 0, 'b': 1, 'c': 2};
         });

         describe('get', function() {
            it('passes testGetFn', function(done) {
               var getFn = db.query.get.partial(ref);
               chainFns(
                  useFixture.partial( ref, fixture ),
                  testGetFn.partial( getFn, ref, fixture )
               ).then( done, done.fail );
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



   /*
    * auth and sessions
    */
   describe('authentication and session management', function() {
      // var credentials = {email:'jd@example.com', password:'asdf'};
      var fixedUser, randomUser;

      beforeEach(function(done){
         fixedUser = { email:'jd@example.com', password:'asdf' };
         randomUser = randomCredentials();
         ensureUserCreated(fixedUser)
         .then(ensureUserLoggedOut)
         .then(done, done.fail);
      });

      describe('createUser function', function() {
         it('resolves its promise when the user is not already created', function(done) {
            db.auth.createUser(randomUser).then(done, fail);
         });

         it('rejects its promise when the user is already created', function(done) {
            db.auth.createUser(fixedUser).then( done.fail, function onRejected (error) {
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
            ensureUserRemoved(randomUser)
            .then( db.auth.login.partial(randomUser) )
            .then( done.fail, function(error) {
               expect(error.code).toBe('INVALID_USER');
               done();
            });
         });
      });

      describe('logoutUser function', function() {
         it('resolves its promise', function(done) {
            ensureUserLoggedIn(fixedUser)
            .then( db.auth.logout )
            .then( done, done.fail);
         });
      });

      describe('getCurrentSession function', function() {
         it('fulfills its promise when logged in', function(done) {
            // console.log('start');
            ensureUserLoggedIn(fixedUser)
            .then( db.auth.getCurrentSession )
            .then( function onFulfilled(uid) {
               // console.log('current session', uid);
               expect(uid).toBeDefined();
               done();
            }, function onRejected(error) {
               // console.log('no current session');
               done.fail(error);
            });
         });

         it('rejects its promise when not logged in', function(done) {
            db.auth.getCurrentSession().then(done.fail, done);
         });
      });
   });



   /*
    * utility functions
    */
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



   /*
    * USER
    */
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
            chainFns(
               db.user.create.partial(user),
               verifyData.partial(userRef, user)
            ).then( done, done.fail );
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

            chainFns(
               useFixture.partial(userRef, user),
               db.user.update.partial(update),
               verifyData.partial(userRef, expected)
            ).then(done, done.fail);
         });
      });

      describe('get', function() {
         it('passes testGetFn', function(done) {
            var getFn = db.user.get.partial(user.userId);
            useFixture(userRef, user)
            .then( testGetFn.partial(getFn, userRef, user) )
            .then( done, done.fail );
         });
      });

      describe('updateSettings', function() {
         it('passes testUpdateFn', function(done) {
            var settings = {
               'settingA': 0,
               'settingB': 1,
               'settingC': 2
            };
            var settingsUpdate = {
               'settingC': 'c',
               'settingD': 'd'
            };
            user.settings = settings;
            var updateFn = db.user.updateSettings.partial(user.userId, settingsUpdate);

            useFixture(userRef, user)
            .then( testUpdateFn.partial(updateFn, userRef.child('settings'), settingsUpdate) )
            .then( done, done.fail );
         });
      });

      describe('getFriends', function() {
         it('passes testGetFn', function(done) {
            var friends = {
               'friend0' : true,
               'friend1' : true,
               'friend2' : true
            };
            user.friends = friends;
            var getFn = db.user.getFriends.partial(user.userId);

            useFixture(userRef, user)
            .then( testGetFn.partial(getFn, userRef.child('friends'), friends) )
            .then( done, done.fail );
         });
      });

      describe('getNotifications', function() {
         it('passes testGetFn', function(done) {
            var notifications = {
               'notification0' : { forUser: user.userId },
               'notification1' : { forUser: user.userId },
               'notification2' : { forUser: user.userId }
            };

            var getFn = db.user.getNotifications.partial(user.userId);

            Promise.all([
               useFixture(userRef, user),
               useFixture(db.ref.notification, notifications)
            ]).then( testGetFn.partial(getFn, db.ref.notification, notifications) )
            .then( done, done.fail );
         });
      });
   });



   /*
    * FRIEND REQUEST
    */
   describe('friend request function', function() {
      var friendRequest;
      var refFriendRequest;

      beforeEach(function () {
         friendRequest = {
            byUser : 'userId:0',
            toUser : 'userId:1'
            // status : 'pending'
         };
         refFriendRequest = db.ref.friendRequest;
      });

      describe('send', function() {
         it('passes testPushFn', function(done) {
            var pushFn = db.friendRequest.send.partial(friendRequest.byUser, friendRequest.toUser);

            testPushFn( pushFn, refFriendRequest, friendRequest )
            .then( done, done.fail );
         });
      });

      describe('accept', function() {
         it('passes testUpdateFn', function(done) {
            var id = generateUUID();
            var updateFn = db.friendRequest.accept.partial(id);
            var ref = refFriendRequest.child(id);
            var expected = _.extend({}, friendRequest, {status: 'accepted'});

            useFixture( ref, friendRequest )
            .then( testUpdateFn.partial(updateFn, ref, expected) )
            .then( done, done.fail );
         });
      });

      describe('reject', function() {
         it('passes testUpdateFn', function(done) {
            var id = generateUUID();
            var updateFn = db.friendRequest.reject.partial(id);
            var ref = refFriendRequest.child(id);
            var expected = _.extend({}, friendRequest, {status: 'rejected'});

            useFixture( ref, friendRequest )
            .then( testUpdateFn.partial(updateFn, ref, expected) )
            .then( done, done.fail );
         });
      });

      describe('getIncoming', function() {
         it('passes testGetFn', function(done) {
            var userId = generateUUID();
            var expected = {};
            expected[generateUUID()] = { byUser : 'id:x', toUser : userId };
            expected[generateUUID()] = { byUser : 'id:y', toUser : userId };
            expected[generateUUID()] = { byUser : 'id:z', toUser : userId };
            var additional = {};
            additional[generateUUID()] = { byUser : 'id:0', toUser : 'sombody:else' };
            var friendRequests = _.extend({}, expected, additional);
            var getFn = db.friendRequest.getIncoming.partial(userId);

            useFixture( refFriendRequest, friendRequests )
            .then( testGetFn(getFn, refFriendRequest, expected) )
            .then( done, done.fail );
         });
      });

      describe('getOutgoing', function() {
         it('passes testGetFn', function(done) {
            var userId = generateUUID();
            var expected = {};
            expected[generateUUID()] = { byUser : userId, toUser : 'id:x' };
            expected[generateUUID()] = { byUser : userId, toUser : 'id:y' };
            expected[generateUUID()] = { byUser : userId, toUser : 'id:z' };
            var additional = {};
            additional[generateUUID()] = { byUser : 'somebody:else', toUser : 'id:0' };
            var friendRequests = _.extend({}, expected, additional);
            var getFn = db.friendRequest.getOutgoing.partial(userId);

            useFixture( refFriendRequest, friendRequests )
            .then( testGetFn(getFn, refFriendRequest, expected) )
            .then( done, done.fail );
         });
      });
   });

});
