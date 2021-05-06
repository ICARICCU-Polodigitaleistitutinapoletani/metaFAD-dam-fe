(function() {
    'use strict';
    /**
      *  @ngdoc function
      *  @name damApp.controller:LoginCtrl
      *  @description
      *  # LoginCtrl
      *  Controller of the damApp
      */
    angular
        .module('damApp')
        .controller('LoginCtrl', LoginCtrl);

    /** @ngInject */
    function LoginCtrl($scope, $state, $timeout, MainService, LoginService) {
        var vm = this;
        function render() {
            $timeout(function(){
                if (!MainService.needsLogin) {
                    var activeState = MainService.setState && MainService.getActiveState() || 'main.list';
                    activeState = activeState.indexOf('main.login') < 0 ? activeState : 'main.list';
                    var objState = activeState.split("|");
                    var params = objState && objState[1] ? JSON.parse(objState[1]) : undefined;
                    $scope.$emit('callRouter', activeState, params);
                }
            }, 42);
        };

        render();
        
        $scope.$on('loginDone', function() {
            MainService.needsLogin = false;
            $scope.$emit('callRouter', LoginService.redirectState, LoginService.redirectParams);
            LoginService.redirectState = '';
        });

        $scope.$on('$destroy', function() {
            
        });
    }
})();
