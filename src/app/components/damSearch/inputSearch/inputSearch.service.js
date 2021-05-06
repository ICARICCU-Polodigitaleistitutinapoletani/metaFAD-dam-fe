(function() {
  'use strict';

  angular
    .module('inputSearchMdl')
    .service('InputSearchService', InputSearchService);

  /** @ngInject */
    function InputSearchService($rootScope) {
        var vm = this;
        var _filtersApplied = [];
        vm.refresh = function(){
            _filtersApplied = [];
            _queryApplied = null;
        };
        vm.setFiltersApplied = function(objs,hidden){
            _filtersApplied = objs;
            if(!hidden)
                $rootScope.$broadcast('inputSearchSetFiltersApplied',_filtersApplied);
        };
        vm.addFiltersApplied = function(obj){
            _filtersApplied.push(obj);
            $rootScope.$broadcast('inputSearchAddFiltersApplied',obj);
        };
        vm.removeFiltersApplied = function(index){
            _filtersApplied.splice(index,1);
            $rootScope.$broadcast('inputSearchRemoveFiltersApplied',index);
        };
        vm.getFiltersApplied = function(){
            return _filtersApplied;
        };
        var _queryApplied = null;
        vm.setQueryApplied = function(query){
            _queryApplied = query;
        };
        vm.getQueryApplied = function(){
            return _queryApplied;
        };
  }
})();
