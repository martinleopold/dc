angular.module('dc.db.user', ['dc.db.base'])

.factory('dbUser', ['dbBase', '$q', function(dbBase, $q) {
   var db = dbBase;
   var fb = db.ref.root;
   var ref = db.ref;
   var checkObject = db.util.checkObject;

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
   var user = {};

   /*
      create a user record
      user needs to have userId (obtained from auth.createUser and auth.login)
      other fields are optional, the ones that are present are updated
    */
   user.create = function (user) {
      user = _.cloneDeep(user); // don't modify the passed data
      return $q(function (resolve, reject) {
         checkObject(user, 'userId', 'firstName', 'lastName', 'email');
         user.createdAt = Firebase.ServerValue.TIMESTAMP;
         user.credits = 0;
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
   user.update = function (user) {
      user = _.cloneDeep(user); // don't modify the passed data

      return $q(function (resolve, reject) {
         checkObject(user, 'userId');
         user.updatedAt = Firebase.ServerValue.TIMESTAMP;
         ref.user.child(user.userId).update(user, function onComplete(error) {
            if (error === null) resolve();
            else reject(error);
         });
      });
   };

   user.updateSettings = function (userId, settings) {
      return db.query.update( ref.user.child(userId).child('settings'), settings );
   };

   user.createImage = function () {

   };

   user.deleteImage = function () {

   };

   user.reorderImage = function () {

   };

   user.getFriends = function (userId) {
      return db.query.get( ref.user.child(userId).child('friends') );
   };

   // user data incl. settings and pics
   user.get = function (userId) {
      return db.query.get( ref.user.child(userId) );
   };

   user.getNotifications = function (userId) {
      return db.query.get(
         ref.notification.orderByChild('forUser').equalTo(userId)
      );
   };

   return user;
}]);
