(function () {
    'use strict';

    angular
        .module('listItemsMdl')
        .service('ListItemsService', ListItemsService);

    /** @ngInject */
    function ListItemsService($rootScope, $timeout, $log) {
        var vm = this;
        var _objSelected = [];
        vm.refresh = function () {
            _objSelected = [];
            _objList = [];
        };
        //funzione per settare l'array degli oggetti selected
        vm.setObjSelected = function (objs) {
            _objSelected = objs;
            $rootScope.$broadcast('listItemsSetObjSelected', objs, _objSelected, 'set');
        };
        //funzione per acquisisre l'array degli oggetti selected
        vm.getObjSelected = function () {
            return _objSelected;
        };
        //funzione per azzerare l'array degli oggetti selected
        vm.refreshObjSelected = function () {
            _objSelected = [];
        };
        //funzione per ripulire gli oggetti selezionati nel controller
        vm.clearObjSelectedInController = function () {
            $rootScope.$broadcast('listItemsClearObjSelectedInController', null, _objSelected);
        };
        //funzione aggiungere un oggetto all'array degli oggetti selected
        vm.addObjSelected = function (obj, emit) {
            var exist = _.findIndex(_objSelected, obj);
            if (exist !== -1) {
                obj.selected = true;
                return $log.info("obj exist in _objSelected");
            }
            else {
                _objSelected.push(obj);
                obj.selected = true;
                //obj.hidden = true; //da sostituire in obj.selected
            }
            if (emit)
                $rootScope.$broadcast('listItemsSetObjSelected', obj, _objSelected, 'add');
        };
        //funzione rimuovere un oggetto dall'array degli oggetti selected
        vm.removeObjSelected = function (obj) {
            var exist = _.findIndex(_objSelected, obj);
            if (exist === -1) {
                obj.selected = false;
                return $log.info("obj not exist in _objSelected");
            }
            else {
                _objSelected.splice(exist, 1);
                delete obj.selected;
            }
            $rootScope.$broadcast('listItemsSetObjSelected', obj, _objSelected, 'remove');
        };
        //funzione rimuovere un oggetto dall'array degli oggetti selected
        vm.removeObjSelectedWithEvent = function (obj, emit) {
            var exist = _.findIndex(_objSelected, obj);
            if (exist === -1) {
                obj.selected = false;
                return $log.info("obj not exist in _objSelected");
            }
            else {
                _objSelected.splice(exist, 1);
                delete obj.selected;
            }
            if (emit)
                $rootScope.$broadcast('listItemsSetObjSelected', obj, _objSelected, 'remove');
        };
        var _objList = [];
        vm.setObjList = function (objs) {
            _objList = objs;
            $rootScope.$broadcast('listItemsSetObjList', _objList);
        };
        vm.getObjList = function () {
            return _objList;
        };

        vm.searchSimilarImages = function (id) {
            $rootScope.$broadcast('damSearchTriggerSearchSimilar', id);
        };

        vm.getSelectedNum = function() {
            return _objSelected.length;
        };

        vm.getSelectedSize = function() {
            var size = 0;
            _.forEach(_objSelected, function(obj) {
                size += obj.size ? obj.size : 0;
            });
            return size;
        };
    }
})();
