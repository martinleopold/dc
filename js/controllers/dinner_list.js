/**
 * Dinner List
 */
angular.module('dc.controllers')
.controller('DinnerListCtrl', function($scope, db, $rootScope, $state, resumeSession) {
   console.log('Controller: DinnerListCtrl');

   resumeSession($scope).then(function(){
      var hostedDinners =  db.user.getHostedDinners( $rootScope.user.userId );
      hostedDinners.then(function (dinners) {

         // past hosted dinners
         $scope.pastHostedDinners = _.filter(dinners, function(dinner){

            // time of dinner before now
            return moment(dinner.dineinAt).isBefore(moment());
         });
         console.log('past hosted: ', $scope.pastHostedDinners);


         // future hosted dinners
         $scope.futureHostedDinners = _.filter(dinners, function(dinner){

            // time of dinner after now
            return moment(dinner.dineinAt).isAfter(moment());
         });
         console.log('future hosted: ', $scope.futureHostedDinners);
      });
   });

});
