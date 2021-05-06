(function() {
    'use strict';

    angular
        .module('damApp')
        .config(config);

    /** @ngInject */
    function config(cfpLoadingBarProvider,ScrollBarsProvider,damFeedbackConfigProvider,mrFeedbackConfigProvider,$provide, ngToastProvider) {
        $provide.decorator('$state', function($delegate, $rootScope) {
            $rootScope.$on('$stateChangeStart', function(event, state, params) {
                $delegate.next = state;
                $delegate.toParams = params;
            });
            return $delegate;
        });
        cfpLoadingBarProvider.spinnerTemplate = '<div class="loading-bar-custom-msg">Attendi...<br/><i class="fa fa-spinner fa-pulse"></i></div>';
        ScrollBarsProvider.defaults = {
            scrollButtons: {
                scrollAmount: 'auto', // scroll amount when button pressed
                enable: false // enable scrolling buttons by default
            },
            axis: 'y',
            theme: 'dark',
            autoHideScrollbar: true,
            advanced:{
                updateOnContentResize: true
            },
            scrollbarPosition:"outside",
            scrollInertia: 0
        };
        mrFeedbackConfigProvider.defaultAnimation = "zoom"; 
        mrFeedbackConfigProvider.defaultTheme = "facebook";
        mrFeedbackConfigProvider.defaultCloseText = "Chiudi";

        ngToastProvider.configure({
            verticalPosition: 'bottom',
            newestOnTop: false
        });
    }
})();
