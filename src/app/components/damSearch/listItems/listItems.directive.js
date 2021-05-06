(function () {
    'use strict';

    angular
        .module('listItemsMdl')
        .directive('listItems', listItems)

    /** @ngInject */
    function listItems() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/damSearch/listItems/listItems.html',
            controller: listItemsController,
            controllerAs: 'listItems',
            bindToController: true
        };
        return directive;
    }

    /** @ngInject */
    function listItemsController($scope, $rootScope, $log, $document, $timeout, ListItemsService, getAllByKey, listItemsFactory, $sce, MainService, $uiMrFeedback, $uibModal, checkResize) {
        var vm = this;
        var render = function () {
        };
        vm.goToRouter = function (state, params) {
            $scope.$emit('callRouter', state, params);
        };
        vm.config = CONFIG;
        var templateList = {
            "0": "template-list-simple",
            "1": "template-list-details-1",
            "2": "template-list-details-2"
        };
        vm.hideFrameTitle = MainService.hideFrameTitle;
        vm.cms = MainService.cms;
        vm.activeList = templateList[0];
        var changeActiveList = $rootScope.$on('listItemsChangeActiveList', function (event, index) {
            vm.activeList = templateList[index];
        });
        vm.setBoxHeight = function (e) {
            vm.frameHeight = "99%";
            $timeout(function () { vm.frameHeight = angular.element(e.currentTarget).height() + "px"; });
        };
        var setActionSelected = function (action) {
            vm.actionSelected = action;
        };
        var syncActionSelected = $scope.$on("listItemsSetActionSelected", function (event, action) {
            setActionSelected(action);
        });
        $document.keydown(function (e) {
            vm.keyDown = e;
        });
        $document.keyup(function () {
            vm.keyDown = null;
        });
        vm.lastSelectedItem = null;
        vm.checkMediaSelectedClass = function (id) {
            if (vm.checkMediaSelected(id)) {
                if (!vm.actionSelected || vm.actionSelected === "selected") {
                    return 'selected';
                }
                else if (vm.actionSelected === "aggiungi") {
                    var exist = _.findIndex(vm.docs, { "id": id });
                    if (exist !== -1)
                        vm.docs.splice(exist, 1);
                }
            }
        };
        var selectedContainer = null;
        var openSelectionContainer = function (item, selected) {
            selectedContainer = item;
            groupToCheck = "ContainedMedia";
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modal-containerMedia.html',
                appendTo: angular.element("#list"),
                openedClass: "modal-containerMedia",
                controller: function ($scope, $uibModalInstance) {
                    $scope.msgToUser = "Attendi il caricamento dei dati..."
                    $scope.containedMedia = [];
                    var getContainedMedia = function () {
                        var obj = {};
                        obj.resource1 = "container";
                        obj.element1 = item.id;
                        obj.ContainedMedia = true;
                        listItemsFactory.getMedia(obj)
                            .then(function (data) {
                                item.ContainedMedia = [];
                                var contMedia;
                                if (MainService.externalFiltersOR) {
                                    _.forEach(MainService.externalFiltersOR, function (value) {
                                        var ret = [];
                                        for (var key in value) {
                                            if (Object.prototype.hasOwnProperty.call(value, key))
                                                ret.push(key);
                                        }
                                        contMedia = _.filter(data.ContainedMedia, function (media) {
                                            return media[ret[0]] === value[ret[0]];
                                        });
                                        item.ContainedMedia = item.ContainedMedia.concat(contMedia);
                                    });
                                }
                                else {
                                    item.ContainedMedia = data.ContainedMedia;
                                }
                                //item.ContainedMedia=contMedia;
                                $scope.containedMedia = item.ContainedMedia;
                                if ($scope.containedMedia.length === 0) {
                                    $scope.msgToUser = "Nessun media da visualizzare"
                                }
                            })
                            .catch(function (err) {
                                $log.error(err);
                            });
                    };
                    if (!item.ContainedMedia || typeof item.ContainedMedia !== "object")
                        getContainedMedia();
                    else {
                        $scope.containedMedia = item.ContainedMedia;
                        _.forEach($scope.containedMedia, function (value) {
                            if (value.selected)
                                ListItemsService.addObjSelected(value);
                        });
                        if ($scope.containedMedia.length === 0) {
                            $scope.msgToUser = "Nessun media da visualizzare"
                        }
                    }

                    $scope.selectItem = function (doc) {
                        vm.selectItem(doc);
                    };
                    $scope.checkMediaSelectedClass = function (id) {
                        return vm.checkMediaSelectedClass(id);
                    };
                    $scope.cancelSelection = function () {
                        $scope.selectItem(null);
                        $uibModalInstance.close();
                    };
                    $scope.insertSelection = function () {
                        $uibModalInstance.close();
                    };
                    $scope.getDefaultUrl = function (type) {
                        var defImg = "";
                        switch (type) {
                            case "IMAGE":
                                defImg = "img/default_document.png"
                                break;
                            case "PDF":
                                defImg = "img/default_pdf.png"
                                break;
                            case "VIDEO":
                                defImg = "img/default_video.png"
                                break;
                            case "AUDIO":
                                defImg = "img/default_audio.png"
                                break;
                            case "CONTAINER":
                                defImg = "img/default_document.png"
                                break;
                            default:
                                "img/default_document.png"
                        };
                        return defImg;
                    };
                }
            });
            modalInstance.closed.then(function (selectedItem) {
                groupToCheck = "docs";
            });
            modalInstance.rendered.then(function () {
                var windowHeight = window.innerHeight;
                $(".modal-body-containerMedia").css("height", (windowHeight - 148) + "px");
            });
        };
        var groupToCheck = "docs";
        vm.selectItem = function (doc) {
            var docs = groupToCheck === "docs" ? vm.docs : selectedContainer.ContainedMedia;
            var hideSelected = function (item) {
                vm.addItemSelected(item);
            };
            var clearSelected = function () {
                //ListItemsService.refreshObjSelected();
                var match = getAllByKey(docs, "selected", true);
                if (match.length > 0) {
                    _(match).forEach(function (value) {
                        delete value.selected;
                        ListItemsService.removeObjSelectedWithEvent(value, false);
                    });
                }
            };
            var selectOnlyOne = function (item, selected) {
                if (item.type === "CONTAINER" && !item.selected) {
                    openSelectionContainer(item, selected);
                    return;
                }
                clearSelected();
                if (!selected) {
                    vm.addItemSelected(item);
                    vm.lastSelectedItem = item;
                }
            };
            var toggleSelected = function (item) {
                if (!item.selected) {
                    vm.addItemSelected(item);
                    vm.lastSelectedItem = item;
                }
                else {
                    vm.removeItemSelected(item);
                }
            };
            var selectGroupItems = function (start, end) {
                clearSelected();
                for (var i = start; i < end; i++) {
                    vm.addItemSelected(docs[i]);
                }
            };
            if (!doc) {
                clearSelected();
                return;
            }
            if (vm.actionSelected === "none") {
                return;
            }
            if (vm.actionSelected === "aggiungi") {
                hideSelected(doc);
                return;
            }
            if (vm.actionSelected === "selected" && MainService.singleSelection) {
                selectOnlyOne(doc, doc.selected);
                if (doc.type !== "CONTAINER")
                    $scope.$emit("listReturnSelection", doc.selected);
                return;
            }
            if (!vm.keyDown) {
                selectOnlyOne(doc, doc.selected);
            }
            else if (vm.keyDown && (vm.keyDown.ctrlKey || vm.keyDown.metaKey)) {
                toggleSelected(doc);
            }
            else if (vm.keyDown && vm.keyDown.shiftKey) {
                var from = vm.lastSelectedItem ? _.findIndex(docs, function (o) { return o.id == vm.lastSelectedItem.id; }) : -1;
                if (from === -1)
                    from = 0;
                var to = _.findIndex(docs, function (o) { return o.id == doc.id; });
                if (from > to) {
                    to = [from, from = to][0];
                }
                selectGroupItems(from, to + 1);
                vm.lastSelectedItem = doc;
            }
        };
        vm.addItemSelected = function (item) {
            ListItemsService.addObjSelected(item, true);
        }
        vm.removeItemSelected = function (item) {
            ListItemsService.removeObjSelected(item);
        }
        vm.checkMediaSelected = function (id) {
            var selected = ListItemsService.getObjSelected();
            var exist = _.findIndex(selected, { "id": id }) === -1 ? false : true;
            return exist;
        }
        vm.docs = null;
        var syncObjList = $rootScope.$on('listItemsSetObjList', function (event, objs) {
            vm.docs = objs;
            var mediaCont = _.filter(vm.docs, { "type": "CONTAINER" });
            if (!mediaCont)
                return;
            // _.forEach(mediaCont,function(value){
            //     value.thumbnail =  value.thumbnail + "?timestamp=" + new Date().getTime(); 
            // });
        });
        var removeObjList = $rootScope.$on('listItemsSetObjSelected', function (event, obj, objs, action) {
            if (action === "remove" && vm.docs && vm.actionSelected === "aggiungi")
                vm.docs.push(obj);
        });
        var clearObjList = $rootScope.$on('listItemsClearObjSelectedInController', function (event, obj, objs, action) {
            vm.selectItem();
        });
        vm.searchError = null;
        vm.selectedDoc = [];
        vm.multipleSelectedDocs = [];
        vm.prepareOpenModalPreview = function (doc) {
            var obj = {};
            if (doc.type !== "CONTAINER") {
                //if(!doc.bytestream){
                obj = {};
                obj.resource1 = "media";
                obj.element1 = doc.id;
                obj.bytestream = true;
                listItemsFactory.getMedia(obj)
                    .then(function (data) {
                        doc.bytestream = _.clone(data.bytestream);
                        var btThumbnail = _.remove(data.bytestream, function (obj) {
                            return obj.name === "thumbnail";
                        });
                        _.forEach(data.bytestream, function (value) {
                            value.downloadUrl = CONFIG.serverRoot + CONFIG.instance + "/bytestream/edit/true/" + doc.id + "/" + (value.name || value.title) + "/";
                            value.thumbnail = value.type === "IMAGE" ? value.url : btThumbnail.url;
                        });
                        openModalPreview(data.bytestream, doc);
                    })
                    .catch(function (err) {
                        $log.error(err);
                    });
                /*}
                else{
                    openModalPreview(doc.bytestream,doc);
                }*/
            }
            else {
                if (!doc.mediaInContainer) {
                    obj = {};
                    obj.resource1 = "container";
                    obj.element1 = doc.id;
                    obj.ContainedMedia = true;
                    listItemsFactory.getMedia(obj)
                        .then(function (data) {
                            doc.mediaInContainer = _.clone(data.ContainedMedia);
                            _.forEach(doc.mediaInContainer, function (value) {
                                value.name = value.title;
                                value.downloadUrl = CONFIG.serverRoot + CONFIG.instance + "/bytestream/edit/true/" + value.id + "/original/";
                                value.urlStream = CONFIG.serverRootStream ? CONFIG.serverRootStream + "media/" + value.id + "/original" : value.url;
                            });
                            openModalPreview(doc.mediaInContainer, null);
                        })
                        .catch(function (err) {
                            $log.error(err);
                        });
                }
                else {
                    openModalPreview(doc.mediaInContainer, null);
                }
            }
        };
        var openModalPreview = function (medias, doc) {
            if (!medias || medias.length === 0) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Non ci sono media da visualizzare"
                };
                $uiMrFeedback.warning(feedback);
                return;
            }
            vm.modalPreview = {};
            vm.modalPreview.medias = [];
            _.forEach(medias, function (value) {
                var url = value.urlPreview || value.url || CONFIG.serverRoot + CONFIG.instance + "/get/" + doc.id + "/original";
                var obj = {
                    title: value.name || value.title,
                    type: value.type || doc.type,
                    urlStream: value.urlStream,
                    thumbnail: value.thumbnail || doc.thumbnail || "",
                    downloadUrl: value.downloadUrl
                };
                obj.url = obj.type === 'IMAGE' ? checkResize(url) : url;
                vm.modalPreview.medias.push(obj);
            });
            vm.modalPreview.options = {
                btnClose: true,
                fnClose: function () {
                    vm.modalPreview = null;
                },
                fnClosePrm: []
            }
        }
        vm.closeModalPreview = function () {
            vm.modalPreview = null;
        };
        vm.openBatchEditor = function (media) {
            $scope.$emit('listItemsOpenBatchEditor', media);
        };
        vm.downloadPopover = {
            templateUrl: 'listItemsDownloadPopoverTemplate.html',
            isOpen: false
        };
        vm.previewPopover = {
            templateUrl: 'listItemsPreviewPopoverTemplate.html',
            isOpen: false
        };
        vm.getMediaPreview = function (doc) {
            if (doc.urlPreview) {
                return doc.urlPreview; // No need to check resize in this case
            }
            var url = doc.url || doc.thumbnail;
            var src = checkResize(url, 400);
            return src;
        };
        vm.hideDownloadPopover = function () {
            vm.downloadPopover.isOpen = false;
            vm.downloadPopover.fileTypes = null;
            vm.downloadPopover.doc = null;
            vm.bytestreamSelected = null;
        }
        vm.populateDownloadPopover = function (doc) {
            vm.downloadPopover.fileTypes = null;
            vm.downloadPopover.doc = null;
            vm.bytestreamSelected = null;
            if (!doc.bytestream) {
                var obj = {};
                obj.resource1 = "media";
                obj.element1 = doc.id;
                obj.bytestream = true;
                listItemsFactory.getMedia(obj)
                    .then(function (data) {
                        _.forEach(data.bytestream, function (bytestream) {
                            bytestream.baseUrl = CONFIG.serverRoot + 'get/' + CONFIG.instance;
                        });
                        doc.bytestream = data.bytestream;
                        vm.downloadPopover.doc = doc;
                        vm.downloadPopover.fileTypes = CONFIG.fileTypes[doc.type];
                    })
                    .catch(function (err) {
                        $log.error(err);
                    });
            }
            else {
                vm.downloadPopover.doc = doc;
                vm.downloadPopover.fileTypes = CONFIG.fileTypes[doc.type];
            }
        };
        
        vm.prepareRemoveMedia = function (type, id) {
            if (type === "container") {
                var feedback = {
                    title: "Rimozione contenitore",
                    msg: "Stai eliminando il contenitore dall'archivio. \nVuoi cancellare definitivamente anche i media contenuti oppure vuoi lasciarli?",
                    close: true,
                    autoClose: true,
                    icon: 'fa-trash-o',
                    iconType: 'danger',
                    btnAction: [
                        {
                            func: vm.removeMedia.container,
                            params: [id, true],
                            text: "Elimina media",
                            //btnStyle: "background:#F66957;color:#FFF"
                        },
                        {
                            func: vm.removeMedia.container,
                            params: [id, false],
                            text: "Mantieni media",
                            //btnStyle: "background:#ec971f;color:#FFF"
                        }
                    ]
                };
                $uiMrFeedback.open(feedback);
                return false;
            }
            var feedback = {
                title: "Rimozione media",
                msg: "Sei sicuro di voler eliminare il media?",
                close: true,
                autoClose: true,
                icon: 'fa-trash-o',
                iconType: 'danger',
                btnAction: [{
                    func: vm.removeMedia[type],
                    params: [id],
                    text: "Elimina"
                    // btnStyle: "background:#F66957;border-color:#b00;color:#FFF"
                }]
            };
            $uiMrFeedback.open(feedback);
        };
        
        vm.removeMedia = {
            media: function (id) {
                listItemsFactory.removeMedia(id)
                    .then(function () {
                        $scope.$emit('damSearchTriggerRequestSearchHistory');
                        //var media = _.findIndex(vm.docs,{"id":id});
                        //vm.docs.splice(media,1);
                    })
                    .catch(function (err) {
                        $log.error(err);
                        var msg = err.status === 409 ? err.data.message : "C'è stato un errore durante l'operazione";
                        var feedback = {
                            title: "Errore",
                            msg: msg,
                            close: true,
                            btnAction: null
                        };
                        $uiMrFeedback.error(feedback);
                    });
            },
            container: function (id, removeMedia) {
                listItemsFactory.removeContainer(id, removeMedia)
                    .then(function () {
                        $scope.$emit('damSearchTriggerRequestSearchHistory');
                        //var media = _.findIndex(vm.docs,{"id":id});
                        //vm.docs.splice(media,1);
                    })
                    .catch(function (err) {
                        $log.error(err);
                        var msg = err.status === 409 ? err.data.message : "C'è stato un errore durante l'operazione";
                        var feedback = {
                            title: "Errore",
                            msg: msg,
                            close: true
                        };
                        $uiMrFeedback.error(feedback);
                    });
            }
        };
        vm.multipleDynamicPopover = {
            templateUrl: 'multipleDownloadPopoverTemplate.html'
        };

        vm.isSearchSimilarEnabled = function() {
            return MainService.isEnabledFeature('searchSimilarImages');
        };

        vm.searchSimilarImages = function (id) {
            ListItemsService.searchSimilarImages(id);
        };

        vm.getSelectedNum = function() {
            return ListItemsService.getSelectedNum();
        };

        vm.getSelectedSize = function() {
            return ListItemsService.getSelectedSize();
        };
        
        $scope.$on("$destroy", function () {
            changeActiveList();
            syncObjList();
            removeObjList();
            syncActionSelected();
            clearObjList();
            ListItemsService.refresh();
        });
        $scope.$emit("listItemsReady", "listItems");
        render();
    }
})();
