(function () {
    'use strict';

    /**
     *  @ngdoc function
     *  @name damApp.controller:DetailsCtrl
     *  @description
     *  # DetailsCtrl
     *  Controller of the damApp
     */
    angular.module('damApp').controller('DetailsCtrl', DetailsCtrl);

    /** @ngInject */
    function DetailsCtrl($rootScope, $scope, $log, $sce, $stateParams, $timeout, $http, $window, schemaForm, MenuTabService, detailsFactory, MainService, DamCollectionManagerService, DamRelatedMediaService, ListItemsService, FilterSearchService, mainFactory, DamActionBatchService, $uibModal, $location, $uiMrFeedback, fetchFromObject, $uibModalStack, checkResize, $interval, timeToSeconds, apiCall) {
        var vm = this;
        var render = function () {
            initSchema(CONFIG.schemaForm);
            if ($stateParams.fromContainer) {
                vm.fromContainer = $stateParams.fromContainer;
            }
            $timeout(function () {
                MenuTabService.setMainActiveTab(-1);
            }, 200, false);
            //MainService.setActiveState('main.details|{"id":"' + $stateParams.id + '"}');
        };
        var initSchema = function (data) {
            if (!data)
                return;
            vm.schemaForm = data;
            var mapProp = "MainData.schema.properties";
            MainService.initAutocompleteSchemaForm(vm.schemaForm, mapProp, vm.getAutocomplete, null);
            MainService.initTagSchemaForm(vm.schemaForm, mapProp, null);
            $timeout(function () {
                $("#tabs-datastream").mCustomScrollbar("update");
            }, 1000);
            getMainData();
        };
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
        vm.goToRouter = function (state, params) {
            $scope.$emit('callRouter', state, params);
        };
        var syncInfo = $scope.$on("mainSyncInformation", function (event, info) {
            initSchema(CONFIG.schemaForm);
        });
        vm.tabsScrollbarsOptions = {
            axis: 'x',
            scrollButtons: {
                scrollAmount: 50,
                enable: true
            },
            advanced: {
                updateOnContentResize: true
            }
        }
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
                        var mapProp = vm.activeTab === "MainData" ? "MainData.schema.properties" : "datastream." + vm.media.MainData.type + "." + vm.activeTab + ".schema.properties";
                        data.value.unshift(value);
                        MainService.setAutocompleteValue(vm.schemaForm, mapProp, key, data.value);
                    })
                    .catch(function (err) {
                        $log.error(err);
                        var mapProp = vm.activeTab === "MainData" ? "MainData.schema.properties" : "datastream." + vm.media.MainData.type + "." + vm.activeTab + ".schema.properties";
                        var arValue = [value];
                        MainService.setAutocompleteValue(vm.schemaForm, mapProp, key, arValue);
                    });
            }
        };
        vm.init = {
            MainData: false,
            collection: false,
            folder: false,
            mediaCollegati: false,
            videoScenes: false
        };
        vm.imgMiddleRespOptions = {
            container: {
                maxWidth: "150px",
                maxHeight: "150px"
            }
        };
        
        vm.loadDatastream = "media";
        vm.loadDatastreamMedia = function () {
            vm.activeTab = 'MainData';
            vm.loadDatastream = "media";
            vm.bytestreamActive = null;
            vm.thumbnail = _.find(vm.media.bytestream, { "name": "thumbnail" }) ? _.find(vm.media.bytestream, { "name": "thumbnail" }).url : getDefaultUrl(vm.media.MainData.type);
        };
        vm.bytestreamActive = null;
        var btToCheck = null;
        vm.loadDatastreamBytestream = function (stream) {
            if (!stream.id)
                return;
            if (vm.loadDatastream !== "bytestream") {
                vm.loadDatastream = "bytestream";
                _.forOwn(vm.schemaForm.datastream[vm.media.MainData.type], function (value, key) {
                    if (value.schema.associatedTo === "bytestream") {
                        vm.activeTab = key;
                        return;
                    }
                });
            }
            vm.thumbnail = checkResize(stream.url);
            btToCheck = vm.bytestreamActive ? vm.bytestreamActive.id : stream.id;
            vm.bytestreamActive = stream;
            vm.setActiveTab(vm.activeTab);
        };
        vm.activeTab = 'MainData';
        vm.setActiveTab = function (tab) {
            if (vm.loadDatastream === "bytestream" && !btToCheck) {
                btToCheck = vm.bytestreamActive.id;
            }

            if (vm.activeTab === "MainData" || vm.schemaForm.datastream[vm.media.MainData.type][vm.activeTab]) {
                var equal = angular.toJson(vm.media) === vm.mediaStatus;
                if (!equal) {
                    var feedback = {
                        title: "Attenzione",

                        msg: "Ci sono modifiche non salvate. Uscendo dalla sezione perderai i nuovi dati inseriti. Vuoi salvare prima di procedere?",
                        close: false,
                        autoClose: true,
                        modal: true,
                        btnAction: [
                            {
                                func: vm.preparePutMedia,
                                params: [false, btToCheck],
                                text: "Salva"
                            },
                            {
                                func: cancelMediaModify,
                                params: [vm.activeTab, tab],
                                text: "Annulla",
                                type: 'grey'
                                // btnStyle: "background:#F66957;color:#FFF"
                            }
                        ]
                    };
                    $uiMrFeedback.warning(feedback);
                    return;
                }
            }
            vm.activeTab = tab;
            if (tab === "MainData") {
                if (!vm.init[tab]) {
                    getMainData();
                }
            }
            else if (vm.schemaForm.datastream[vm.media.MainData.type][tab]) {
                if (vm.loadDatastream === "media") {
                    if (!vm.media.datastream || !vm.media.datastream[tab]) {
                        var mapProp = "datastream." + vm.media.MainData.type + "." + tab + ".schema.properties";
                        MainService.initAutocompleteSchemaForm(vm.schemaForm, mapProp, vm.getAutocomplete, vm.media.MainData.type);
                        MainService.initTagSchemaForm(vm.schemaForm, mapProp, vm.media.MainData.type);
                        getMediaDatastream(tab);
                    }
                }
                else {
                    if (!vm.bytestreamActive.datastream || !vm.bytestreamActive.datastream[tab]) {
                        var mapProp = "datastream." + vm.media.MainData.type + "." + tab + ".schema.properties";
                        MainService.initAutocompleteSchemaForm(vm.schemaForm, mapProp, vm.getAutocomplete, vm.media.MainData.type);
                        MainService.initTagSchemaForm(vm.schemaForm, mapProp, vm.media.MainData.type);
                        getBytestreamDatastream(vm.media.id, vm.bytestreamActive.id, tab);
                    }
                }
            }
            else if (tab === "collection" || tab === "folder") {
                if (!vm.init[tab]) {
                    vm.getColChildren(tab, 0);
                }
            }
            else if (tab === "mediaCollegati") {
                if (!vm.init[tab]) {
                    getRelatedMedia(vm.media.id);
                }
            }
            // VIDEO SCENES REQUEST
            if (tab !== "VideoScenes") {
                stopVideoScenesPeriodicRequest();
            }
        };
        vm.media = {};
        vm.mediaStatus = {};
        var getMedia = function (prm, next) {
            var obj = _.clone(prm);
            obj.resource1 = "media";
            obj.element1 = $stateParams.id;
            detailsFactory.getMedia(obj)
                .then(function (data) {
                    next(prm, data);
                })
                .catch(function (err) {
                    $log.error(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nello scaricamento dei dati",
                        close: true
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        var setTag = function (stream, value) {
            var mapProp = stream === "MainData" ? "MainData.schema.properties" : "datastream." + vm.media.MainData.type + "." + stream + ".schema.properties";
            MainService.setTag(vm.schemaForm, value, mapProp, vm.media.MainData.type);
        };
        var setSubstitutedField = function (stream, streamValue) {
            var mapProp = stream === "MainData" ? vm.schemaForm.MainData.schema.properties : vm.schemaForm.datastream[vm.media.MainData.type][stream].schema.properties;
            var mappingSubstitution = {
                "boolean-text": function (oldKey, oldValue) {
                    var newValue = oldValue ? oldKey : "";
                    return newValue;
                }
            };
            _.forEach(mapProp, function (value, key) {
                if (value.meta && value.meta.substitutedBy) {
                    if (streamValue[key] === undefined || streamValue[value.meta.substitutedBy])
                        return;
                    var newValue = mappingSubstitution[value.meta.substitutedType](key, streamValue[key]);
                    delete streamValue[key];
                    streamValue[value.meta.substitutedBy] = newValue;
                }
            })
        };
        var getMainData = function () {
            var prm = {
                "MainData": true,
                "bytestream": true
            };
            getMedia(prm, successInitMedia);
        };
        var getDefaultUrl = function (type) {
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
        var successInitMedia = function (prm, data) {
            vm.media.id = data.id;
            _.forEach(prm, function (value, key) {
                vm.media[key] = _.clone(data[key]);
            });
            setTag("MainData", vm.media.MainData);
            setSubstitutedField("MainData", vm.media.MainData);
            vm.mediaStatus = angular.toJson(vm.media);
            vm.thumbnail = _.find(vm.media.bytestream, { "name": "thumbnail" }) ? _.find(vm.media.bytestream, { "name": "thumbnail" }).url : getDefaultUrl(vm.media.MainData.type);
            vm.init.MainData = true;
            if ($stateParams.activeTab) {
                vm.setActiveTab($stateParams.activeTab);
                $stateParams.activeTab = null;
            }
        };
        var cancelMediaModify = function (tab, nextTab) {
            try {
                var oldObj = angular.fromJson(vm.mediaStatus);
                if (vm.loadDatastream === 'media') {
                    if (tab !== "MainData") {
                        vm.media.datastream[tab] = _.clone(oldObj.datastream[tab]);
                        setTag(tab, vm.media.datastream[tab]);
                    } else {
                        vm.media.MainData = _.clone(oldObj.MainData);
                        setTag(tab, vm.media.MainData);
                    }
                }
                else {
                    var btIndex = _.findIndex(vm.media.bytestream, { id: btToCheck });
                    vm.media.bytestream[btIndex].datastream[tab] = _.clone(oldObj.bytestream[btIndex].datastream[tab]);
                    setTag(tab, vm.media.bytestream[btIndex].datastream[tab]);
                }
                btToCheck = null;
                vm.setActiveTab(nextTab);
            } catch (err) {
                vm.mediaStatus = angular.toJson(vm.media);
                btToCheck = null;
                vm.setActiveTab(nextTab);
            }
        };
        vm.datastreamComment = {
            comment: "",
            insert: false,
            showPopover: false,
            reset: function () {
                vm.datastreamComment.comment = "";
                vm.datastreamComment.insert = false;
                vm.datastreamComment.showPopover = false;
            }
        };
        vm.preparePutMedia = function (close, bt) {
            if (vm.loadDatastream !== "media") {
                preparePutBytestreamDatastream(bt);
                return;
            }
            var idMedia = vm.media.id;
            var resource = vm.activeTab;
            var idResource;
            if (vm.activeTab === "MainData") {
                idResource = vm.media.MainData.id;
            } else {
                idResource = vm.media.datastream[vm.activeTab].id;
            }
            var comment;
            if (vm.datastreamComment.insert) {
                comment = encodeURI(vm.datastreamComment.comment);
                vm.datastreamComment.reset();
            }
            var prm;
            if (vm.activeTab === "MainData") {
                prm = vm.media.MainData
            } else {
                prm = vm.media.datastream[vm.activeTab];
            }
            prm = _.mapValues(prm, function (val) { return val === undefined ? null : val }) // Se passo valori undefined questi non vengono realmente passati, quindi risulta impossibile sbiancarli
            if (!idResource) {
                detailsFactory.postMediaResource(idMedia, resource, idResource, comment, prm)
                    .then(function (data) {
                        if (close)
                            return vm.goToRouter("main.list");
                        successPutMedia(data, "create");
                    })
                    .catch(function (err) {
                        $log.error(err);
                        var feedback = {
                            title: "Errore",
                            msg: "C'è stato un errore nell'elaborazione della richiesta",
                            close: true
                        };
                        $uiMrFeedback.error(feedback);
                    });
            }
            else {
                //if(vm.activeTab==="MainData"){
                detailsFactory.putMediaResource(idMedia, resource, idResource, comment, prm)
                    .then(function (data) {
                        if (close)
                            return vm.goToRouter("main.list");
                        successPutMedia(data, "update");
                    })
                    .catch(function (err) {
                        $log.error(err);
                        var feedback = {
                            title: "Errore",
                            msg: "C'è stato un errore nello scaricamento dei dati",
                            close: true
                        };
                        $uiMrFeedback.error(feedback);
                    });
                //}
            }
        };
        var successPutMedia = function (data, action) {
            if (vm.activeTab !== "MainData") {
                vm.media.datastream[vm.activeTab].id = data.id;
            }
            else {
                vm.media.MainData.id = data.id;
            }
            vm.mediaStatus = angular.toJson(vm.media);
        };
        var preparePutBytestreamDatastream = function (bt) {
            var idMedia = vm.media.id;
            var bytestream = bt ? _.find(vm.media.bytestream, { id: bt }) : vm.bytestreamActive;
            var idBytestream = bytestream.id;
            var resource = vm.activeTab;
            var stream = bytestream.datastream[vm.activeTab];
            var idResource = stream.id;
            var comment;
            if (vm.datastreamComment.insert) {
                comment = encodeURI(vm.datastreamComment.comment);
                vm.datastreamComment.reset();
            }
            var prm = _.clone(stream);
            delete prm.id;
            prm = _.mapValues(prm, function (val) { return val === undefined ? null : val }) // Se passo valori undefined questi non vengono realmente passati, quindi risulta impossibile sbiancarli
            if (!idResource) {
                detailsFactory.postBytestreamResource(idMedia, idBytestream, resource, comment, prm)
                    .then(function (data) {
                        successPutBytestreamDatastream(data, "create");
                    })
                    .catch(function (err) {
                        $log.error(err);
                        var feedback = {
                            title: "Errore",
                            msg: "C'è stato un errore nello scaricamento dei dati",
                            close: true
                        };
                        $uiMrFeedback.error(feedback);
                    });
            }
            else {
                //if(vm.activeTab==="MainData"){
                detailsFactory.putBytestreamResource(idMedia, idBytestream, resource, idResource, comment, prm)
                    .then(function (data) {
                        successPutBytestreamDatastream(data, "update");
                    })
                    .catch(function (err) {
                        $log.error(err);
                        var feedback = {
                            title: "Errore",
                            msg: "C'è stato un errore nello scaricamento dei dati",
                            close: true
                        };
                        $uiMrFeedback.error(feedback);
                    });
                //}
            }
        };
        var successPutBytestreamDatastream = function (data, action) {
            vm.mediaStatus = angular.toJson(vm.media);
        };
        vm.prepareGetBytestream = function () {
            var prm = {
                "bytestream": true
            };
            getMedia(prm, successGetBytestream);
        };
        var getTranscodingValue = function (transcoding, value, transcodingFunc, transcodingForm, datastream, key) {
            var getValue = $http.post(
                transcoding, value
            )
                .then(function (data) {
                    vm[transcodingFunc](data, transcodingForm, datastream, key);
                })
                .catch(function (err) {
                    var errMsg = err.data ? err.data.message || err.data : err;
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nello scaricamento dei dati: " + errMsg,
                        close: true
                    };
                    $uiMrFeedback.error(feedback);
                });
        }
        vm.setTranscodingTemplate = function (data, map, datastream, key) {
            var form = fetchFromObject(vm.schemaForm, map);
            if (data.data.length === 0) {
                form.titleMap = [
                    { "value": 0, "title": "Nessun instanza associata." }
                ];
            }
            else {
                form.titleMap = data.data;
            }
            vm.media.datastream[datastream][key] = form.titleMap;
            $timeout(function () { vm.mediaStatus = angular.toJson(vm.media); }, 200);
        };
        var getMediaDatastream = function (datastream) {
            var obj = {};
            obj.resource1 = "media";
            obj.element1 = $stateParams.id;
            obj.datastream = datastream;
            detailsFactory.getMedia(obj)
                .then(function (data) {
                    if (datastream === "all") {
                        vm.media.datastream = data.datastream;
                    }
                    else {
                        vm.media.datastream = vm.media.datastream || {};
                        vm.media.datastream[datastream] = data.datastream[datastream] || {};
                        setTag(datastream, vm.media.datastream[datastream]);
                        _.forEach(vm.schemaForm.datastream[vm.media.MainData.type][datastream].schema.properties, function (value, key) {
                            var transcoding = vm.schemaForm.datastream[vm.media.MainData.type][datastream].schema.properties[key] && vm.schemaForm.datastream[vm.media.MainData.type][datastream].schema.properties[key].transcoding;
                            if (transcoding) {
                                var nameServerTranscoding = transcoding.match("##(.*)##");
                                if (nameServerTranscoding) {
                                    var serverTranscoding = CONFIG[nameServerTranscoding[1]];
                                    transcoding = transcoding.replace(nameServerTranscoding[0], serverTranscoding);
                                }
                                var transcodingFunc = vm.schemaForm.datastream[vm.media.MainData.type][datastream].schema.properties[key].transcodingFunc;
                                var transcodingForm = vm.schemaForm.datastream[vm.media.MainData.type][datastream].schema.properties[key].transcodingForm.replace("||type||", vm.media.MainData.type);
                                var valToSend = {};
                                valToSend[key] = vm.media.datastream[datastream][key];
                                if (valToSend[key]) {
                                    getTranscodingValue(transcoding, valToSend, transcodingFunc, transcodingForm, datastream, key);
                                }
                                else {
                                    var form = fetchFromObject(vm.schemaForm, transcodingForm);
                                    form.titleMap = [
                                        { "value": 0, "title": "Nessun instanza associata." }
                                    ];
                                }
                            }
                        });
                        if (datastream === "VideoScenes") {
                            if (vm.media.datastream[datastream] && vm.media.datastream[datastream].request_id) {
                                startVideoScenePeriodicRequest();
                            }
                        }
                    }
                    vm.mediaStatus = angular.toJson(vm.media);
                })
                .catch(function (err) {
                    $log.error(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nello scaricamento dei dati",
                        close: true
                    };
                    $uiMrFeedback.error(feedback);
                });
        };

        var getBytestreamDatastream = function (idMedia, idBt, datastream) {
            detailsFactory.getBytestreamDatastream(idMedia, idBt, datastream)
                .then(function (data) {
                    vm.bytestreamActive.datastream = vm.bytestreamActive.datastream || {};
                    vm.bytestreamActive.datastream[datastream] = data[datastream] || {};
                    setTag(datastream, vm.bytestreamActive.datastream[datastream]);
                    _.forEach(vm.schemaForm.datastream[vm.media.MainData.type][datastream].schema.properties, function (value, key) {
                        var transcoding = vm.schemaForm.datastream[vm.media.MainData.type][datastream].schema.properties[key] && vm.schemaForm.datastream[vm.media.MainData.type][datastream].schema.properties[key].transcoding;
                        if (transcoding) {
                            var nameServerTranscoding = transcoding.match("##(.*)##");
                            if (nameServerTranscoding) {
                                var serverTranscoding = CONFIG[nameServerTranscoding[1]];
                                transcoding = transcoding.replace(nameServerTranscoding[0], serverTranscoding);
                            }
                            var transcodingFunc = vm.schemaForm.datastream[vm.media.MainData.type][datastream].schema.properties[key].transcodingFunc;
                            var transcodingForm = vm.schemaForm.datastream[vm.media.MainData.type][datastream].schema.properties[key].transcodingForm.replace("||type||", vm.media.MainData.type);
                            var valToSend = {};
                            valToSend[key] = vm.bytestreamActive.datastream[datastream][key];
                            if (valToSend[key]) {
                                getTranscodingValue(transcoding, valToSend, transcodingFunc, transcodingForm, datastream, key);
                            }
                            else {
                                var form = fetchFromObject(vm.schemaForm, transcodingForm);
                                form.titleMap = [
                                    { "value": 0, "title": "Nessun instanza associata." }
                                ];
                            }
                        }
                    });
                    vm.mediaStatus = angular.toJson(vm.media);
                })
                .catch(function (err) {
                    $log.error(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nello scaricamento dei dati",
                        close: true
                    };
                    $uiMrFeedback.error(feedback);
                });
        };

        vm.getChildrenError = {
            collection: null,
            folder: null
        };
        vm.getColChildren = function (type, id) {
            detailsFactory.getColChildren(type, id)
                .then(function (data) {
                    if (data[0]) {
                        DamCollectionManagerService.initTree(type, vm.treeConfig, data, true, false);
                    }
                    else {
                        vm.getChildrenError[type] = "Nessuna " + (type === 'collection' ? "collezione" : "cartella") + " disponibile"
                    }
                    var prm = {};
                    prm[type] = true;
                    getMedia(prm, successGetRelatedCol);
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
            vm.mediaStatus = angular.toJson(vm.media);
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
            detailsFactory.postColRelatedMedia(vm.activeTab, idCol, prm)
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
                        msg: "C'è stato un errore nel salvataggio dei dati",
                        close: true
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
                    msg: "Non è possibile procedere con l'eliminazione del media",
                    close: true
                };
                $uiMrFeedback.warning(feedback);
                return;
            }
            detailsFactory.deleteColRelatedMedia(vm.activeTab, idCol, idMedia)
                .then(function (data) {
                })
                .catch(function (err) {
                    console.log(err);
                    var feedback = {
                        title: "Error",
                        msg: "C'è stato un errore nell'elaborazione dei dati",
                        close: true
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
        vm.relatedMedia = null;
        var getRelatedMedia = function (idMedia) {
            var obj = {};
            obj.resource1 = "media";
            obj.element1 = $stateParams.id;
            obj.RelatedMedia = true;
            detailsFactory.getMedia(obj)
                .then(function (data) {
                    var related = data.RelatedMedia ? _.clone(data.RelatedMedia) : [];
                    DamRelatedMediaService.setObjList(related, true);
                    var selected = data.RelatedMedia ? _.clone(data.RelatedMedia) : [];
                    ListItemsService.setObjSelected(selected);
                    vm.init.mediaCollegati = true;
                })
                .catch(function (err) {
                    $log.error(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nello scaricamento dei dati",
                        close: true
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        vm.damSearchTemplateOptions = {
            "listItems": true,
            "inputSearch": true
        };
        var damSearchComponents = {
            "listItems": false
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
        var setMediaSelected = $scope.$on("listItemsSetObjSelected", function (event, obj, objs, action) {
            if (action === "add") {
                var medias = [obj];
                addRelatedMedia(medias);
            }
        });
        var addRelatedMedia = function (medias, next) {
            var prm = {
                addMedias: []
            };
            _.forEach(medias, function (media) {
                prm.addMedias.push(media.id);
            });
            detailsFactory.postRelatedMedia(vm.media.id, prm)
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
                        msg: "C'è stato un errore nel salvataggio dei dati",
                        close: true
                    };
                    $uiMrFeedback.error(feedback);
                    _.forEach(medias, function (media) {
                        ListItemsService.removeObjSelected(media);
                    });
                });
        };
        var removeMediaSelected = $scope.$on("damRelatedMediaRemoveObjList", function (event, obj, objs) {
            removeRelatedMedia(obj);
        });
        var removeRelatedMedia = function (media) {
            var idMedia = vm.media.id;
            var idRelMedia = media.id;
            if (!idMedia || !idRelMedia) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Non è possibile procedere con l'eliminazione del media",
                    close: true
                };
                $uiMrFeedback.warning(feedback);
                return;
            }
            detailsFactory.deleteRelatedMedia(idMedia, idRelMedia)
                .then(function (data) {
                    ListItemsService.removeObjSelected(media, true);
                })
                .catch(function (err) {
                    console.log(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nell'elaborazione dei dati",
                        close: true
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        vm.toggleSearch = function (state) {
            if (!state) {
                FilterSearchService.setFiltersApplied([]);
                var selected = _.clone(DamRelatedMediaService.getObjList());
                ListItemsService.setObjSelected(selected);
                vm.damSearch = true;
                $timeout(function () { $scope.$broadcast('damSearchTriggerRequestSearch'); }, 200, false);
            }
            else {
                vm.damSearch = false;
            }
        };
        vm.downloadPopover = {
            templateUrl: 'detailsDownloadPopoverTemplate.html',
            isOpen: false
        };
        vm.populateDownloadPopover = function (doc) {
            vm.downloadPopover.doc = vm.media.MainData;
            vm.downloadPopover.doc.id = vm.media.id;
            vm.downloadPopover.doc.bytestream = vm.media.bytestream;
            vm.downloadPopover.fileTypes = CONFIG.fileTypes[vm.media.MainData.type];
            vm.mediaStatus = angular.toJson(vm.media);
        };
        vm.addStream = {
            templateUrl: 'addStreamTemplate.html'
        };
        vm.prepareOpenBatchModal = function (img, rename) {
            var bts = _.find(vm.media.bytestream, { "name": img });
            var url = bts && bts.url ? bts.url : CONFIG.serverRoot + CONFIG.instance + "/get/" + vm.media.id + "/" + img;
            var obj = [{
                id: vm.media.id,
                name: rename ? null : img,
                img: url
            }];
            DamActionBatchService.setObjList(obj);
            openBatchModal();
        };
        var modalBatchInstance;
        var openBatchModal = function () {
            modalBatchInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modal-actionBatchDetails.html',
                appendTo: angular.element(".details"),
                openedClass: "modal-actionBatch modal-editor",
                controller: function ($scope, $uibModalInstance) {
                    $scope.closeModalConfirm = function () {
                        $uibModalInstance.close();
                    };
                }
            });
        };
        $rootScope.$on("damSearchModalBatchInstance", function (event, action) {
            if (action === "close" && modalBatchInstance)
                modalBatchInstance.close();
        });
        vm.dropzoneConfig = {
            url: CONFIG.serverRoot + CONFIG.instance + '/upload',
            maxFiles: 1,
            parallelUploads: 1,
            maxFilesize: 3000,
            previewTemplate: $('#preview-template').html(),
            thumbnailWidth: null,
            thumbnailHeight: null,
            headers: {
                accept: '*/*'
            },
            init: function () {
                this.on("addedfile", function (file) {
                    vm.dropzoneHasOneBytestream = true;
                    $scope.$apply();

                });
                this.on("success", function (file, response) {
                    if (!replaceMediaActive) {
                        vm.addedBytestream = {
                            "addBytestream": [{
                                name: "",
                                url: typeof response === "object" ? response.response : response
                            }]
                        };
                    }
                    else {
                        vm.replaceMedia = {
                            "url": typeof response === "object" ? response.response : response
                        };
                    }
                    $scope.$apply();
                });
                this.on("error", function (file, response) {

                });
            }
        };
        vm.dropzoneHasOneBytestream = false;
        vm.addedBytestream = {};
        vm.addedBytestreamName = "";
        var feedInstAddByte;
        vm.prepareAddBytestream = function () {
            var check = _.isEmpty(vm.addedBytestream) || !vm.addedBytestreamName;
            if (check) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Devi caricare un elemento e dargli un nome per poterlo salvare",
                    close: true
                };
                $uiMrFeedback.warning(feedback);
                return;
            }
            var feedback = {
                title: "Attendi",
                msg: "Elaborazione dei dati in corso..."
            };
            feedInstAddByte = $uiMrFeedback.open(feedback);
            vm.addedBytestream.addBytestream[0].name = vm.addedBytestreamName.replace(/ /g, "");
            postBytestream(vm.addedBytestream, successPostBytestream);
        };
        var postBytestream = function (prm, next) {
            detailsFactory.postBytestream(vm.media.id, prm)
                .then(function (data) {
                    if (next)
                        next(prm, data);
                })
                .catch(function (err) {
                    console.log(err);
                    feedInstAddByte.title = "Attenzione";
                    feedInstAddByte.msg = "C'è stato un errore nel salvataggio dei dati";
                    feedInstAddByte.close = true;
                });
        };
        var successPostBytestream = function (bytestream, data) {
            feedInstAddByte.title = "Complimenti",
                feedInstAddByte.msg = "Stream salvato correttamente!"
            feedInstAddByte.close = true;
            $('#addBytestream').modal('hide');
            var prm = {
                "bytestream": true
            };
            getMedia(prm, successGetBytestream);
        };
        vm.prepareRemoveBytestream = function (id) {
            var feedback = {
                icon: 'fa-trash-o',
                iconType: 'danger',
                title: "Rimozione bytestream",
                msg: "Sei sicuro di voler eliminare definitivamente il bytestream?",
                close: false,
                autoClose: true,
                btnAction: [
                    {
                        text: "Conferma",
                        func: function () {
                            var objId = id;
                            removeBytestream(id, successRemoveBytestream);
                        }
                    },
                    {
                        text: "Annulla",
                        type: "grey",
                        // btnStyle: "background:#F66957;color:#FFF",
                        func: function () { }
                    }
                ]
            };
            $uiMrFeedback.warning(feedback);
        };
        var removeBytestream = function (idBytestream, next) {
            detailsFactory.deleteBytestream(vm.media.id, idBytestream)
                .then(function (data) {
                    if (next) {
                        next(idBytestream, data);
                    }
                })
                .catch(function (err) {
                    console.log(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nell'elaborazione dei dati",
                        close: true
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        var successRemoveBytestream = function (idBytestream, data) {
            var prm = {
                "bytestream": true
            };
            getMedia(prm, successGetBytestream);
        };
        var successGetBytestream = function (prm, data) {
            vm.media.bytestream = data.bytestream;
            vm.mediaStatus = angular.toJson(vm.media);
        };
        vm.openHistory = function () {
            var activeHistory = vm.activeTab;
            var prm = {
                history: activeHistory
            };
            var successGetHistory = function (prm, data) {
                if (prm.history === "all") {
                    vm.media.history = data.history;
                }
                else {
                    vm.media.history = vm.media.history || {};
                    vm.media.history[prm.history] = data.history;
                    vm.objHistory = vm.media.history[prm.history];
                }
                vm.mediaStatus = angular.toJson(vm.media);
            };
            if (vm.loadDatastream === "media")
                getMedia(prm, successGetHistory);
            else {
                getBytestreamDatastreamHistory(vm.media.id, vm.bytestreamActive.id, vm.activeTab, activeHistory);
            }
        };
        var getBytestreamDatastreamHistory = function (idMedia, idBt, activeHistory) {
            detailsFactory.getBytestreamDatastreamHistory(idMedia, idBt, activeHistory)
                .then(function (data) {
                    vm.objHistory = data.history;
                })
                .catch(function (err) {
                    $log.error(err);
                    var feedback = {
                        title: "Error",
                        msg: "C'è stato un errore nello scaricamento dei dati",
                        close: true
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        var historySelected = null;
        vm.setHistory = function (id, detailsId) {
            historySelected = {
                id: id,
                detailId: detailsId
            };
        };
        vm.rollback = function (version) {
            var prm = (version === "last" && vm.media.history[vm.activeTab])
                ?
                { "id": vm.media.history[vm.activeTab][0].id, "detailId": vm.media.history[vm.activeTab][0].detailId }
                : historySelected;
            if (!prm) {
                var feedback = {
                    title: "Attenzione",
                    msg: version === "last" ? "Nessuna versione a cui tornare" : "Devi selezionare la versione a cui vuoi tornare",
                    close: true
                };
                $uiMrFeedback.warning(feedback);
                return;
            }
            mainFactory.rollback(vm.activeTab, prm)
                .then(function (data) {
                    $log.info(data);
                    //successRollback(prm,data);
                })
                .catch(function (err) {
                    console.log(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nell'elaborazione dei dati",
                        close: true
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        var successRollback = function () {
            var prm = vm.activeTab === "MainData" ? { "MainData": true } : { "datastream": vm.activeTab };
            var successGetMediaFromRollback = function (prm, data) {
                /*if(prm.MainData){
                    vm.media.MainData = data.MainData;
                }
                else{
                    if(prm.datastream==="all"){
                        vm.media.datastream = data.datastream;
                    }
                    else{
                        vm.media.datastream = vm.media.datastream || {};
                        vm.media.datastream[prm.datastream] = data.datastream[prm.datastream] || {};
                    }
                }
                vm.mediaStatus = angular.toJson(vm.media);
                $("#history").modal("hide");*/
                if (prm.MainData) {
                    window.location.reload();
                }
                else {
                    $location.search("activeTab", prm.datastream);
                    window.location.reload();
                }
            };
            getMedia(prm, successGetMediaFromRollback);
        };
        vm.closeDetails = function () {
            var equal = angular.toJson(vm.media) === vm.mediaStatus;
            if (!equal) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Ci sono modifiche non salvate. \n Uscendo dalla sezione perderai i nuovi dati inseriti. \n Vuoi continuare senza salvare?",
                    close: false,
                    autoClose: true,
                    btnAction: [
                        {
                            func: vm.goToRouter,
                            params: ["main.list"],
                            text: "Ok"
                        },
                        {
                            func: function () { },
                            params: [],
                            text: "Annulla",
                            type: 'grey'
                            // btnStyle: "background:#F66957;color:#FFF"
                        }
                    ]
                };
                $uiMrFeedback.warning(feedback);
                return;
            }
            vm.goToRouter("main.list");
        }

        var replaceMediaActive = false;
        var feedInstReplaceMedia;
        var modalReplaceMediaInstance;
        vm.prepareReplaceMedia = function () {
            var check = _.isEmpty(vm.replaceMedia);
            if (check) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Devi caricare un elemento e dargli un nome per poterlo salvare",
                    close: true
                };
                $uiMrFeedback.warning(feedback);
                return;
            }
            var feedback = {
                title: "Attendi",
                msg: "Elaborazione dei dati in corso..."
            };
            feedInstReplaceMedia = $uiMrFeedback.open(feedback);
            postReplaceMedia(vm.replaceMedia, successPostReplaceMedia);
        };
        var postReplaceMedia = function (prm, next) {
            detailsFactory.postReplaceMedia(vm.media.id, prm)
                .then(function (data) {
                    if (next)
                        next(prm, data);
                })
                .catch(function (err) {
                    console.log(err);
                    feedInstReplaceMedia.title = "Attenzione";
                    feedInstReplaceMedia.msg = "C'è stato un errore nel salvataggio dei dati";
                    feedInstReplaceMedia.close = true;
                    $uibModalStack.dismissAll();
                });
        };
        var successPostReplaceMedia = function (prm, data) {
            feedInstReplaceMedia.title = "Complimenti",
                feedInstReplaceMedia.msg = "Media sostituito correttamente!"
            feedInstReplaceMedia.close = true;
            $uibModalStack.dismissAll();
            vm.media.datastream = {};
            getMainData();
        };
        vm.openModalReplaceMedia = function () {
            replaceMediaActive = true;
            vm.dropzoneHasOneBytestream = false;
            modalReplaceMediaInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modal-replaceMedia.html',
                appendTo: angular.element(".details"),
                openedClass: "modal-replaceMedia modal-editor",
                keyboard: false,
                controller: function ($scope, $uibModalInstance) {
                    $scope.details = vm;
                    $scope.closeModalConfirm = function () {
                        $uibModalInstance.close();
                    };
                }
            }).closed.then(function () {
                replaceMediaActive = false;
                vm.dropzoneHasOneBytestream = false;
                vm.replaceMedia = {};
            });
        };
        var modalAutoTag;
        vm.autoTagData;
        vm.selectedAutoTags = [];
        var autoTagPeriodicRequest;
        var tmpAutoTagLoop = 1;
        var startAutoTagPeriodicRequest = function () {
            autoTagPeriodicRequest = $interval(vm.launchAutoTagsRequest, 5000);
        }
        var stopAutoTagPeriodicRequest = function () {
            if (angular.isDefined(autoTagPeriodicRequest)) {
                $interval.cancel(autoTagPeriodicRequest);
                autoTagPeriodicRequest = undefined;
            }
        };
        vm.openAutoTag = function (e, d) {
            vm.selectedAutoTags = vm.media[vm.activeTab].tag || [];
            vm.doOpenAutoTag();
            if (!vm.autoTagData || vm.autoTagData.loadedFor !== vm.media.id || !vm.autoTagData.loaded) {
                vm.autoTagData = {};
                vm.autoTagData.loadedFor = vm.media.id;
                vm.autoTagData.loaded = false;
                
                vm.launchAutoTagsRequest();
            }
        };

        vm.launchAutoTagsRequest = function () {
            apiCall.imageAutoTagging(vm.media.id)
                .then(function (data) {
                    if (data && data.finished) {
                        stopAutoTagPeriodicRequest();
                        vm.autoTagData = data || {};
                        vm.autoTagData.loadedFor = vm.media.id;
                        vm.autoTagData.loaded = true;
                        // Add auto tags in autocomplete items
                        // try {
                        //     vm.schemaForm[vm.activeTab].schema.properties.tag.items = vm.schemaForm[vm.activeTab].schema.properties.tag.items || [];
                        //     var entities = data.entities.map(function (item) { return { label: item.label, value: item.label, score: item.score }; });
                        //     entities.sort(function(item1, item2) {
                        //         if (item1.score > item2.score) {
                        //             return 1;
                        //         } else if (item1.score < item2.score) {
                        //             return -1;
                        //         } else {
                        //             return 0;
                        //         }
                        //     });
                        //     var classes = data.classes.map(function (item) { return { label: item.label, value: item.label }; });
                        //     var items = entities.concat(classes);
                        //     var sameElements = _.intersection(vm.schemaForm[vm.activeTab].schema.properties.tag.items, items);
                        //     console.log(items, sameElements);
                        //     items = _.difference(items, sameElements);
                        //     vm.schemaForm[vm.activeTab].schema.properties.tag.items = vm.schemaForm[vm.activeTab].schema.properties.tag.items.concat(items);
                        //     $scope.$broadcast('schemaFormRedraw');
                        // } catch (e) { }
                    } else {
                        stopAutoTagPeriodicRequest();
                        startAutoTagPeriodicRequest();
                    }
                })
                .catch(function (err) {
                    vm.autoTagData = null;
                    var feedback = {
                        title: "Attenzione",
                        msg: "C'è stato un errore nel recupero della taggatura automatica"
                    };
                    feedInstReplaceMedia = $uiMrFeedback.error(feedback);
                    if (feedInstReplaceMedia) { feedInstReplaceMedia.close = true; }
                    stopAutoTagPeriodicRequest();
                    $uibModalStack.dismissAll();
                });
        };

        vm.doOpenAutoTag = function () {
            modalAutoTag = $uibModal.open({
                animation: false,
                templateUrl: 'modal-autoTag.html',
                appendTo: angular.element(".details"),
                openedClass: "modal-autoTag modal-editor",
                keyboard: false,
                controller: function ($scope, $uibModalInstance) {
                    $scope.details = vm;
                    $scope.closeModalConfirm = function () {
                        $uibModalInstance.close();
                    };
                }
            });
        };

        vm.toggleEntityTag = function (entity) {
            var idx = vm.selectedAutoTags.indexOf(entity);
            if (idx > -1) {
                vm.selectedAutoTags.splice(idx, 1);
            } else {
                vm.selectedAutoTags.push(entity);
            }
        };
        vm.addAutoTags = function () {
            $uibModalStack.dismissAll();
            try {
                var currentTags = vm.media[vm.activeTab].tag || [];
                var schemaTagItems = vm.schemaForm[vm.activeTab].schema.properties.tag.items || [];

                if (vm.selectedAutoTags) {
                    var redraw = false;
                    for (var i = 0; i < vm.selectedAutoTags.length; i++) {
                        var tag = vm.selectedAutoTags[i];
                        if (currentTags.indexOf(tag) < 0) {
                            redraw = true;
                            currentTags.push(tag);
                        }
                        if (schemaTagItems.indexOf(tag) < 0) {
                            redraw = true;
                            schemaTagItems.push({ label: tag, value: tag });
                        }
                    }
                    if (redraw) {
                        vm.schemaForm[vm.activeTab].schema.properties.tag.items = schemaTagItems;
                        vm.media[vm.activeTab].tag = currentTags;
                        $scope.$broadcast('schemaFormRedraw');
                    }
                }
            } catch (e) { }
        };
        vm.closeAutoTags = function() {
            $uibModalStack.dismissAll();
            stopAutoTagPeriodicRequest();
        };
        
        var actionBatchPostSuccess = $rootScope.$on('damActionBatchPostSuccess', function (ev, data) {
            if (data.bytestreamName === data.bytestreamNewName)
                _.remove(vm.media.bytestream, { name: data.bytestreamName });
            var bytestream = { name: data.bytestreamNewName };
            vm.media.bytestream.push(bytestream);
        });

        vm.isDisabledFeature = function (feature) {
            return MainService.disabledFeatures && MainService.disabledFeatures.indexOf(feature) !== -1;
        };

        // VIDEO SCENES
        vm.videoScenesRequest = {};
        var videoScenesPeriodicRequest;
        var startVideoScenePeriodicRequest = function () {
            videoScenesPeriodicRequest = $interval(vm.launchVideoScenesRequest, 20000);
        }
        var stopVideoScenesPeriodicRequest = function () {
            if (angular.isDefined(videoScenesPeriodicRequest)) {
                $interval.cancel(videoScenesPeriodicRequest);
                videoScenesPeriodicRequest = undefined;
            }
        };
        vm.launchVideoScenesRequest = function () {
            if (CONFIG.videoScenesUrl) {
                apiCall.videoScenes(vm.media.id) // La prima volta sarà undefined
                    .then(function (data) {
                        if (!vm.media.datastream.VideoScenes) { // TEMP
                            vm.media.datastream.VideoScenes = {};
                        }
                        if (!vm.media.datastream.VideoScenes.request_id) {
                            vm.media.datastream.VideoScenes.request_id = data.request_id;
                            vm.preparePutMedia();
                        } 
                        var mediaStatus = angular.fromJson(vm.mediaStatus);
                        mediaStatus.datastream = mediaStatus.datastream ? mediaStatus.datastream : [];
                        mediaStatus.datastream.VideoScenes.request_id = data.request_id;
                        vm.mediaStatus = angular.toJson(mediaStatus);
                        
                        vm.videoScenesRequest = data;
                        if (data.finished) {
                            stopVideoScenesPeriodicRequest();
                            vm.media.datastream.VideoScenes = vm.media.datastream.VideoScenes ? vm.media.datastream.VideoScenes : {};
                            vm.media.datastream.VideoScenes.metadata = _.clone(data.metadata) || [];
                            var mediaStatus = angular.fromJson(vm.mediaStatus);
                            mediaStatus.datastream.VideoScenes = _.clone(vm.media.datastream.VideoScenes) || [];
                            vm.mediaStatus = angular.toJson(mediaStatus);
                            getVideoUrl(vm.media);
                            vm.videoScenesRequest.error = false;
                        } else if (!angular.isDefined(videoScenesPeriodicRequest)) {
                            startVideoScenePeriodicRequest();
                        }
                    })
                    .catch(function (err) {
                        vm.videoScenesRequest.error = true;
                        var feedback = {
                            title: "Attenzione",
                            msg: "C'è stato un errore nella richiesta",
                            close: true
                        };
                        $uiMrFeedback.error(feedback);
                        stopVideoScenesPeriodicRequest();
                    });
            } else {
                var feedback = {
                    title: "Errore",
                    msg: "URL per richiedere le scene non configurato.",
                    close: true
                };
                $uiMrFeedback.error(feedback);
            }
        };
        var getVideoUrl = function (media) {
            var urlStream; 
            if (CONFIG.serverRootStream) {
                urlStream = CONFIG.serverRootStream + media.id + "/original";
            } else {
                if (media.bytestream) {
                    var videoByteStream = _.find(vm.media.bytestream, { "fileExtension": "mp4" });
                    urlStream = videoByteStream ? videoByteStream.urlStream : (media.bytestream[1] || media.bytestream[0]).urlStream;
                } 
            } 
            vm.videoUrl = $sce.trustAsResourceUrl(urlStream);
        };

        render();

        $scope.$on('$destroy', function () {
            stopVideoScenesPeriodicRequest();
        });

        $scope.$on("$stateChangeStart", function () {
            //syncInfo();
            listItemsReady();
            setMediaSelected();
            removeMediaSelected();
            actionBatchPostSuccess();
            $(window).off("resize.doResize");
            DamCollectionManagerService.refresh();
            DamRelatedMediaService.refresh();
            ListItemsService.refresh();
            FilterSearchService.refresh();
        });
    }
})();
