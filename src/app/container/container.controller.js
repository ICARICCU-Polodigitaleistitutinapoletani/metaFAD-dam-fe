(function () {
    'use strict';

    /**
     *  @ngdoc function
     *  @name damApp.controller:ContainerCtrl
     *  @description
     *  # ContainerCtrl
     *  Controller of the damApp
     */
    angular.module('damApp')
        .controller('ContainerCtrl', ContainerCtrl);
    /** @ngInject */
    function ContainerCtrl($scope, $rootScope, $uiMrFeedback, $log, $stateParams, $timeout, $window, $http, $uibModal, MainService, MenuTabService, containerFactory, DamCollectionManagerService, FilterSearchService, ListItemsService, DamRelatedMediaService, mainFactory, $sce, checkResize) {
        var vm = this;

        var initSchema = function (data) {
            if (!data)
                return;
            vm.schemaForm = data;
            var mapProp = "MainData.schema.properties";
            MainService.initAutocompleteSchemaForm(vm.schemaForm, mapProp, vm.getAutocomplete, null);
            MainService.initTagSchemaForm(vm.schemaForm, mapProp, null);
            if (vm.state === "create") {
                initCreateContainer();
            }
            else {
                initEditContainer();
            }
        };
        vm.getAutocomplete = function (modelValue, objClb, stringValue) {
            var key = modelValue.key || modelValue.autocomplete;
            var field = modelValue.autocomplete;
            var value = stringValue || MainService.getAutocompleteValue();
            if (field && value) {
                var prm = {
                    field: field,
                    value: value
                };
                mainFactory.autocomplete(prm)
                    .then(function (data) {
                        var mapProp = "MainData.schema.properties";
                        data.value.unshift(value);
                        MainService.setAutocompleteValue(vm.schemaForm, mapProp, key, data.value);
                    })
                    .catch(function (err) {
                        $log.error(err);
                    });
            }
        };
        var render = function () {
            vm.state = $stateParams.id ? "edit" : "create";
            initSchema(CONFIG.schemaForm);
        };
        vm.init = {
            collection: false,
            folder: false,
            mediaCollegati: false,
            ContainedMedia: false
        };
        vm.goToRouter = function (state, params) {
            $scope.$emit('callRouter', state, params);
        };
        var syncInfo = $scope.$on("mainSyncInformation", function (event, info) {
            initSchema(CONFIG.schemaForm);
        });
        var setEleHeight = function (appHeight) {
            vm.eleHeight = {};
            vm.eleHeight.tabContentRight = appHeight - 176 + "px";
        };
        setEleHeight(MainService.getAppHeight());
        $(window).on("resize.doResize", function () {
            $scope.$apply(function () {
                vm.eleHeight.tabContentRight = MainService.getAppHeight($window.innerHeight) - 176 + "px";
            });
        });
        vm.imgMiddleRespOptions = {
            container: {
                maxWidth: "150px",
                maxHeight: "150px"
            }
        };
        var initCreateContainer = function () {
            //MainService.setActiveState("main.container");
            MenuTabService.setMainActiveTab(4);
            vm.media = {
                MainData: {}
            };
            $timeout(function () { $scope.$broadcast('schemaFormRedraw'); }, 300, false);
        };
        var initEditContainer = function () {
            //MainService.setActiveState('main.container_edit|{"id":"' + $stateParams.id + '"}');
            MenuTabService.setMainActiveTab(-1);
            var prm = {
                "MainData": true
            };
            getContainer(prm, successInitContainer);
        };
        vm.activeTab = 'MainData';
        vm.setActiveTab = function (tab) {
            vm.activeTab = tab;
            vm.damLoad = false;
            vm.damSearch = false;
            vm.damSearchRel = false;
            if (tab === "collection" || tab === "folder") {
                if (!vm.init[tab]) {
                    vm.getColChildren(tab, 0);
                }
            }
            else if (tab === "ContainedMedia") {
                //if(!vm.init[tab]){
                getContainedMedia();
                //}
            }
            else if (tab === "mediaCollegati") {
                //if(!vm.init[tab]){
                getRelatedMedia();
                //}
            }
        };
        var setTag = function (stream, value) {
            var mapProp = "MainData.schema.properties";
            MainService.setTag(vm.schemaForm, value, mapProp, vm.media.MainData.type);
        };
        var initSetTag = function (schema, value) {
            var tagField = vm.schemaForm[schema] && vm.schemaForm[schema].form[0].items[0].tagFields;
            if (!tagField)
                return;
            _.forEach(tagField, function (tag) {
                var field = value[tag.key];
                vm.schemaForm.MainData.form[0].items[0].items[tag.index].select_models = [];
                _.forEach(field, function (val) {
                    vm.schemaForm.MainData.form[0].items[0].items[tag.index].select_models.push({ value: val, label: val });
                });
            });
        };
        var containerBytestream = null;
        var containerBytestreamId = null;
        vm.dropzoneHasOneBytestream = false;
        vm.dropzoneConfig = {
            url: CONFIG.serverRoot + CONFIG.instance + '/upload',
            maxFiles: 1,
            parallelUploads: 1,
            previewTemplate: $('#copertina-template').html(),
            acceptedFiles: "image/*",
            headers: {
                accept: '*/*'
            },
            init: function () {
                this.on("addedfile", function (file) {
                    vm.dropzoneHasOneBytestream = true;
                    $scope.$apply();

                });
                this.on("success", function (file, response) {
                    containerBytestream = typeof response === "object" ? response.response : response;
                    $scope.$apply();
                    if (vm.state === "edit") {
                        vm.preparePutBytestream();
                    }
                });
                this.on("error", function (file, response) {

                });
            }
        };
        vm.media = {};
        $scope.jqyouiDraggable = {
            onDrop: function (event, ui) {
                if (DamRelatedMediaService.getObjMoveList().length === 0) {
                    var feedback = {
                        title: "Attenzione",
                        msg: "Devi selezionare almeno un media per poter settare la copertina"
                    };
                    $uiMrFeedback.warning(feedback);
                    return;
                }
                containerBytestreamId = DamRelatedMediaService.getObjMoveList()[0].id;
                vm.preparePutBytestream();
            }
        };
        vm.preparePostContainer = function () {
            var prm = {
                "MainData": vm.media.MainData
            };
            if (containerBytestream) {
                prm.bytestream = containerBytestream;
            }
            containerFactory.postContainer(prm)
                .then(function (data) {
                    if (data.id) {
                        containerBytestream = null;
                        containerBytestreamId = null;
                        vm.media.id = data.id;
                        vm.openModalConfirm();
                    }
                })
                .catch(function (err) {
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nel salvataggio dei dati"
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        vm.preparePutBytestream = function () {
            var idMedia = vm.media.id;
            var resource = "bytestream";
            var idResource = "1";
            var prm = {};
            if (containerBytestream) {
                prm["bytestream"] = containerBytestream;
            }
            if (containerBytestreamId) {
                prm["bytestreamId"] = containerBytestreamId;
            }
            containerFactory.putContainerResource(idMedia, resource, idResource, prm)
                .then(function (data) {
                    vm.dropzone.removeAllFiles();
                    vm.dropzoneHasOneBytestream = false;
                    containerBytestream = null;
                    containerBytestreamId = null;
                    var prm = {
                        "MainData": true
                    };
                    getContainer(prm, successInitContainer);
                    //vm.thumbnail = data.bytestream+'?timestamp='+new Date().getTime() || CONFIG.serverRoot + CONFIG.instance + '/get/' + vm.media.id + '/thumbnail?timestamp=' + new Date().getTime();
                })
                .catch(function (err) {
                    $log.error(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nello scaricamento dei dati"
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        vm.openModalConfirm = function () {
            var feedback = {
                icon: 'fa-check',
                iconType: 'success',
                title: 'Contenitore creato',
                msg: 'Vuoi collegare subito i media?',
                close: false,
                autoClose: true,
                btnAction: [{
                    text: "No",
                    func: function () {
                        vm.goToRouter("main.list");
                    }
                    // btnStyle: 'color:#fff;background-color: #d9534f;border-color: #d43f3a;'
                }, {
                    text: "Si, collega",
                    func: function () {
                        vm.goToRouter("main.container_edit", { "id": vm.media.id, "activeTab": "ContainedMedia" });

                    }
                    // btnStyle: 'color: #fff; background-color: #337ab7; border-color: #2e6da4;'
                }]
            }
            $uiMrFeedback.info(feedback);
            // var modalInstance = $uibModal.open({
            //     animation: true,
            //     templateUrl: 'modal-confirm.html',
            //     appendTo:angular.element(".contenitore"),
            //     openedClass:"modal-confirm",
            //     controller: function($scope,$uibModalInstance) {
            //         $scope.closeModalConfirm = function(action) {
            //             $uibModalInstance.close();
            //             if(action){
            //                 vm.goToRouter("main.container_edit",{"id":vm.media.id,"activeTab":"ContainedMedia"});
            //             }
            //             else
            //                 vm.goToRouter("main.list");
            //         };
            //     }
            // });
        };
        var getContainer = function (prm, next) {
            var obj = _.clone(prm);
            obj.resource1 = "container";
            obj.element1 = $stateParams.id;
            containerFactory.getContainer(obj)
                .then(function (data) {
                    next(prm, data);
                })
                .catch(function (err) {
                    $log.error(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nello scaricamento dei dati"
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        var successInitContainer = function (prm, data) {
            vm.media.id = data.id;
            _.forEach(prm, function (value, key) {
                vm.media[key] = _.clone(data[key]);
            });
            setTag("MainData", vm.media.MainData);
            vm.thumbnail = vm.media.MainData.thumbnail || CONFIG.serverRoot + CONFIG.instance + '/get/' + vm.media.id + '/thumbnail';
            vm.iframeLoadMediaUrl = $sce.trustAsResourceUrl(CONFIG.server + "#/tecadam/addmedia?instance=" + CONFIG.instance + "&setState=true&boxFrame=true&containerId=" + vm.media.id);
            if ($stateParams.activeTab) {
                vm.setActiveTab($stateParams.activeTab);
                $stateParams.activeTab = null;
            }
            vm.containedMediaActionEdit = {
                show: true,
                params: {
                    "fromContainer": vm.media.id
                }
            };
        };

        //Inizio funzioni per la gestione dei media contenuti
        var getContainedMedia = function () {
            var obj = {};
            obj.ContainedMedia = true;
            getContainer(obj, successGetContainedMedia);
        };
        var successGetContainedMedia = function (prm, data) {
            var related = data.ContainedMedia ? _.clone(data.ContainedMedia) : [];
            DamRelatedMediaService.setObjList(related, true);
            var selected = data.ContainedMedia ? _.clone(data.ContainedMedia) : [];
            ListItemsService.setObjSelected(selected);
            vm.init.ContainedMedia = true;
        };
        vm.preparePutMedia = function () {
            var idMedia = vm.media.id;
            var resource = "MainData";
            var idResource = vm.media.MainData.id;
            var prm = vm.media.MainData;
            containerFactory.putContainerResource(idMedia, resource, idResource, prm)
                .then(function (data) {
                    vm.media.MainData = _.clone(data);
                })
                .catch(function (err) {
                    $log.error(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nello scaricamento dei dati"
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        vm.openMediaPreview = function () {
            var ContainedMedia = DamRelatedMediaService.getObjList();
            if (!ContainedMedia || ContainedMedia.length === 0) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Non ci sono media contenuti da visualizzare"
                };
                $uiMrFeedback.warning(feedback);
                return;
            }
            var medias = [];
            _.forEach(ContainedMedia, function (value) {
                var url = value.url || CONFIG.serverRoot + CONFIG.instance + "/get/" + value.id + "/original";
                var downloadUrl = CONFIG.serverRoot + CONFIG.instance + "/bytestream/edit/true/" + value.id + "/original/";
                var obj = {
                    title: value.title,
                    type: value.type,
                    url: value.type === 'IMAGE' ? checkResize(url) : url,
                    urlStream: CONFIG.serverRootStream ? CONFIG.serverRootStream + "media/" + value.id + "/original" : value.url,
                    thumbnail: value.thumbnail || "",
                    downloadUrl: downloadUrl
                };
                medias.push(obj);
            });
            vm.containedMediaPreview = {};
            vm.containedMediaPreview.medias = medias;
            vm.containedMediaPreview.options = {
                btnClose: true,
                fnClose: function () {
                    vm.containedMediaPreview = null;
                },
                fnClosePrm: []
            }
        };

        vm.damSearchTemplateOptions = {
            "listItems": true,
            "inputSearch": true
        };
        var damSearchComponents = {
            "listItems": false,
            "inputSearch": false
        };
        var finishLoaded = false;
        var checkEleLoaded = function (arEle) {
            var loaded = _.keys(_.pick(arEle, _.identity));
            var finish = loaded.length === Object.keys(arEle).length;
            if (!finishLoaded && finish) {
                finishLoaded = true;
            }
        };
        var listActionSelected = "none";
        var listItemsReady = $scope.$on("listItemsReady", function (event, ele) {
            damSearchComponents[ele] = true;
            checkEleLoaded(damSearchComponents);
            $scope.$broadcast("listItemsSetActionSelected", "aggiungi");
        });
        var inputSearchReady = $scope.$on("inputSearchReady", function (event, ele) {
            damSearchComponents[ele] = true;
            checkEleLoaded(damSearchComponents);
        });
        vm.toggleSearch = function (type, state) {
            if (!state) {
                FilterSearchService.setFiltersApplied([{ 'type': '-CONTAINER' }]);
                var selected = _.clone(DamRelatedMediaService.getObjList());
                ListItemsService.setObjSelected(selected);
                vm[type] = true;
                $timeout(function () {
                    $scope.$broadcast('damSearchTriggerRequestSearch');
                }, 200);
            }
            else {
                vm[type] = false;
            }
        };
        vm.toggleLoad = function (state) {
            if (!state) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'modal-addMedia.html',
                    appendTo: angular.element(".contenitore"),
                    openedClass: "modal-addMedia",
                    controller: function ($scope, $uibModalInstance) {
                        $scope.iframeLoadMediaUrl = vm.iframeLoadMediaUrl;
                        $scope.closeModalConfirm = function (action) {
                            $uibModalInstance.close();
                            vm.damLoad = false;
                            getContainedMedia();
                        };
                        $scope.$on("addmediaAddMediaSuccess", function (event, data) {
                            $scope.closeModalConfirm();
                        });
                    }
                });
            }
            else {
                vm.damLoad = false;
            }
        };
        var setMediaSelected = $scope.$on("listItemsSetObjSelected", function (event, obj, objs, action) {
            if (action === "add") {
                var medias = [obj];
                var resource = vm.activeTab === "mediaCollegati" ? "RelatedMedia" : vm.activeTab;
                addContainedMedia(resource, medias);
            }
        });
        var addContainedMedia = function (resource, medias, next) {
            var prm = {
                addMedias: []
            };
            _.forEach(medias, function (media) {
                prm.addMedias.push(media.id);
            });
            containerFactory.postContainedMedia(vm.media.id, resource, prm)
                .then(function (data) {
                    _.forEach(medias, function (media) {
                        DamRelatedMediaService.addObjList(media, true);
                    });
                    if (next)
                        next(medias);
                })
                .catch(function (err) {
                    console.log(err);
                    var feedback = {
                        title: "Errore", 
                        msg: "C'è stato un errore nel salvataggio dei dati"
                    };
                    $uiMrFeedback.error(feedback);
                    _.forEach(medias, function (media) {
                        ListItemsService.removeObjSelected(media);
                    });
                });
        };
        var removeMediaSelected = $scope.$on("damRelatedMediaRemoveObjList", function (event, obj, objs) {
            var resource = vm.activeTab === "mediaCollegati" ? "RelatedMedia" : vm.activeTab;
            if (resource === "RelatedMedia")
                removeContainedMedia(resource, obj);
            else {
                var feedback = {
                    icon: 'fa-trash-o',
                    iconType: 'danger',
                    title: "Rimozione media",
                    msg: "Stai eliminando il media dal contenitore. \n Vuoi cancellarlo definitivamente dal software oppure vuoi solo toglierlo dal contenitore?",
                    autoClose: true,
                    close: true,
                    //template:"<div>{{damFeedback.feedback.title}}</div>",
                    fnClose: {
                        func: function (media) {
                            DamRelatedMediaService.addObjList(media, true);
                        },
                        params: [obj]
                    },
                    btnAction: [
                        {
                            func: removeContainedMedia,
                            params: [resource, obj, true],
                            text: "Elimina definitivamente",
                            //btnStyle: "background:#F66957;color:#FFF"
                        },
                        {
                            func: removeContainedMedia,
                            params: [resource, obj, false],
                            text: "Elimina dal contenitore",
                            //btnStyle: "background:#ec971f;color:#FFF"
                        }
                    ]
                };
                $uiMrFeedback.info(feedback);
            }
        });
        var removeContainedMedia = function (resource, media, removeFromDam) {
            var idMedia = vm.media.id;
            var idContMedia = media.id;
            if (!idMedia || !idContMedia) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Non è possibile procedere con l'eliminazione del media"
                };
                $uiMrFeedback.error(feedback);
            }
            containerFactory.deleteContainedMedia(idMedia, resource, idContMedia, removeFromDam)
                .then(function (data) {
                    // vm.feedback = null;
                })
                .catch(function (err) {
                    console.log(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nell'elaborazione dei dati"
                    };
                    $uiMrFeedback.error(feedback);
                    DamRelatedMediaService.addObjList(media, true);
                });
        };

        var getRelatedMedia = function (idMedia) {
            var obj = {};
            obj.RelatedMedia = true;
            getContainer(obj, successGetRelatedMedia);
        };
        var successGetRelatedMedia = function (prm, data) {
            var related = data.RelatedMedia ? _.clone(data.RelatedMedia) : [];
            DamRelatedMediaService.setObjList(related, true);
            var selected = data.RelatedMedia ? _.clone(data.RelatedMedia) : [];
            ListItemsService.setObjSelected(selected);
            vm.init.mediaCollegati = true;
        };

        var addMediaPostMediaSuccess = $scope.$on("addMediaPostMediaSuccess", function (event, data) {
            console.log(data);
        });

        //Fine funzioni per la gestione dei media contenuti

        /*vm.openHistory = function(){
            var activeHistory = vm.activeTab;
            var existData = vm.media.history && vm.media.history[activeHistory];
            if(existData){
                vm.objHistory = vm.media.history[activeHistory];
                return;
            }
            var prm = {
                history:activeHistory
            };
            var successGetHistory = function(prm,data){
                if(prm.history==="all"){
                    vm.media.history = data.history;
                }
                else{
                    vm.media.history = vm.media.history || {};
                    vm.media.history[prm.history] = data.history;
                    vm.objHistory = vm.media.history[prm.history];
                }
            };
            getContainer(prm,successGetHistory);
        };*/

        //Inizio funzioni di gestione tab collezioni - cartelle
        vm.getChildrenError = {
            collection: null,
            folder: null
        };
        vm.getColChildren = function (type, id) {
            containerFactory.getColChildren(type, id)
                .then(function (data) {
                    if (data[0]) {
                        DamCollectionManagerService.initTree(type, vm.treeConfig, data, true, false);
                    }
                    else {
                        vm.getChildrenError[type] = "Nessuna " + (type === 'collection' ? "collezione" : "cartella") + " disponibile"
                    }
                    var prm = {};
                    prm[type] = true;
                    getContainer(prm, successGetRelatedCol);
                })
                .catch(function (err) {
                    vm.getChildrenError[type] = err;
                });
        };
        var successGetRelatedCol = function (prm, data) {
            if (prm.collection) {
                vm.media.collection = data.collection;
            }
            else {
                vm.media.folder = [data.folder];
            }
            $timeout(function () { expandNode(0, 0); }, 500, false);
        };
        vm.treeConfig = {
            extensions: ["glyph"],
            activate: function (event, data) {

            },
            checkbox: true,
            clickFolderMode: 2,
            glyph: {
                map: {
                    checkbox: "fa fa-square-o",
                    checkboxSelected: "fa fa-check-square-o",
                    expanderClosed: "fa fa-caret-right",
                    expanderLazy: "fa fa-caret-right",
                    expanderOpen: "fa fa-caret-down"
                }
            },
            lazyLoad: function (event, data) {
                var node = data.node;
                var dfd = new $.Deferred();
                data.result = dfd.promise();
                var request = $http.get(
                    CONFIG.serverRoot + CONFIG.instance + "/" + vm.activeTab + "/" + encodeURIComponent(node.key) + "/children"
                );
                request.then(
                    function (data) {
                        dfd.resolve(data.data);
                        expandNode(posLoad, livLoad);
                    }
                );
            },
            select: function (event, data) {
                if (!vm.init[vm.activeTab])
                    return;
                if (data.node.selected) {
                    var deselect = vm.activeTab === "folder" ? deselectColFol : null;
                    var colSelected = DamCollectionManagerService.getSelectedNode(vm.activeTab);
                    vm.lastColFolSelected = colSelected ? colSelected[colSelected.length - 1] : null;
                    addColRelatedMedia(vm.media, data.node, deselect);
                }
                else {
                    removeColRelatedMedia(vm.media, data.node);
                }
            }
        };

        var posLoad = 0;
        var livLoad = 0;
        var expandNode = function (pos, liv) {
            var posToLoad = pos;
            var livToLoad = liv;
            var ar = vm.media[vm.activeTab] && vm.media[vm.activeTab].length ? vm.media[vm.activeTab][posToLoad] : null;
            if (!ar) {
                posLoad = 0;
                livLoad = 0;
                vm.init[vm.activeTab] = true;
                return;
            }
            var id = ar.split("/")[livToLoad];
            if (livToLoad === (ar.split("/").length - 1)) {
                posLoad++;
                livLoad = 0;
                DamCollectionManagerService.addSelectedNode(vm.activeTab, id, "id", true);
                expandNode(posLoad, livLoad);
                return;
            }
            addExpandCol(id);
            livLoad++;
        };
        var addExpandCol = function (id) {
            DamCollectionManagerService.addExpandNode(vm.activeTab, id, "id", true);
        };
        var addColRelatedMedia = function (media, col, next) {
            var prm = {
                addMedias: [media.id]
            };
            var idCol = col.data.id;
            containerFactory.postColRelatedMedia(vm.activeTab, idCol, prm)
                .then(function (data) {
                    if (next) {
                        next(media, col);
                    }
                    else {
                        vm.lastColFolSelected = col;
                    }
                })
                .catch(function (err) {
                    console.log(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nel salvataggio dei dati"
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        var removeColRelatedMedia = function (media, col) {
            var idCol = col.data.id;
            var idMedia = media.id;
            if (!idCol || !idMedia) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Non è possibile procedere con l'eliminazione del media"
                };
                $uiMrFeedback.error(feedback);
            }
            containerFactory.deleteColRelatedMedia(vm.activeTab, idCol, idMedia)
                .then(function (data) {
                })
                .catch(function (err) {
                    console.log(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nell'elaborazione dei dati"
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        var deselectColFol = function (media, col) {
            vm.init[col.tree.options.instance] = false;
            if (vm.lastColFolSelected)
                DamCollectionManagerService.removeSelectedNode(col.tree.options.instance, vm.lastColFolSelected, "id", true);
            $timeout(function () { vm.init[col.tree.options.instance] = true; }, 300, false);
        };

        //Fine funzioni di gestione tab collezioni - cartelle

        $scope.$on('$stateChangeStart', function () {
            syncInfo();
            listItemsReady();
            setMediaSelected();
            removeMediaSelected();
            addMediaPostMediaSuccess();
            $(window).off("resize.doResize");
            DamCollectionManagerService.refresh();
            DamRelatedMediaService.refresh();
            ListItemsService.refresh();
            FilterSearchService.refresh();
        });
        render();
    };
}());
