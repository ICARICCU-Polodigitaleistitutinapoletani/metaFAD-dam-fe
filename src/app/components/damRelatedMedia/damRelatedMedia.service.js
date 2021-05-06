(function() {
  'use strict';

  angular
    .module('damRelatedMediaMdl')
    .service('DamRelatedMediaService', DamRelatedMediaService);

  /** @ngInject */
    function DamRelatedMediaService($rootScope,$timeout,$log) {
        var vm = this;
        var _objList = [];
        vm.refresh = function(){
            _objList = [];
        };
        vm.setObjList = function(objs,emit){
            _objList = objs;
            if(emit)
                $rootScope.$broadcast('damRelatedMediaSetObjList',_objList);
        };
        vm.addObjList = function(obj,emit){
            _objList.push(obj);
            if(emit)
                $rootScope.$broadcast('damRelatedMediaAddObjList',obj,_objList);
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
                $rootScope.$broadcast('damRelatedMediaRemoveObjList',obj,_objList);
        };
        vm.getObjList = function(){
            return _objList;
        };
        var _objMoveList = [];
        vm.setObjMoveList = function(objs,emit){
            _objMoveList = objs;
            if(emit)
                $rootScope.$broadcast('damRelatedMediaSetObjMoveList',_objMoveList);
        };
        vm.getObjMoveList = function(){
            return _objMoveList;
        };
  }
})();
