(function () {
    'use strict';
    angular
        .module('damVideoPlayerMdl')
        .directive('damVideoPlayer', function ($window) {
            return {
                restrict: 'A',
                scope: {
                    currentTime: "=currentTime",
                    timeToSet: "=timeToSet"
                },
                controller: function ($scope, $element) {
                    $scope.onTimeUpdate = function () {
                        $scope.currentTime = $element[0].currentTime;
                        $scope.$apply();
                    }
                },
                link: function (scope, element) {
                    scope.$watch('timeToSet', function (newVar) {
                        element[0].currentTime = newVar;
                    });
                    element.bind('timeupdate', scope.onTimeUpdate);
                }
            }

        });
})();
