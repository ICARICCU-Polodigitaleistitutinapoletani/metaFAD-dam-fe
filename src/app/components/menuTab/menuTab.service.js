(function() {
  'use strict';

  angular
    .module('menuTabMdl')
    .service('MenuTabService', MenuTabService);

  /** @ngInject */
    function MenuTabService($rootScope) {
        var vm = this;
        var _mainActiveTab = 0;
        var _view = true;
        vm.setMainActiveTab = function(mainActiveTab){
            _mainActiveTab = mainActiveTab;
            $rootScope.$broadcast('setMainActiveTab',_mainActiveTab);
        };
        vm.getMainActiveTab = function(){
            return _mainActiveTab;
        };
        vm.setView = function(view,emit){
            _view = view;
            if(emit)
                $rootScope.$broadcast('manageViewMenuTab',_view);
        };
        vm.getView = function(){
            return _view;
        };
  }
})();
