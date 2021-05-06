(function() {
  'use strict';

  angular
    .module('damActionBatchMdl')
    .service('DamActionBatchService', DamActionBatchService);

  /** @ngInject */
    function DamActionBatchService($rootScope) {
        var vm = this;
        var _objList = [];
        var _objSearch = null;
        vm.refresh = function(){
            _objList = [];
            _objSearch = null;
        };
        vm.setObjList = function(objs,emit){
            _objList = objs;
            if(emit)
                $rootScope.$broadcast('damActionBatchSetObjList',_objList);
        };
        vm.addObjList = function(obj,emit){
            _objList.push(obj);
            if(emit)
                $rootScope.$broadcast('damActionBatchAddObjList',obj,_objList);
        };
        vm.removeObjList = function(obj,emit){
            var exist = _.findIndex(_objList, obj);
            if(exist===-1) {
                return $log.info("obj not exist in _objList");
            }
            else{
                _objList.splice(exist,1);
            }
            if(emit)
                $rootScope.$broadcast('damActionBatchRemoveObjList',obj,_objList);
        };
        vm.getObjList = function(){
            return _objList;
        };
        vm.setObjSearch = function(objs,emit){
            _objSearch = objs;
            if(emit)
                $rootScope.$broadcast('damActionBatchSetObjSearch',_objSearch);
        };
        vm.getObjSearch = function(){
            return _objSearch;
        };
  }
})();
