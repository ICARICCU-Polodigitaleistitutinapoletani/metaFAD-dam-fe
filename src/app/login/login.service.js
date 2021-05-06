(function () {
    'use strict';

    angular
        .module('damApp')
        .service('LoginService', LoginService);

    /** @ngInject */
    function LoginService($rootScope, $state, $timeout) {
        var vm = this;
        vm.redirectState = '';
        vm.redirectParams;

        vm.setRedirectState = function(state) {
            if (this.redirectState === '') {
                this.redirectState = state === 'main.login' ? 'main' : state;
            }
        }

        vm.setRedirectParams = function(params) {
            this.redirectParams = params;
        }
    }
})();
