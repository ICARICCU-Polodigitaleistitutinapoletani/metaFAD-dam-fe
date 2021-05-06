(function() {
  'use strict';

  angular
    .module('popoverCustomCloseMdl')
    .directive('popoverCustomClose', function($timeout, $rootScope){
      return{
        scope: {
          excludeClass: '@'
        },
        link: function(scope, element, attrs) {
          var trigger = document.getElementsByClassName('trigger');

          function closeTrigger(i) {
            $timeout(function(){ 
                angular.element(trigger[0]).removeClass('trigger');
                $rootScope.$broadcast("setPopoverState",false);
            });
          }

          element.on('click', function(event){
            var etarget = angular.element(event.target);
            var tlength = trigger.length;
            if(!etarget.hasClass('trigger') && !etarget.hasClass(scope.excludeClass)) {
              for(var i=0; i<tlength; i++) {
                closeTrigger(i)
              }
            }
          });
        }
      };
    }).directive('popoverElem', function(){
      return{
        link: function(scope, element, attrs) {
          element.on('click', function(){
            element.addClass('trigger');
          });
        }
      };
    });
})();
