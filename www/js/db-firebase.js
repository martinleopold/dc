angular.module('dc.db', [])

.factory('db', function($q) {
	var fb = new Firebase("https://dinner-collective.firebaseio.com/");
	var db = {};

	/*
		credentials : { firstname, lastname, email, password, passwordCheck }
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
							if (error === null) d.resolve(auth);
							else d.reject(error);
						});
					} else d.reject(error);
				});
			}
			else d.reject(error);
		});
		return d.promise;
	};

	db.login = function(userCredentials) {
		var d = $q.defer();
		fb.authWithPassword(userCredentials, function(error, authData) {
			if (error === null) d.resolve(authData);
			else d.reject(error);
		});
		return d.promise;
	};

	return db;
});