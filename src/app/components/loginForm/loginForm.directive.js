(function () {
    'use strict';

    angular
        .module('loginFormMdl')
        .directive('loginForm', loginForm);

    /** @ngInject */
    function loginForm() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/loginForm/loginForm.html',
            scope: {},
            controller: loginFormController,
            controllerAs: 'loginForm',
            bindToController: true
        };
        return directive;
    }

    /** @ngInject */
    function loginFormController($scope) {
        var vm = this;
        vm.passwordVisible = false;
        vm.loginData = {
            username: '',
            password: ''
        };

        var render = function () {
            console.log('TEST', $scope);
        };

        vm.togglePasswordVisibility = function() {
            this.passwordVisible = !this.passwordVisible;
        };

        vm.submit = function (form) {
            // TODO: Submit form
            console.log('TODO: submit Form', this.form, this.loginData);
            $scope.$emit('loginDone');
        };

        $scope.$on("$destroy", function () {

        });

        $scope.$emit("loginFormReady", "loginForm");

        render();
    }
})();
