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
 * generic firebase query functions
 * using angular promises
 */
db.query = {};

db.query.set = function set (ref, data) {
	return $q(function resolver (resolve, reject) {
		ref.set(data, function onComplete (error) {
			if (error === null) {
				resolve();
			} else {
				reject(error);
			}
		});
	});
};

db.query.push = function push (ref, data) {
	return $q(function resolver (resolve, reject) {
		var newRef = ref.push(data, function onComplete (error) {
			if (error === null) {
				resolve(newRef.key());
			} else {
				reject(error);
			}
		});
	});
};

db.query.update = function update (ref, data) {
	return $q(function resolver (resolve, reject) {
		ref.update(data, function onComplete (error) {
			if (error === null) {
				resolve();
			} else {
				reject(error);
			}
		});
	});
};

db.query.get = function get (ref) {
	return $q(function resolver (resolve, reject) {
		ref.once('value', function callback (dataSnapshot) {
			var data = dataSnapshot.val();
			if (data === null) {
				reject( createError(db.error.notFound, 'db.query.get: no data.') );
			} else {
				resolve(data);
			}
		}, function cancelCallback (error) {
			reject( createError(db.error.unauthorized, error.message) );
		});
	});
};

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
ref.notification = fb.child('notification');
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

db.user.updateSettings = function (userId, settings) {
	return db.query.update( ref.user.child(userId).child('settings'), settings );
};

db.user.createImage = function () {

};

db.user.deleteImage = function () {

};

db.user.reorderImage = function () {

};

db.user.getFriends = function (userId) {
	return db.query.get( ref.user.child(userId).child('friends') );
};

// user data incl. settings and pics
db.user.get = function (userId) {
	return db.query.get( ref.user.child(userId) );
};

db.user.getNotifications = function (userId) {
	return db.query.get( ref.notification.orderByChild('forUser').equals(userId) );
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
	var friendRequest = {
		createdAt : Firebase.ServerValue.TIMESTAMP,
		byUser : byUser,
		toUser : toUser,
		status : 'pending'
	};
	return db.query.push( ref.friendRequest, friendRequest );
};

// TODO: test
// TODO: only if toUser is sending the request
db.friendRequest.accept = function (friendRequestId) {
	var friendRequest = {
		updatedAt : Firebase.ServerValue.TIMESTAMP,
		status : 'accepted'
	};
	return db.query.update(
		ref.friendRequest.child(friendRequestId),
		friendRequest
	);
};

// TODO: test
// TODO: only if toUser is sending the request
db.friendRequest.reject = function (friendRequestId) {
	var friendRequest = {
		updatedAt : Firebase.ServerValue.TIMESTAMP,
		status : 'rejected'
	};
	return db.query.update(
		ref.friendRequest.child(friendRequestId),
		friendRequest
	);
};

// TODO: test
// TODO: only if userId is sending the request
db.friendRequest.getIncoming = function (userId) {
	return db.query.get(
		ref.friendRequest.orderByChild('toUser').equalTo(userId)
	);
};

// TODO: test
// TODO: only if userId is sending the request
db.friendRequest.getOutgoing = function (userId) {
	return db.query.get(
		ref.friendRequest.orderByChild('fromUser').equalTo(userId)
	);
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
	return db.query.get(
		ref.dinner.orderByKey().equalTo(dinnerId)
	);
};

db.dinner.getMessages = function (dinnerId) {
	return db.query.get( ref.message.orderByChild('toDinner').equals(dinnerId) );
};

db.dinner.getReviews = function (dinnerId) {
	return db.query.get( ref.review.orderByChild('aboutDinner').equals(dinnerId) );
};

db.dinner.createMessage = function (message) {
	return $q(function resolver (resolve, reject) {
		message = _.cloneDeep(message);
		checkObject(message, createdAt, byUser, text);
		message.createdAt = Firebase.ServerValue.TIMESTAMP;
		// TODO: either toDinner or toGroup needs to be set.
		resolve( db.query.create(ref.message.push(message)) );
	});
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
	return $q(function resolver (resolve, reject) {
		dinner = _.cloneDeep(dinner); // don't modify the passed data
		checkObject(dinner, 'hostedByUser', 'title', 'description', 'tags', 'isPublic'); // can throw and thus reject this promise
		// TODO: check for dineinAt or (takeawayFrom and takeawayUntil)
		dinner.createdAt = Firebase.ServerValue.TIMESTAMP;
		resolve( db.query.push(ref.dinner, dinner) );
	});
};

// TODO: test
// TODO: can't close if cancelled, only possible if host of dinner
db.dinner.close = function (dinnerId) {
	var dinner = {
		// dinnerId : dinnerId,
		updatedAt : Firebase.ServerValue.TIMESTAMP,
		closedAt : Firebase.ServerValue.TIMESTAMP
	};
	return db.query.update( ref.dinner.child(dinnerId), dinner );
};

// TODO: test
// TODO: only possible if host of dinner
db.dinner.cancel = function (dinnerId) {
	var dinner = {
		// dinnerId : dinnerId,
		updatedAt : Firebase.ServerValue.TIMESTAMP,
		cancelledAt : Firebase.ServerValue.TIMESTAMP
	};
	return db.query.update( ref.dinner.child(dinnerId), dinner );
};

// TODO: test
// TODO: only possible if host of dinner
db.dinner.acceptApplication = function (applicationId) {
	var application = {
		updatedAt : Firebase.ServerValue.TIMESTAMP,
		status : 'accepted'
	};
	return db.query.update( ref.application.child(applicationId), application );
};

// TODO: test
// TODO: only possible if host of dinner
db.dinner.rejectApplication = function (applicationId) {
	var application = {
		updatedAt : Firebase.ServerValue.TIMESTAMP,
		status : 'rejected'
	};
	return db.query.update( ref.application.child(applicationId), application );
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
	return $q(function(resolve, reject) {
		application = _.cloneDeep(application); // don't modify the passed data
		checkObject(application, 'byUser', 'forDinner', 'numSpots', 'isDineIn', 'isPublic');
		// TODO: what about host property?
		// TODO: cant apply to own dinner, can't apply to closed or cancelled or past dinner.
		application.createdAt = Firebase.ServerValue.TIMESTAMP;
		application.status = 'pending';
		resolve(
			db.query.push(ref.application, application)
		);
	});
};

db.dinner.createReview = function (review) {
	return $q(function resolver (resolve, reject) {
		review = _.cloneDeep(review);
		checkObject(review, byUser, text, aboutDinner, aboutUser);
		review.createdAt = Firebase.ServerValue.TIMESTAMP;
		// TODO: either toDinner or toGroup needs to be set.
		resolve( db.query.push(ref.review, review) );
	});
};

db.dinner.createMessage = function (message) {
	return $q(function resolver (resolve, reject) {
		message = _.cloneDeep(message);
		checkObject(message, byUser, text, toDinner);
		message.createdAt = Firebase.ServerValue.TIMESTAMP;
		delete message.toGroup;
		resolve( db.query.push(ref.message, message) );
	});
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
	return function resolver (resolve, reject) {
		notification = _.cloneDeep(notification);
		checkObject( notification, forUser, type, text, aboutUser );
	 	notification = Firebase.ServerValue.TIMESTAMP;
		// TODO: either toDinner or toGroup needs to be set.
		resolve( db.query.create(ref.notification.push(message)) );
	}
};

db.notification.markAsRead = function (notificationId) {
	return function resolver (resolve, reject) {
		var notification = {
			openedAt : Firebase.ServerValue.TIMESTAMP
		}
		resolve( db.query.update(notificationId, notification) );
	}
};



/*
 * REVIEW
 *
 * post review (C review)
 *
 */

db.createReview = function (review) {
	return function resolver (resolve, reject) {
		checkObject(review, byUser, text);
		// TODO: either aboutDinner or aboutUser needs to be set.
		resolve( db.query.push(ref.review, review) );
	}
};


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
