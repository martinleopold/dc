angular.module('dc.db', [])

.factory('db', function($q) {
	var fb = new Firebase("https://dinner-collective.firebaseio.com/");
	var db = {};

	/**
	 * Sign up a user
	 * @param  {Object} credentials  - { firstname, lastname, email, password, passwordCheck }
	 * @return {Q} - userDdata on success, error on failure
	 */
	db.signup = function(credentials) {
		var d = $q.defer();
		fb.createUser(credentials, function(error) {
			if (error === null) {
				fb.authWithPassword(credentials, function(error, auth) {
					if (error === null) {
						var user = fb.child('user').child(auth.uid),
						userData = {
							uid: auth.uid, 
							firstname: credentials.firstname, 
							lastname: credentials.lastname, 
							email: credentials.email
						};
						user.set(userData, function(error) {
							if (error === null) d.resolve(userData);
							else d.reject(error);
						});
					} else d.reject(error);
				});
			}
			else d.reject(error);
		});
		return d.promise;
	};

	/**
	 * Log in a user
	 * @param  {Object} credentials - { firstname, lastname, email, password, passwordCheck }
	 * @return {Q} - userData on success, error on failure
	 */
	db.login = function(credentials) {
		var d = $q.defer();
		fb.authWithPassword(credentials, function(error, authData) {
			if (error === null) d.resolve(authData.uid);
			else d.reject(error);
		});
		return d.promise.then(db.getUserData);
	};

	/**
	 * Get user data
	 * @param  {string} uid - unique user id
	 * @return {Q} - userData on success, error on failure
	 */
	db.getUserData = function(uid) {
		var d = $q.defer();
		var user = fb.child('user').child(uid);
		user.once('value', function(data) {
			d.resolve(data.val());
		}, function(error) {
			d.reject(error);
		});
		return d.promise;
	};


	db.updateUserData = function(userData) {
		var user = fb.child('user').child(userData.uid);
		var d = $q.defer();
		user.update(userData, function onComplete(error) {
			if (error === null) d.resolve();
			else d.reject(error);
		});
		return d.promise;
	};


	db.newDinner = function(dinner) {
		var dinners = fb.child('dinner');
		var d = $q.defer();
		dinners.push(dinner, function onComplete(error) {
			if (error === null) d.resolve();
			else d.reject(error);
		});
		return d.promise;
	};

	return db;
});