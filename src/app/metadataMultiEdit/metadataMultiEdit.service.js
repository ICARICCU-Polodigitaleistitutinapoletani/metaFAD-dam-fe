(function () {
    'use strict';

    angular
        .module('damApp')
        .service('MetadataMultiEditService', MetadataMultiEditService);

    /** @ngInject */
    function MetadataMultiEditService(metadataMultiEditFactory) {
        var vm = this;
        vm.selectedMedias = [];
        vm.setSelectedMedias = function (medias) {
            vm.selectedMedias = medias;
        }
        vm.getSelectedMedias = function () {
            return vm.selectedMedias;
        }
        vm.saveChanges = function (medias, tab, changes) {
            if (medias && medias.length > 0) {
                var mediasIds = [];
                for (var i = 0; i < medias.length; i++) {
                    mediasIds.push(medias[i].id);
                }
                var data = {};
                data[tab] = {};
                for (var i = 0; i < changes.length; i++) {
                    data[tab][changes[i].fieldId] = changes[i].value || null;
                }
                return metadataMultiEditFactory.postChanges(mediasIds, data);
            } else {
                return new Promise(function (resolve, reject) {
                    reject('Nessun asset selezionato per la modifica.');
                });
            }
        }

    }
})();
