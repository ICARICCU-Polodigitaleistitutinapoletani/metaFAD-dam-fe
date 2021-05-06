(function() {
  'use strict';

  angular
    .module('menuTabMdl')
    .directive('menuTab', menuTab);

  /** @ngInject */
    function menuTab() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/menuTab/menuTab.html',
            scope: {},
            controller: menuTabController,
            controllerAs: 'menuTab',
            bindToController: true
        };
        return directive;
    }

    /** @ngInject */
    function menuTabController($scope, $rootScope, MenuTabService, MainService) {
        // inizializzo una variabile che referenzia il modulo
        var vm = this;
        var render = function(){
            //inizializzo la variabile che gestisce la tab attiva
            MenuTabService.setMainActiveTab(0);
        }
        vm.cms = MainService.cms;
        vm.tabNoVisible = {
            "search": MainService.disabledFeatures && MainService.disabledFeatures.indexOf("search") !== -1,
            "addmedia": MainService.disabledFeatures && MainService.disabledFeatures.indexOf("addmedia") !== -1,
            "container": MainService.disabledFeatures && MainService.disabledFeatures.indexOf("container") !== -1,
            "collection": MainService.disabledFeatures && MainService.disabledFeatures.indexOf("collections") !== -1,
            "folder": MainService.disabledFeatures && MainService.disabledFeatures.indexOf("folders") !== -1,
        };
        //ascolto il servizio che ha il compito di settare la tab attiva
        var checkMainActiveTab = $rootScope.$on('setMainActiveTab', function(event,tab){
            vm.mainActiveTab = tab;
        });
        //funzione che emette l'evento callRouter passandogli stato e parametri. Questo evento sarà ascoltato dal main controller che scatenerà il cambiamento di stato
        vm.goToRouter = function(activeTab,state,params){
            vm.mainActiveTab = activeTab;
            $scope.$emit('callRouter',state,params);
        };
        vm.viewMenuTab = MenuTabService.getView();
        vm.manageViewMenuTab = $scope.$on("manageViewMenuTab",function(event,view){
            vm.viewMenuTab = view;
        });
        $scope.$on('$destroy', function() {
            checkMainActiveTab();
            vm.manageViewMenuTab();
        });
        render();
    }
})();
