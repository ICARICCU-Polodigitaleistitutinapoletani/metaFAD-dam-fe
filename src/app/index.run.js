(function() {
    'use strict';

    angular
        .module('damApp')
        .run(runBlock);

    /** @ngInject */
    function runBlock($log,$rootScope,$state,MainService) {
        $log.debug('runBlock end');
        $rootScope.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error){
            if(error === "App Not initialized"){
                $state.go("main");
            }
        });
        $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams, error){
            MainService.previousState = fromState.name;
            $rootScope.$broadcast("app:activeState",toState.name);
        });
    }

})();
