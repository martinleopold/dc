angular.module('dc.db', ['firebase'])

.value( 'fb', new Firebase("https://dinner-collective.firebaseio.com/") ) // define firebase ref as value service so it can be overridden easily

.factory('db', ['$rootScope', '$q', '$firebase', 'fb' , function($rootScope, $q, $firebase, fb) {

	var db = {}; // the db interface to be exported (as 'db')

	/**
	 * Get current firebase URL. Used for testing.
	 * @return {String} - URL of the firebase reference currently in use.
	 */
	db.getRefURL = function() {
		return fb.toString();
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
 * SESSION
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


/**
 * Create a new user
 * @param {Object} user
 * email, password
 * @return {Promise} - nothing on success. Error message on error.
 */
db.createUser = function (credentials) {
	return $q(function resolver (resolve, reject) {
		fb.createUser(credentials, function onComplete (error) {
			if (error === null) {
				resolve();
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
db.loginUser = function(credentials) {
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

db.logoutUser = function() {
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
db.getCurrentSession = function () {
	return $q(function resolver (resolve, reject) {
		var session = fb.getAuth(); // sync
		if (session === null) {
			reject();
		} else {
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
 * send friend request (U)
 * accept friend request (U)
 *
 *
 * user data incl. settings
 * gallery pictures
 * dinners hosted by this user
 * dinners the user applied to/was accepted to/was rejected from (mutually excl.)
 * dinners invited to
 * friends of this user
 * friend requests received
 * groups with member status
 * groups with admin status
 * notifications received
 * reviews of dinners hosted by this user
 *
 */




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
 * basic info (title, description, address, time, ...)
 * users that applied/were accepted/were rejected (mutally excl.)
 * x users that are invited
 * messages posted regarding this dinner
 * reviews of this dinner
 *
 */


/*
 * DINNER (Guest)
 *
 * apply (C application)
 * accept invitation (U invitation)
 *
 */


/*
 * MESSAGE
 *
 * post message to dinner (C message)
 * post message to group (C message)
 *
 */


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


/*
 * NOTIFICATION
 *
 * post notification (C notification)
 * mark as read (U notification)
 *
 */


/*
 * REVIEW
 *
 * post review (C review)
 *
 */


	return db;
}]);
