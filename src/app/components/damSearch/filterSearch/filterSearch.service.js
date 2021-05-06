(function() {
  'use strict';

  angular
    .module('filterSearchMdl')
    .service('FilterSearchService', FilterSearchService);

  /** @ngInject */
    function FilterSearchService($rootScope,$log) {
        var vm = this;
        var _filters = [];
        var _enableRefresh = true;
        vm.manageEnableRefresh = function(state){
            _enableRefresh = state;
        };
        vm.refresh = function(){
            if(!_enableRefresh)
                return;
            _filters = [];
            _filtersApplied = [];
        };
        vm.setFilters = function(objs){
            _filters = objs;
            $rootScope.$broadcast('filterSearchSetFilters',_filters);
        };
        var _filtersApplied = [];
        vm.setFiltersApplied = function(objs){
            _filtersApplied = objs;
            $rootScope.$broadcast('filterSearchSetFiltersApplied',_filtersApplied);
        };
        vm.addFiltersApplied = function(obj){
            var exist = _.findIndex(_filtersApplied, obj);
            if(exist!==-1)
                return $log.info("obj exist in _filtersApplied");
            _filtersApplied.push(obj);
            $rootScope.$broadcast('filterSearchAddFiltersApplied',obj);
        };
        vm.removeFiltersApplied = function(obj){
            var obj = _filtersApplied.indexOf(obj);
            _filtersApplied.splice(obj,1);
            $rootScope.$broadcast('filterSearchRemoveFiltersApplied',obj);
        };
        vm.getFiltersApplied = function(){
            return _filtersApplied;
        };
        var _filtersORApplied = [];
        vm.setFiltersORApplied = function(objs){
            _filtersORApplied = objs;
            $rootScope.$broadcast('filterSearchSetFiltersORApplied',_filtersORApplied);
        };
        vm.addFiltersORApplied = function(obj){
            var exist = _.findIndex(_filtersORApplied, obj);
            if(exist!==-1)
                return $log.info("obj exist in _filtersORApplied");
            _filtersORApplied.push(obj);
            $rootScope.$broadcast('filterSearchAddFiltersORApplied',obj);
        };
        vm.removeFiltersORApplied = function(obj){
            var obj = _filtersORApplied.indexOf(obj);
            _filtersORApplied.splice(obj,1);
            $rootScope.$broadcast('filterSearchRemoveFiltersORApplied',obj);
        };
        vm.getFiltersORApplied = function(){
            return _filtersORApplied;
        };
        vm.setCollectionFolderTree = function(instance,objs){
            $rootScope.$broadcast('filterSearchSetCollectionFolderTree',instance,objs);
        };
  }
})();
