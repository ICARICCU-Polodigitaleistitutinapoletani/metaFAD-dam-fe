(function() {
  'use strict';

  angular
    .module('damPaginationMdl')
    .service('DamPaginationService', DamPaginationService);

  /** @ngInject */
    function DamPaginationService($rootScope) {
        var vm = this;
        var _currentPage = null;
        vm.refresh = function(){
            _currentPage = null; 
            _totPage = null;
            _searchPage = 1;
        };
        vm.setCurrentPage = function(page){
            _currentPage = page;
            $rootScope.$broadcast('damPaginationSetCurrentPage',_currentPage);
        };
        vm.getCurrentPage = function(){
            return _currentPage; 
        };
        var _totPage = null;
        vm.setTotPage = function(page){
            _totPage = page;
            $rootScope.$broadcast('damPaginationSetTotPage',_totPage);
        };
        vm.getTotPage = function(){
            return _totPage; 
        };
        var _searchPage = 1;
        vm.setSearchPage = function(page){
            _searchPage = page;
            $rootScope.$broadcast('damPaginationSetSearchPage',_searchPage);
        };
        vm.getSearchPage = function(){
            return _searchPage; 
        };
        vm.initPagination = function(page,pages){
            _currentPage = page;
            _totPage = pages;
            $rootScope.$broadcast('damPaginationInitPagination',_currentPage,_totPage);
        };
  }
})();
