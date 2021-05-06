(function() {
  'use strict';

  angular
    .module('damSearchMdl')
    .service('DamSearchService', DamSearchService);

  /** @ngInject */
    function DamSearchService($rootScope,$timeout) {
        var vm = this;
        var _objSelected = [];
        //funzione per settare l'array degli oggetti selected
        vm.setObjSelected = function(objs){
            _objSelected = objs;
            $rootScope.$broadcast('damSearchSetObjSelected',objs,_objSelected,'set');
        };
        //funzione per acquisisre l'array degli oggetti selected
        vm.getObjSelected = function(){
            return _objSelected;
        };
        //funzione per azzerare l'array degli oggetti selected
        vm.refreshObjSelected = function(objs){
            _objSelected = [];
        };
        //funzione aggiungere un oggetto all'array degli oggetti selected
        vm.addObjSelected = function(obj,properties){
            var objPresent = false;
            for(var i=0;i<_objSelected.length;i++){
                if (_objSelected[i].media_id_i == obj.media_id_i)
                {
                    console.log("object present in selected");
                    objPresent = true;
                    break;
                }
            };
            if(!objPresent){
                _objSelected.push(obj);
                //obj.hidden = true; //da sostituire in obj.selected
            }
            $rootScope.$broadcast('damSearchSetObjSelected',obj,_objSelected,'add');
        };
        //funzione rimuovere un oggetto dall'array degli oggetti selected
        vm.removeObjSelected = function(obj,properties){
            var objToRemove = null;
            _objSelected.forEach(function(item,i){
                if (item.media_id_i == obj.media_id_i){
                    objToRemove = i;
                    //obj.hidden = false; //da sostituire in obj.selected
                    _objSelected.splice(objToRemove, 1);
                    return;
                }
            });
            $rootScope.$broadcast('damSearchSetObjSelected',obj,_objSelected,'remove');
        };
        
        var _templateOptions = {};
        vm.setTemplateOptions = function(obj,emit){
            _templateOptions = obj;
            if(emit)
                $rootScope.$broadcast('damSearchSetTemplateOptions',obj);
        };
        vm.getTemplateOptions = function(){
            return _templateOptions;
        };
        
        var _searchHistoryPrm = {};
        vm.setSearchHistoryPrm = function(prm,emit){
            _searchHistoryPrm = prm;
            if(emit)
                $rootScope.$broadcast('damSearchSetSearchHistoryPrm',obj);
        };
        vm.getSearchHistoryPrm = function(){
            return _searchHistoryPrm;
        };
        
  }
})();
