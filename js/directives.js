angular.module('dc.directives', [])

.directive('map', function() {
   /* global google */
   return {
      restrict: 'E',
      scope: {
         onCreate: '&'
      },
      link: function($scope, $element) {
         function initialize() {
            var mapOptions = {
               center: new google.maps.LatLng(48.2085, 16.373),
               zoom: 16,
               mapTypeId: google.maps.MapTypeId.ROADMAP,
               streetViewControl: false
            };
            var map = new google.maps.Map($element[0], mapOptions);

            $scope.onCreate({
               map: map
            });

            // Stop the side bar from dragging when mousedown/tapdown on the map
            google.maps.event.addDomListener($element[0], 'mousedown', function(e) {
               e.preventDefault();
               return false;
            });
         }

         if (document.readyState === "complete") {
            initialize();
         } else {
            google.maps.event.addDomListener(window, 'load', initialize);
         }
      }
   };
})

// whenever the given expression is truthy show animated pending dots appended to the element
.directive('pendingDots', function() {
   return {
      restrict: 'EA',
      link: function(scope, element, attr) {
         var dot = '.',
         className = 'pending-dots',
         showClassName = 'show-pending-dots',
         html = '<span class="' + className + '"><span class="dot-1">' + dot + '</span><span class="dot-2">' + dot + '</span><span class="dot-3">' + dot + '</span></span>';
         element.append(html);
         scope.$watch(attr.pendingDots, function(newVal) {
            if (newVal) element.addClass(showClassName);
            else element.removeClass(showClassName);
         });
      }
   };
});
