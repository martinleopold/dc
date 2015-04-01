angular.module('dc.db', ['firebase'])

.value( 'fb', new Firebase("https://dinner-collective.firebaseio.com/") ) // define firebase ref as value service so it can be overridden easily

.factory('db', ['$rootScope', '$q', '$firebase', 'fb' , function($rootScope, $q, $firebase, fb) {

	var ref = { root: fb }; // store firebase references. place the main ref in there as 'root' as well, even though is shorter just to use 'fb'

	var db = {}; // the db interface to be exported (as 'db')
	db.ref = ref; // make refs available for testing
	db.settings = {};
	db.settings.checkArguments = false; // set true to check arguments using the checkObject function

	db.util = {};
	/**
	 * Get current firebase URL. Used for testing.
	 * @return {String} - URL of the firebase reference currently in use.
	 */
	db.util.getRefURL = function() {
		return fb.toString();
	};

	// check that an object is defined and optionally has some defined properties
	// properties can be given as array of strings or as separate string arguments
	function checkObject (obj, properties) {
		if ( ! db.settings.checkArguments ) return true;
		// check obj itself
		if ( typeof obj != 'object' || obj == undefined ) {
			throw new Error(obj + ' is expected to be an object.');
		}
		// if properties is not given or is not an array, create the properties array from arguments
		if ( properties == undefined || !Array.isArray(properties) ) { // == undefined tests for null and undefined
			properties = Array.prototype.slice.call(arguments, 1);
		}
		// check properties
		properties.forEach( function checkProperties (p) {
			if ( obj[p] === undefined ) {
				throw new Error(obj.p + ' is expected to be defined.');
			}
		});
		return true;
	};
	db.util.checkObject = checkObject; // make it available for testing

	// TODO: complete
	// function checkObjectAlt(obj, propLists) {
	// 	if ( ! db.settings.checkArguments ) return true;
	// 	// check obj itself
	// 	if ( typeof obj != 'object' || obj == undefined ) {
	// 		throw new Error(obj + ' is expected to be an object.');
	// 	}
	//
	// }


	function createError (name, message) {
		var error = new Error(message);
		error.name = name;
		return error
	};
	db.util.createError = createError;

	db.error = {
		unauthorized : 'UNAUTHORIZED',
		notFound : 'NOT_FOUND'
	};

/*
 * queries can be grouped due to different criteria:
 * technical type (create, update, delete)
 * by context (the view where they might be used)
 * by the data they operate on (type created or returned)
 *
 * general API considerations
 */


/**
 * TODO: return defined errors
 * TODO: move errors and util functions to a seperat file
 * TODO: firebase query helpers: push obj + return id, update object, get by id, get by child
 *
 */


/**
 * @callback successCallback
 * @param result - The result.
 */

/**
 * @callback errorCallback
 * @param reason - The rejection reason.
 */

/**
 * @callback callback
 */

/**
 * Calls one of the success or error callbacks asynchronously as soon as the result is available.
 * @typedef {function} thenFunction
 * @param {successCallback}
 * @param {errorCallback}
 * @returns {Promise} - This promise is fulfilled with the return value of either callback. It is rejected with the error if either callback throws an exception.
 */

/**
 * Sugar for Promise.then(undefined, errorCallback)
 * @typedef {function} catchFunction
 * @param {errorCallback}
 * @returns {Promise} - This promise is fulfilled with the return value of the error callback.
 */

/**
 * Calls the callback as soon as the promise is either fulfilled or rejected. Useful for cleanup.
 * @typedef {function} finallyFunction
 * @param {callback}
 */

/**
 * Angular Promise. Usually from the $q service.
 * @typedef {Object} Promise
 * @property {thenFunction} then
 * @property {catchFunction} catch
 * @property {finallyFunction} finally
 */






/*
 * AUTHENTICATION
 *
 * login user
 * logout user
 * current session
 *
 */

/**
 * @typedef {Object} UserCredentials
 * @property {string} email
 * @property {string} password
 */

db.auth = {};
/**
 * Create a new user
 * @param {Object} user
 * email, password
 * @return {Promise} - user id on success. Error message on error.
 */
db.auth.createUser = function (credentials) {
	return $q(function resolver (resolve, reject) {
		fb.createUser(credentials, function onComplete (error, user) {
			if (error === null) {
				resolve(user.uid);
			} else {
				reject(error);
			}
		});
	});
};

/**
 * Login a user with email and password.
 * @param {UserCredentials} credentials
 * email, password
 * @return {Promise} - user id on success. error object on error.
 */
db.auth.login = function (credentials) {
	return $q(function resolver (resolve, reject) {
	  fb.authWithPassword(credentials, function onComplete (error, session) {
	    if (error === null) {
	    	resolve(session.uid, session);
	    } else {
	    	reject(error);
	    }
	  });
	});
};

db.auth.logout = function () {
	return $q(function resolver (resolve, reject) {
		fb.onAuth(function onAuth (session) {
			if (session === null) {
				fb.offAuth(onAuth);
				resolve();
			}
		});
		fb.unauth();
	});
};

/**
 * [getCurrentSession description]
 * @return {Promise} - user id on success.
 */
db.auth.getCurrentSession = function () {
	return $q(function resolver (resolve, reject) {
		var session = fb.getAuth(); // sync
		// console.log('current session:', session);
		if (session === null) {
			// console.log('rejecting');
			reject();
		} else {
			// console.log('resolving');
			resolve(session.uid);
		}
	});
};


/*
 * USER
 *
 * new user (C)
 * change settings (U)
 * add photo (C)
 * remove photo (D)
 * reorder photo (U)
 *
 *
 *
 * friends of this user
 * user data incl. settings
 * gallery pictures
 *
 *
 * dinners hosted by this user
 * dinners the user applied to/was accepted to/was rejected from (mutually excl.)
 * dinners invited to
 *
 * groups with member status
 * groups with admin status
 * notifications received
 * reviews of dinners hosted by this user
 *
 */


ref.user = fb.child('user');
db.user = {};

/*
	create a user record
	user needs to have userId (obtained from auth.createUser and auth.login)
	other fields are optional, the ones that are present are updated
 */
db.user.create = function (user) {
	user = _.cloneDeep(user); // don't modify the passed data
	return $q(function (resolve, reject) {
		checkObject(user, 'userId', 'firstName', 'lastName', 'email');
		user.createdAt = Firebase.ServerValue.TIMESTAMP;
		ref.user.child(user.userId).set(user, function onComplete(error) {
			if (error === null) resolve();
			else reject(error);
		});
	});
};

/*
	update user data
	user needs to have userId
	other fields are optional, the ones that are present are updated
 */
db.user.update = function (user) {
	user = _.cloneDeep(user); // don't modify the passed data

	return $q(function (resolve, reject) {
		checkObject(user, 'userId');
		user.updateddAt = Firebase.ServerValue.TIMESTAMP;
		ref.user.child(user.userId).update(user, function onComplete(error) {
			if (error === null) resolve();
			else reject(error);
		});
	});
};


db.user.updateSettings = function (uid, settings) {

};

db.user.createImage = function () {

};

db.user.deleteImage = function () {

};

db.user.reorderImage = function () {

};

db.user.getFriends = function () {

};

// user data incl. settings and pics
db.user.get = function () {

};

db.user.getNotifications = function (userId) {

};


/*
 * FRIEND REQUESTS
 *
 * send friend request (U)
 * accept friend request (U)
 * friend requests received
 *
 */
db.friendRequest = {};
ref.friendRequest = fb.child('friendRequest');

// TODO: test
// TODO: check that users exist
db.friendRequest.send = function (byUser, toUser) {
	// TODO: check values
	return $q(function(resolve, reject) {
		var friendRequest = {
			createdAt : Firebase.ServerValue.TIMESTAMP,
			byUser : byUser,
			toUser : toUser,
			status : 'pending'
		};
		var friendRequestRef = ref.friendRequest.push(friendRequest, function onComplete(error) {
			if (error === null) {
				resolve( friendRequest.key() );
			} else {
				reject(error);
			}
		});
	});
};

// TODO: test
// TODO: only if toUser is sending the request
db.friendRequest.accept = function (friendRequestId) {
	return $q(function(resolve, reject) {
		var friendRequest = {
			updatedAt : Firebase.ServerValue.TIMESTAMP,
			status : 'accepted'
		};
		ref.friendRequest.child(friendRequestId).update(friendRequest, function onComplete(error) {
			if (error === null) {
				resolve();
			} else {
				reject(error);
			}
		});
	});
};

// TODO: test
// TODO: only if toUser is sending the request
db.friendRequest.reject = function (friendRequestId) {
	return $q(function(resolve, reject) {
		var friendRequest = {
			updatedAt : Firebase.ServerValue.TIMESTAMP,
			status : 'rejected'
		};
		ref.friendRequest.child(friendRequestId).update(friendRequest, function onComplete(error) {
			if (error === null) {
				resolve();
			} else {
				reject(error);
			}
		});
	});
};

// TODO: test
// TODO: only if userId is sending the request
db.friendRequest.getIncoming = function (userId) {
	return $q(function(resolve, reject) {
		ref.friendRequest
		.orderByChild('toUser')
		.equalTo(userId)
		.once('value', function callback(snapshot) {
			var data = snapshot.val();
			if (val === null) {
				reject( createError(db.error.notFound, 'friendRequest not found.') );
			} else {
				resolve(data);
			}
		}, function cancelCallback(error) {
			reject( createError(db.error.unauthorized, error.message) );
		});
	});
};

// TODO: test
// TODO: only if userId is sending the request
db.friendRequest.getOutgoing = function (userId) {
	return $q(function(resolve, reject) {
		ref.friendRequest
		.orderByChild('toUser')
		.equalTo(userId)
		.once('value', function callback(snapshot) {
			var data = snapshot.val();
			if (val === null) {
				reject( createError(db.error.notFound, 'friendRequest not found.') );
			} else {
				resolve(data);
			}
		}, function cancelCallback(error) {
			reject( createError(db.error.unauthorized, error.message) );
		});
	});
};



/*
 * DINNER (All)
 *
 *
 * basic info (title, description, address, time, ...)
 * users that applied/were accepted/were rejected (mutally excl.)
 * messages posted regarding this dinner
 * reviews of this dinner
 *
 */

db.dinner = {};
ref.dinner = fb.child('dinner');
ref.application = fb.child('application');
ref.message = fb.child('message');
ref.review = fb.child('review');

db.dinner.get = function (dinnerId) {
	return $q(function(resolve, reject) {
		ref.dinner.once('value', function callback (snap) {
			var data = snap.val();
			if ( data === null ) {
				reject( createError(db.error.notFound, 'Dinner not found.') );
			} else {
				resolve( data.val() );
			}
		}, function cancelCallback (error) { // permission problem
			reject( createError(db.error.unauthorized, error.message) );
		});
	});
};

db.dinner.getMessages = function (dinnerId) {

};

db.dinner.getReviews = function (dinnerId) {

};

db.dinner.createMessage = function (message) {

};


/*
 * DINNER (Host)
 *
 * new dinner (C dinner)
 * close dinner (U dinner)
 * cancel dinner (U dinner)
 * x invite user (C invitation)
 * x invite group (C invitation)
 * accept/reject application (U applicaton)
 *
 * x users that are invited
 *
 */

// create a new dinner
// fulfills with the new dinnerId, rejects with the error
// TODO: test
db.dinner.create = function (dinner) {
	dinner = _.cloneDeep(dinner); // don't modify the passed data
	return $q(function(resolve, reject) {
		checkObject(dinner, 'hostedByUser', 'title', 'description', 'tags', 'isPublic');
		// TODO: check for dineinAt or (takeawayFrom and takeawayUntil)
		dinner.createdAt = Firebase.ServerValue.TIMESTAMP;
		var dinnerRef = ref.dinner.push(dinner, function onComplete(error) {
			if (error === null) {
				resolve( dinnerRef.key() );
			} else {
				reject(error);
			}
		});
	});
};

// TODO: test
// TODO: can't close if cancelled, only possible if host of dinner
db.dinner.close = function (dinnerId) {
	return $q(function(resolve, reject) {
		var dinner = {
			// dinnerId : dinnerId,
			updatedAt : Firebase.ServerValue.TIMESTAMP,
			closedAt : Firebase.ServerValue.TIMESTAMP
		};
		ref.dinner.child(dinnerId).update(dinner, function onComplete(error) {
			if (error === null) {
				resolve();
			} else {
				reject(error);
			}
		});
	});
};

// TODO: test
// TODO: only possible if host of dinner
db.dinner.cancel = function (dinnerId) {
	return $q(function(resolve, reject) {
		var dinner = {
			// dinnerId : dinnerId,
			updatedAt : Firebase.ServerValue.TIMESTAMP,
			cancelledAt : Firebase.ServerValue.TIMESTAMP
		};
		ref.dinner.child(dinnerId).update(dinner, function onComplete(error) {
			if (error === null) {
				resolve();
			} else {
				reject(error);
			}
		});
	});
};

// TODO: test
// TODO: only possible if host of dinner
db.dinner.acceptApplication = function (applicationId) {
	return $q(function(resolve, reject) {
		var application = {
			updatedAt : Firebase.ServerValue.TIMESTAMP,
			status : 'accepted'
		};
		ref.application.child(applicationId).update(application, function onComplete(error) {
			if (error === null) {
				resolve();
			} else {
				reject(error);
			}
		});
	});
};

// TODO: test
// TODO: only possible if host of dinner
db.dinner.rejectApplication = function (applicationId) {
	return $q(function(resolve, reject) {
		var application = {
			updatedAt : Firebase.ServerValue.TIMESTAMP,
			status : 'rejected'
		};
		ref.application.child(applicationId).update(application, function onComplete(error) {
			if (error === null) {
				resolve();
			} else {
				reject(error);
			}
		});
	});
};


/*
 * DINNER (Guest)
 *
 * apply (C application)
 * x accept invitation (U invitation)
 *
 */

// TODO: test
db.dinner.createApplication = function (application) {
	application = _.cloneDeep(application); // don't modify the passed data
	return $q(function(resolve, reject) {
		checkObject(application, 'byUser', 'forDinner', 'numSpots', 'isDineIn', 'isPublic');
		// TODO: what about host property?
		// TODO: cant apply to own dinner, can't apply to closed or cancelled or past dinner.
		application.createdAt = Firebase.ServerValue.TIMESTAMP;
		application.status = 'pending';
		var applicationRef = ref.application.push(application, function onComplete(error) {
			if (error === null) {
				resolve( applicationRef.key() );
			} else {
				reject(error);
			}
		});
	});
};

db.dinner.createReview = function (review) {

};


/*
 * MESSAGE
 *
 * post message to dinner (C message)
 * post message to group (C message)
 *
 */
// db.createDinnerMessage = function (message) {
//
// };
//
// db.createGroupMessage = function (message) {
//
// };


/*
 * NOTIFICATION
 *
 * post notification (C notification)
 * mark as read (U notification)
 *
 */

db.notification = {};

db.notification.create = function (notification) {

};

db.notification.markAsRead = function (notificationId) {

};



/*
 * REVIEW
 *
 * post review (C review)
 *
 */

// db.createReview = function (review) {
//
// };


/*
 * GROUP
 *
 * create new group (C group)
 * invite user to group (U user)
 * accept/reject group invitation (U group)
 * join group (U group)
 * leave group (U group)
 * add admin (U group)
 *
 * basic info (title, description, invite only status, ...)
 * admins
 * members
 * messages regarding this group
 *
 */
// db.group = {};
//
// db.group.create = function (group) {
//
// };
//
// db.group.inviteUser = function (group) {
//
// };
//
// db.group.join = function (groupId) {
//
// };
//
// db.group.leave = function (groupId) {
//
// };
//
// db.group.get = function (group) {
//
// };
//
// db.group.getMembers = function (group) {
//
// };
//
// db.group.getAdmins = function (group) {
//
// };
//
// db.group.getMessages = function (group) {
//
// };




	return db;
}]);
