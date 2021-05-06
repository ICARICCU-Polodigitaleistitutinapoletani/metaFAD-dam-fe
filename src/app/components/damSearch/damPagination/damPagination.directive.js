(function() {
  'use strict';

  angular
    .module('damPaginationMdl')
    .directive('damPagination', damPagination);

  /** @ngInject */
    function damPagination() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/damSearch/damPagination/damPagination.html',
            scope: {},
            controller: damPaginationController,
            controllerAs: 'damPagination',
            bindToController: true
        };
        return directive;
    };
    
    /** @ngInject */
    function damPaginationController($scope,$rootScope,DamPaginationService){
        var vm=this;
        var render = function(){
        };
        vm.show = false;
        vm.currentPage = null;
        var setCurrentPage = $rootScope.$on("damPaginationSetCurrentPage",function(event,page){
            vm.currentPage = page; 
        });
        vm.totPage = null;
        var setTotPage = $rootScope.$on("damPaginationSetTotPage",function(event,page){
            vm.totPage = page; 
        });
        vm.setPage = function(page){
            vm.currentPage = page;
            DamPaginationService.setCurrentPage(page);
            DamPaginationService.setSearchPage(page);
            $rootScope.$broadcast('damSearchTriggerRequestSearch'); 
        };
        var initPagination = $rootScope.$on("damPaginationInitPagination",function(event,page,pages){
            DamPaginationService.setSearchPage(1);
            vm.currentPage = page; 
            vm.totPage = pages;
            vm.show = vm.currentPage && vm.totPage;
        });
        var damPaginationView = $rootScope.$on("damPaginationView",function(event,view){
            vm.show = view;
        });
        render();
        $scope.$on("$destroy",function(){
            setCurrentPage();
            setTotPage();
            initPagination();
            damPaginationView();
            DamPaginationService.refresh();
        });
    };
    
})();