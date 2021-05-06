(function() {
  'use strict';
  angular
    .module('fallbackImgMdl')
    .directive('fallbackImg', function () {
    var fallbackImg = {
      link: function postLink(scope, iElement, iAttrs) {
        iElement.bind('error', function() {
          angular.element(this).attr("src", iAttrs.fallbackImg);
        });
      }
     }
     return fallbackImg;
  });
})();
