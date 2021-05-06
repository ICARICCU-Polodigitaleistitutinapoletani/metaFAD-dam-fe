(function () {
    'use strict';

    /**
      *  @ngdoc function
      *  @name damApp.controller: AddmediaCtrl
      *  @description
      *  # AddmediaCtrl
      *  Controller of the damApp
      */
    angular.module('damApp')
        .controller('AddmediaCtrl', AddmediaCtrl)
        .factory('$parentScope', function ($window) {
            var parentScope = {};
            try {
                if ($window.parent.angular && $window.frameElement && $window.parent.angular.element($window.frameElement).scope()) {
                    parentScope = $window.parent.angular.element($window.frameElement).scope();
                }
                return parentScope;
            }
            catch (err) {
                return false;
            }
        });

    /** @ngInject */
    function AddmediaCtrl($window, $parentScope, $log, $scope, $rootScope, $timeout, $stateParams, $http, apiCall, $location, $document, MenuTabService, MainService, addMediaFactory, DamCollectionManagerService, mainFactory, $uiMrFeedback, refreshAngularCircle) {
        var vm = this;
        var render = function () {
            //MainService.setActiveState("main.addmedia");
            initSchema(CONFIG.schemaForm);
            addDatastream = MainService.addDatastream;
            $timeout(function () {
                if ($stateParams.boxFrame) {
                    MenuTabService.setView(false, true);
                    vm.boxFrame = true;
                }
                else {
                    MenuTabService.setMainActiveTab(1);
                }
            }, 300);
        };
        var setEleHeight = function (appHeight) {
            vm.eleHeight = {};
            vm.eleHeight.content = appHeight - 56 + "px";
        };
        setEleHeight(MainService.getAppHeight());
        $(window).on("resize.doResize", function () {
            $scope.$apply(function () {
                vm.eleHeight.content = MainService.getAppHeight($window.innerHeight) - 56 + "px";
            });
        });
        vm.goToRouter = function (state, params) {
            $scope.$emit('callRouter', state, params);
        };
        var initSchema = function (data) {
            if (!data || vm.schemaForm)
                return;
            vm.schemaForm = data;
        };
        var addDatastream = null;
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
                        var mapProp = "datastream.SIMPLE.SimpleData.schema.properties";
                        data.value.unshift(value);
                        MainService.setAutocompleteValue(vm.schemaForm, mapProp, key, data.value);
                    })
                    .catch(function (err) {
                        $log.error(err);
                    });
            }
        };
        var syncInfo = $scope.$on("mainSyncInformation", function (event, info) {
            initSchema(CONFIG.schemaForm);
        });
        vm.toggle = function (variable) {
            if (!variable) {
                return true;
            }
            else {
                return false;
            }
        };
        vm.saveMedias = function () {
            var addMedias = [];
            var related_collection = DamCollectionManagerService.getSelectedNode('collection');
            var related_folder = DamCollectionManagerService.getSelectedNode('folder') ? DamCollectionManagerService.getSelectedNode('folder')[0] : null;
            var validMedia = 0;
            $scope.files = orderFiles($scope.files);
            _.forEach($scope.files, function (file, key) {
                if (file.status !== 'error') {
                    validMedia = file.document.bytestream ? validMedia + 1 : validMedia;
                    var media = _.clone(file.document);
                    media.datastream = {};
                    _.forOwn(media.MainData, function (value, key) {
                        if (key.indexOf("~ref") !== -1) {
                            var stream = key.split("~")[1].split("-")[1];
                            var keyStream = key.split("~")[0];
                            if (!media.datastream[stream])
                                media.datastream[stream] = {};
                            media.datastream[stream][keyStream] = value;
                            delete media.MainData[key];
                        }
                    });
                    if (addDatastream) {
                        _.forEach(addDatastream, function (valueDs) {
                            for (var keyDs in valueDs) {
                                if (valueDs.hasOwnProperty(keyDs)) {
                                    if (media.datastream[keyDs]) {
                                        for (var keySds in valueDs[keyDs])
                                            media.datastream[keyDs][keySds] = valueDs[keyDs][keySds];
                                    }
                                    else {
                                        media.datastream[keyDs] = valueDs[keyDs];
                                    }
                                }
                            };
                        });
                    }
                    media.collection = [];
                    media.folder = "";
                    if (related_collection)
                        media.collection = related_collection;
                    else {
                        delete media.collection;
                    }
                    if (related_folder)
                        media.folder = related_folder;
                    else {
                        delete media.folder;
                    }
                    addMedias.push(media);
                }
            });
            // if (!validMedia) {
            if (validMedia !== $scope.files.length) {
                var feedback;
                if ($scope.files && $scope.files.length === 1 && $scope.files[0].status === 'error'
                    && this.maxSizeConfig && $scope.files[0].size > this.maxSizeConfig + 0.1) {
                    feedback = {
                        title: "Attenzione",
                        msg: "Ogni singolo media non deve superare " + this.maxSizeConfig + "MB in dimensione."
                    }
                } else {
                    feedback = {
                        title: "Attenzione",
                        // msg: "Devi caricare almeno un media valido per poter salvare."
                        msg: "Tutti i file caricati devono essere validi per poter salvare."
                    }
                    if (this.maxSizeConfig && this.maxSizeConfig > 0) {
                        feedback.msg += '\nTi ricordiamo che ogni singolo media non deve superare ' + this.maxSizeConfig + "MB in dimensione.";
                    }
                }
                $uiMrFeedback.warning(feedback);
                return;
            }
            var prm = {
                "addMedias": addMedias
            };
            if ($scope.rename) {
                if (!Number.isInteger(parseInt($scope.renameStartWith)) || !Number.isInteger(parseInt($scope.renameEndWith)) || !Number.isInteger(parseInt($scope.renameStep)) || parseInt($scope.renameStartWith) < 0 || parseInt($scope.renameEndWith) < 0 || parseInt($scope.renameStep) < 0) {
                    var feedback = {
                        title: "Attenzione",
                        msg: "Inserire un intero per i campi Inizio, Fine e Step della rinomina."
                    }
                    $uiMrFeedback.warning(feedback);
                    return;
                }
                if (parseInt($scope.renameStartWith) > parseInt($scope.renameEndWith)) {
                    var feedback = {
                        title: "Attenzione",
                        msg: "Il valore Fine deve essere maggiore del valore Inizio"
                    }
                    $uiMrFeedback.warning(feedback);
                    return;
                }
                prm.nomenclature = {
                    pattern: $scope.renameName,
                    start: parseInt($scope.renameStartWith),
                    end: parseInt($scope.renameEndWith),
                    step: parseInt($scope.renameStep)
                }
            }
            /*if($stateParams.containerId){
                prm.containerId = $stateParams.containerId;
            }*/
            postMedia(prm);
        };
        var postMedia = function (prm) {
            addMediaFactory.postMedia(prm)
                .then(function (data) {
                    // Spostata la funzione per aggiungere valori di datastream dall'esterno nelle funzione saveMedias
                    // if(addDatastream){
                    //     preparePostDatastream(data,successAddMedia);
                    //     return;
                    // }
                    successAddMedia(data);
                })
                .catch(function (err) {
                    var feedback = {
                        title: "Attenzione",
                        msg: "C'è stato un errore nel salvataggio dei dati"
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        var successAddMedia = function (data) {
            if ($stateParams.containerId) {
                var feedback = {
                    title: "Complimenti",
                    msg: "Media aggiunti con successo"
                };
                $uiMrFeedback.success(feedback);
                if ($parentScope)
                    $parentScope.$emit("addmediaAddMediaSuccess", data);
            }
            else {
                MainService.activeSort = 3;
                vm.goToRouter("main.list", {});
            }
        };
        var preparePostDatastream = function (idsMedia, next) {
            _.forEach(idsMedia.ids, function (value, key) {
                var idMedia = value;
                var resource;
                var prm;
                for (var keyDs in addDatastream[0]) {
                    if (addDatastream[0].hasOwnProperty(keyDs)) {
                        resource = keyDs;
                        prm = addDatastream[0][keyDs];
                    }
                };
                addMediaFactory.postMediaResource(idMedia, resource, prm)
                    .then(function (data) {
                        if (key === (idsMedia.ids.length - 1))
                            next(idsMedia);
                    })
                    .catch(function (err) {
                        if (key === (idsMedia.ids.length - 1))
                            next(idsMedia);
                    });
            });
        };
        var init = {
            collection: false,
            folder: false
        };
        var newColFol = {
            collection: {
                active: false,
                name: ""
            },
            folder: {
                active: false,
                name: ""
            }
        };
        vm.activeColFol = {
            collection: false,
            folder: false
        };
        vm.manageColFolder = function (type) {
            var active = vm.activeColFol[type];
            if (active) {
                vm.activeColFol[type] = false;
                return;
            }
            vm.activeColFol[type] = true;
            if (!init[type]) {
                getColChildren(type, 0);
            }
        };
        vm.getChildrenError = null;
        var getColChildren = function (type, id, next, nextPrm) {
            addMediaFactory.getColChildren(type, id)
                .then(function (data) {
                    DamCollectionManagerService.initTree(type, vm.treeConfig, data, true, false);
                    init[type] = true;
                    if (next) {
                        next.apply(this, nextPrm);
                    }
                })
                .catch(function (err) {
                    vm.getChildrenError = err;
                });
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
                    CONFIG.serverRoot + CONFIG.instance + "/" + data.options.instance + "/" + encodeURIComponent(node.key) + "/children"
                );
                request.then(
                    function (data) {
                        dfd.resolve(data.data);
                    }
                );
            },
            select: function (event, data) {
                if (!init[data.options.instance])
                    return;
                if (data.node.selected) {
                    if (data.options.instance === 'folder') {
                        var selected = DamCollectionManagerService.getSelectedNode('folder');
                        if (selected && selected[0]) {
                            DamCollectionManagerService.removeSelectedNode(data.options.instance, selected[0], "id", true);
                        }
                    }
                    DamCollectionManagerService.addSelectedNode(data.options.instance, data.node.data.id, "id", false);
                }
                else {
                    DamCollectionManagerService.removeSelectedNode(data.options.instance, data.node.data.id, "id", false);
                }
            }
        };
        vm.addColFol = function (type) {
            var title = vm.newColFol[type].name;
            if (!title) {
                var msg = "Devi scegliere un nome per la " + (type === "collection" ? "collezione" : "cartella");
                var feedback = {
                    title: "Attenzione",
                    msg: msg,
                    close: true
                };
                $uiMrFeedback.warning(feedback);
                return;
            }
            var idParent = "0";
            var prm = {
                title: title,
                idParent: idParent
            };
            addMediaFactory.postCollectionFolder(type, prm)
                .then(function (data) {
                    vm.newColFol[type].name = "";
                    vm.newColFol[type].active = false;
                    var nextPrm = [type, data];
                    getColChildren(type, 0, successAddColFol, nextPrm);
                })
                .catch(function (err) {
                    var feedback = {
                        title: "Attenzione",
                        msg: err
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        var successAddColFol = function (type, data) {
            init[type] = false;
            DamCollectionManagerService.addSelectedNode(type, data.id, "id", true);
            $timeout(function () { init[type] = true; }, 300, false);
        };

        var orderFiles = function (ar) {
            var orderedFiles = _.sortBy(ar, function (ele) {
                return ele.document.MainData.filename;
            });
            return orderedFiles;
        };

        vm.fileActive = null;
        vm.maxFilesConfig = MainService.uploadMaxFiles ? MainService.uploadMaxFiles : null;
        vm.maxSizeConfig = MainService.uploadMaxSize;
        $scope.dropzoneConfig = {
            url: CONFIG.serverRoot + CONFIG.instance + '/upload',
            parallelUploads: 3,
            previewTemplate: $('#preview-template').html(),
            maxFilesize: vm.maxSizeConfig + 0.1, // 0.1 necessario per includere i file esattamente grandi quando la dimensione massima consentita
            maxFiles: vm.maxFilesConfig,
            thumbnailWidth: null,
            thumbnailHeight: null,
            headers: {
                accept: '*/*'
            },
            init: function () {
                this.on("addedfile", function (file) {
                    $scope.empty = false;
                    $scope.$apply();
                    file.previewElement.addEventListener("click", function () {
                        $scope.selectPreview(file);
                    });
                    if (file.type.substr(file.type.indexOf('/') + 1) == 'pdf') {
                        this.emit("thumbnail", file, "img/default_pdf.png");
                    }
                    else if (file.type.substr(file.type.indexOf('/') + 1) == 'video') {
                        this.emit("thumbnail", file, "img/default_video.png");
                    }
                    else if (file.type.substr(file.type.indexOf('/') + 1) == 'zip') {
                        this.emit("thumbnail", file, "img/default_archive.png");
                    }
                    else if (file.type.substr(0, file.type.indexOf('/')) != 'image') {
                        this.emit("thumbnail", file, "img/default_document.png");
                    }
                });
                this.on("success", function (file, response) {
                    var extension = file.name.split('.').pop();
                    file.document = {
                        "MainData": {
                            filename: file.name,
                            title: file.name.slice(0, -(extension.length + 1))
                        },
                        "bytestream": typeof response === "object" ? response.response : response
                    };
                    if ($stateParams.containerId) {
                        file.document.containerId = $stateParams.containerId;
                    }
                    $scope.files.push(file);
                    if (!$scope.hasOneCompleteElement) {
                        $scope.hasOneCompleteElement = true;
                        var mapProp = "datastream.SIMPLE.SimpleData.schema.properties";
                        MainService.initAutocompleteSchemaForm(vm.schemaForm, mapProp, vm.getAutocomplete, null);
                        MainService.initTagSchemaForm(vm.schemaForm, mapProp, null);
                        $scope.selectPreview(file);
                    }
                    else {
                        $timeout(function () { }, false);
                    }
                });
                this.on("error", function (file, response) {
                    file.document = {
                        "MainData": {}
                    };
                    $scope.files.push(file);
                    if (!$scope.hasOneCompleteElement) {
                        $scope.hasOneCompleteElement = true;
                        var mapProp = "datastream.SIMPLE.SimpleData.schema.properties";
                        MainService.initAutocompleteSchemaForm(vm.schemaForm, mapProp, vm.getAutocomplete, null);
                        MainService.initTagSchemaForm(vm.schemaForm, mapProp, null);
                        $scope.selectPreview(file);
                    }
                    else {
                        $timeout(function () { }, false);
                    }
                });
            }
        };
        $scope.selectedFileMulti = {
            'MainData': {}
        };
        $scope.selectPreview = function (file) {
            $scope.toggleSelected(file);
            refreshAngularCircle($scope);
        };
        $scope.toggleSelected = function (file) {
            if (file.document) {
                if ($scope.keyDown && ($scope.keyDown.ctrlKey || $scope.keyDown.metaKey)) {
                    if (file.error) {
                        angular.element(file.previewElement.firstElementChild).addClass("active-error");
                        $scope.multipleSelectedFiles.forEach(function (otherFile) {
                            angular.element(otherFile.previewElement.firstElementChild).removeClass("active");
                        });
                        $scope.selectedFile = $scope.dropzone.files[startIndex];
                    }
                    else {
                        if (angular.element(file.previewElement.firstElementChild).hasClass("active")) {
                            if ($scope.multipleSelectedFiles.length > 1) {
                                var dropzoneIndex = $scope.multipleSelectedFiles.indexOf(file);
                                angular.element(file.previewElement.firstElementChild).removeClass("active");
                                $scope.multipleSelectedFiles.splice(dropzoneIndex, 1);
                                dropzoneIndex = (dropzoneIndex > 0) ? dropzoneIndex - 1 : 0;
                                $scope.selectedFile = $scope.dropzone.files[dropzoneIndex];
                            }
                        }
                        else {
                            angular.element(file.previewElement.firstElementChild).addClass("active");
                            $scope.multipleSelectedFiles.push(file);
                        }
                        var mapProp = "datastream.SIMPLE.SimpleData.schema.properties";
                        MainService.setTag(vm.schemaForm, $scope.selectedFileMulti.MainData, mapProp, null);
                    }
                    if ($scope.selectedFile && $scope.selectedFile.error) {
                        angular.element($scope.selectedFile.previewElement.firstElementChild).removeClass("active-error");
                    }
                }
                else if ($scope.keyDown && ($scope.keyDown.shiftKey)) {
                    $scope.multipleSelectedFiles.forEach(function (otherFile) {
                        angular.element(otherFile.previewElement.firstElementChild).removeClass("active");
                    });
                    $scope.multipleSelectedFiles = new Array();
                    var startIndex = 0;
                    var lastIndex = 0;
                    if ($scope.dropzone.files.indexOf(file) < $scope.dropzone.files.indexOf($scope.selectedFile)) {
                        var startIndex = $scope.dropzone.files.indexOf(file);
                        var lastIndex = $scope.dropzone.files.indexOf($scope.selectedFile);
                    }
                    else {
                        var startIndex = $scope.dropzone.files.indexOf($scope.selectedFile);
                        var lastIndex = $scope.dropzone.files.indexOf(file);
                    }
                    for (startIndex; startIndex <= lastIndex; startIndex++) {
                        if (!file.error) {
                            angular.element($scope.dropzone.files[startIndex].previewElement.firstElementChild).addClass("active");
                            $scope.multipleSelectedFiles.push($scope.dropzone.files[startIndex]);
                        }
                    }
                    var mapProp = "datastream.SIMPLE.SimpleData.schema.properties";
                    MainService.setTag(vm.schemaForm, $scope.selectedFileMulti.MainData, mapProp, null);
                }
                else {
                    $scope.multipleSelectedFiles.forEach(function (otherFile) {
                        angular.element(otherFile.previewElement.firstElementChild).removeClass("active");
                    });
                    $scope.multipleSelectedFiles = [];
                    $scope.multipleSelectedFiles.push(file);
                    angular.element(file.previewElement.firstElementChild).addClass("active");
                    var mapProp = "datastream.SIMPLE.SimpleData.schema.properties";
                    MainService.setTag(vm.schemaForm, file.document.MainData, mapProp, null);
                    $scope.selectedFile = file;
                }
            }
        };

        $scope.empty = true;
        $scope.keyDown = null;
        $scope.multipleSelectedFilesModel = {
            author: [],
            tag: [],
            category: []
        };
        $scope.multipleSelectedFiles = [];
        $scope.hasOneCompleteElement = false;
        $scope.files = [];
        $scope.selectedCollections = [];
        $scope.selectedFolders = [];
        $scope.newCollection = false;
        $scope.newFolder = false;
        $scope.newCollectionName = "";
        $scope.newFolderName = "";
        $scope.serverFiles = new Array();
        $scope.selectedCollections = [];
        $scope.selectedFolder = false;
        $scope.relatedCollectionFolder = new Array();
        $scope.collectionsFoldersList = new Array();

        $scope.getCollectionFolderFromId = function (collectionFolderID) {
            var collectionFolder;
            if ($scope.collectionsFoldersList) {
                $scope.collectionsFoldersList.forEach(function (tmpCollectionFolder) {
                    if (collectionFolderID == tmpCollectionFolder.id) {
                        collectionFolder = tmpCollectionFolder;
                    }
                });
            }
            return collectionFolder;
        };

        $scope.setCollectionFolder = function (collectionFolderID) {
            var tmpCollectionFolder = $scope.getCollectionFolderFromId(collectionFolderID);
            if (tmpCollectionFolder.id == -1) {
                $scope.newCollection = !$scope.newCollection;
            }
            else if (tmpCollectionFolder.id == -2) {
                $scope.newFolder = !$scope.newFolder;
            }
            if ($scope.relatedCollectionFolder.indexOf(parseInt(collectionFolderID)) == -1) {
                if ($scope.relatedCollectionFolder && tmpCollectionFolder.type_collectionFolder_s == 'folder') {
                    $scope.relatedCollectionFolder.forEach(function (relatedCollectionFolderID) {
                        var tmp1CollectionFolder = $scope.getCollectionFolderFromId(relatedCollectionFolderID)
                        if (tmp1CollectionFolder.type_collectionFolder_s == 'folder') {
                            tmp1CollectionFolder.selected = false;
                            $scope.relatedCollectionFolder.splice($scope.relatedCollectionFolder.indexOf(parseInt(relatedCollectionFolderID)), 1);
                        }
                    });
                }
                tmpCollectionFolder.selected = true;
                $scope.relatedCollectionFolder.push(parseInt(collectionFolderID));
            }
            else {
                tmpCollectionFolder.selected = false;
                $scope.relatedCollectionFolder.splice($scope.relatedCollectionFolder.indexOf(parseInt(collectionFolderID)), 1);
            }
        };

        $scope.setValueForSelectField = function (fieldIndex, values) {
            vm.schemaForm.datastream.SIMPLE.SimpleData.form[0].items[fieldIndex].items[0].select_models = [];
            for (var counter in values) {
                vm.schemaForm.datastream.SIMPLE.SimpleData.form[0].items[fieldIndex].items[0].select_models.push({ value: values[counter], label: values[counter] });
            }
        };

        $scope.getPreview = function (file) {
            return $(file.previewElement).find("img").attr("src");
        };

        $scope.removeFile = function (file) {
            $scope.dropzone.removeFile(file);
            $scope.files.splice($scope.files.indexOf(file), 1);
            $scope.multipleSelectedFiles = new Array();
            if (!$scope.dropzone.files.length) {
                $scope.hasOneCompleteElement = false;
                $scope.empty = true;
            }
            else {
                $scope.toggleSelected($scope.dropzone.files[0]);
                $scope.selectedFile = $scope.dropzone.files[0];
                return $(file.previewElement).find("img").attr("src");
            }
        };

        $scope.removeFiles = function (files) {
            files.forEach($scope.removeFile);
        }

        $scope.getMultipleSelectedFileSize = function () {
            var totalSize = 0;
            $scope.multipleSelectedFiles.forEach(function (file) {
                totalSize += file.size;
            });
            return $scope.getFileSize({ size: totalSize });
        }

        $scope.getFileSize = function (file) {
            if (file) {
                if (!file.size) {
                    return '-';
                }
                var size;
                if (file.size >= 1024 * 1024 * 1024 * 1024 / 10) {
                    size = (file.size / (1024 * 1024 * 1024 * 1024)).toFixed(2) + " TiB";
                }
                else if (file.size >= 1024 * 1024 * 1024 / 10) {
                    size = (file.size / (1024 * 1024 * 1024)).toFixed(2) + " GiB";
                }
                else if (file.size >= 1024 * 1024 / 10) {
                    size = (file.size / (1024 * 1024)).toFixed(2) + " MiB";
                }
                else if (file.size >= 1024 / 10) {
                    size = (file.size / (1024)).toFixed(2) + " KiB";
                }
                else {
                    size = (file.size).toFixed(2) + " b";
                }
                return size;
            }
        };

        $scope.getFileErrorDetails = function(file) {
            var details = '';
            if (file.status === 'error') {
                var fileSize = this.getFileSize(file);
                fileSize = fileSize ? fileSize.replace(/\D/gi, '') : fileSize;
                fileSize = fileSize ? parseInt(fileSize) : fileSize;
                if (fileSize && fileSize > (MainService.uploadMaxSize)) {
                    details += ': dimensioni oltre il limite consentito.';
                }
            }
            return details;
        };

        $scope.getFileType = function (file) {
            if (file) {
                return "." + file.type.substring(file.type.indexOf("/") + 1);
            }
        };
        $scope.getTotFilesToSave = function() {
            // var filesToSave = 0;
            // for (var i = 0; i < this.files.length; i++) {
            //     if (this.files[i].status !== 'error') {
            //         filesToSave++;
            //     }
            // }
            // return filesToSave; 
            return this.files.length;
        }
        $scope.updatedFormInput = function (modelValue, form) {
            if ($scope.multipleSelectedFiles.length == 1) {
                $scope.updatePreviewMark($scope.selectedFile);
            }
        };

        $scope.updatePreviewMark = function (file) {
            var empty = true;
            for (var key in file.document["MainData"]) {
                if (file.document["MainData"][key] && file.document["MainData"][key].length > 0) {
                    empty = false;
                }
            }
            if (empty) {
                angular.element(file.previewElement.children[2].firstChild).addClass("fa-check");
                angular.element(file.previewElement.children[2].firstChild).removeClass("fa-check-circle");
            }
            else {
                angular.element(file.previewElement.children[2].firstChild).removeClass("fa-check");
                angular.element(file.previewElement.children[2].firstChild).addClass("fa-check-circle");
            }
        };

        $scope.updateMultipleFormInupt = function () {
            _.forEach($scope.multipleSelectedFiles, function (file) {
                for (var key in $scope.selectedFileMulti.MainData) {
                    file.document["MainData"][key] = $scope.selectedFileMulti.MainData[key];
                }
            });
            $scope.toggleSelected($scope.multipleSelectedFiles[0]);
        };

        $scope.getSelectFieldValue = function (field) {
            apiCall.autocomplete(field, "").then(function (data) {
                var tagItems = [];
                if (data && data instanceof Array) {
                    data.forEach(function (item) {
                        var items;
                        if (item.tags_ss) {
                            items = item.tags_ss;
                        }
                        else if (item.authors_ss) {
                            items = item.authors_ss;
                        }
                        else if (item.category_ss) {
                            items = item.category_ss;
                        }
                        items.forEach(function (value) {
                            tagItems.push({
                                value: value,
                                label: value
                            })
                        });

                    });
                }
                else if (data) {
                    var items;
                    if (data.tags_ss) {
                        items = data.tags_ss;
                    }
                    else if (data.authors_ss) {
                        items = data.authors_ss;
                    }
                    else if (data.category_ss) {
                        items = data.category_ss;
                    }
                    items.forEach(function (value) {
                        tagItems.push({
                            value: value,
                            label: value
                        })
                    });
                }
                if (field == "tag") {
                    vm.schemaForm.datastream.SIMPLE.SimpleData.form[0].items[4].items[0].schema = {};
                    vm.schemaForm.datastream.SIMPLE.SimpleData.form[0].items[4].items[0].schema.items = tagItems;
                }
                else if (field == "author") {
                    vm.schemaForm.datastream.SIMPLE.SimpleData.form[0].items[1].items[0].schema = {};
                    vm.schemaForm.datastream.SIMPLE.SimpleData.form[0].items[1].items[0].schema.items = tagItems;
                }
                else if (field == "category") {
                    vm.schemaForm.datastream.SIMPLE.SimpleData.form[0].items[3].items[0].schema = {};
                    vm.schemaForm.datastream.SIMPLE.SimpleData.form[0].items[3].items[0].schema.items = tagItems;
                }
            });
        }
        $scope.setTag = function (newTag) {
            var item = {
                value: newTag,
                label: newTag
            };
            return item;
        };

        $scope.refreshAutocompleteFields = function () {
            vm.schemaForm.datastream.SIMPLE.SimpleData.form[0].items[1].items[0].options.tagging = $scope.setTag;
            vm.schemaForm.datastream.SIMPLE.SimpleData.form[0].items[3].items[0].options.tagging = $scope.setTag;
            vm.schemaForm.datastream.SIMPLE.SimpleData.form[0].items[4].items[0].options.tagging = $scope.setTag;
            //$timeout(function(){console.log(vm.schemaForm.datastream.SIMPLE.SimpleData);$scope.$broadcast('schemaFormRedraw');},300,false);
        }

        $document.keydown(function (e) {
            $scope.keyDown = e;
        });
        $document.keyup(function (e) {
            $scope.keyDown = null;
        });

        $scope.showArchiveField = function () {
            if ($scope.selectedFile && (($scope.selectedFile.type.substr($scope.selectedFile.type.indexOf('/') + 1) == 'zip' && $scope.multipleSelectedFiles.length == 1) || ($scope.selectedFile.isOnServer == true && $scope.selectedFile.extension == 'zip'))) {
                return true;
            }
            return false;
        }

        $scope.getServerFiles = function (URI) {
            apiCall.showFilesystem({ uri: URI }).then(function (data) {
                $scope.serverFiles = [];
                $scope.currentFilesystemURI = URI;
                data.forEach(function (tmpFile) {
                    tmpFile.isOnServer = true;
                    tmpFile.document = {
                        "MainData": {},
                        "bytstream": {
                            uri: tmpFile.path.substring(tmpFile.path.lastIndexOf('/') + 1),
                            path: tmpFile.path.substring(0, tmpFile.path.lastIndexOf('/'))
                        }
                    }
                    if (tmpFile.document["bytstream"].path == '') {
                        tmpFile.document["bytstream"].path = '.';
                    }
                    $scope.serverFiles.push(tmpFile);
                });
            })
        }

        $scope.timeStampToDate = function (timestamp) {
            var d = new Date(timestamp * 1000),
                yyyy = d.getFullYear(),
                mm = ('0' + (d.getMonth() + 1)).slice(-2),
                dd = ('0' + d.getDate()).slice(-2),
                hh = d.getHours(),
                h = hh,
                min = ('0' + d.getMinutes()).slice(-2),
                sec = ('0' + d.getSeconds()).slice(-2),
                time;

            time = dd + '/' + mm + '/' + yyyy + ' ' + h + ':' + min + ':' + sec;

            return time;
        }

        function getOriginalObjectFromCopy(masterArray, object) {
            return masterArray.filter(function (filterObject) {
                if (filterObject.id == object.id)
                    return filterObject;
            })[0];
        }

        /*function refactorTree(objects, parent){
            var returnObjects = new Array();
            var localObjects = angular.copy(objects);
            localObjects.forEach(function(object){
                if($location.search().related_collectionFolder == object.id){
                    object.selected = true;
                }
                if(parent && object.id_parent_collectionFolder_ii && object.id_parent_collectionFolder_ii.indexOf(parseInt(parent.id)) != -1){
                    returnObjects.push(object);
                    objects.splice(objects.indexOf(getOriginalObjectFromCopy(objects, object)),1);
                    object.childs = refactorTree(objects, object);
                }
                else if(parent == null && !object.id_parent_collectionFolder_ii){
                    returnObjects.push(object);
                    objects.splice(objects.indexOf(getOriginalObjectFromCopy(objects, object)),1);
                    object.childs = refactorTree(objects, object);
                }
                if(object.childs){
                    object.childs.forEach(function(child){
                        if(child.selected || child.lista){
                            object.lista = 1;
                        }
                    });
                }
            });

            return returnObjects;
        }


        $scope.collectionsFoldersList = new Array();
        apiCall.config()
                .then(function(data){

                    apiCall.showCollectionsFolders()
                        .then(function(data){
                            var tmpCollections = new Array();
                            var tmpFolders =  new Array();
                            data.response.docs.forEach(function(doc){
                                if($scope.relatedCollectionFolder.indexOf(parseInt(doc.id)) != -1){
                                    doc.selected = true;
                                }
                                else{
                                    doc.selected = false;
                                }
                                if(doc.type_collectionFolder_s == 'folder'){
                                    tmpFolders.push(doc);
                                }
                                else if(doc.type_collectionFolder_s == 'collection'){
                                    tmpCollections.push(doc);
                                }
                                $scope.collectionsFoldersList.push(doc);
                            });
                            $scope.collections = new Array();
                            $scope.folders = new Array();
                            $scope.collections = refactorTree(tmpCollections, null);
                            $scope.folders = refactorTree(tmpFolders, null);
                            $scope.collections.unshift({
                                id: -1,
                                title_collectionFolder_s: 'Crea nuova collezione',
                                type_collectionFolder_s: 'collection'
                            });
                            $scope.folders.unshift({
                                id: -2,
                                title_collectionFolder_s: 'Crea nuova cartella',
                                type_collectionFolder_s: 'folder'
                            });
                            $scope.collectionsFoldersList.unshift({
                                id: -1,
                                title_collectionFolder_s: 'Crea nuova collezione',
                                type_collectionFolder_s: 'collection'
                            });
                            $scope.collectionsFoldersList.unshift({
                                id: -2,
                                title_collectionFolder_s: 'Crea nuova cartella',
                                type_collectionFolder_s: 'folder'
                            });
                        });

                });*/

        $scope.collectionMultidropdownEvents = {
            onItemSelect: function (item) {
                if (item.id == -1) {
                    $scope.newCollection = true;
                }
            },
            onItemDeselect: function (item) {
                if (item.id == -1) {
                    $scope.newCollection = false;
                }
            },
            onUnselectAll: function () {
                $scope.newCollection = false;
            }


        }
        $scope.folderMultidropdownEvents = {
            onItemSelect: function (item) {
                if (item.id == -1) {
                    $scope.newFolder = true;
                }

            },
            onItemDeselect: function (item) {
                if (item.id == -1) {
                    $scope.newFolder = false;
                }
            },
            onUnselectAll: function () {
                $scope.newCollection = false;
            }

        }

        $scope.collectionMultidropdownSettings = {
            showCheckAll: false
        }

        $scope.folderMultidropdownSettings = {
            showCheckAll: false,
            selectionLimit: 1
        }

        $scope.multidropdownTranslation = {
            checkAll: 'Seleziona tutto',
            uncheckAll: 'Deseleziona tutto',
            selectionCount: ' ',
            buttonDefaultText: 'Seleziona'
        }

        //$scope.getServerFiles('/');

        $scope.getFilesystemCurrentPaths = function () {
            if ($scope.currentFilesystemURI) {
                return $scope.currentFilesystemURI.replace(/^\//, '').replace(/\/$/, '').split('/');
            }
            else {
                return [];
            }
        }

        $scope.getServerFilesFromIndex = function (folderIndexInURI) {
            var path = '/';
            var pathArray = $scope.getFilesystemCurrentPaths();
            for (var index = 0; index <= folderIndexInURI; index++) {
                $scope.getFilesystemCurrentPaths();
                path += pathArray[index] + '/';
            }
            $scope.getServerFiles(path);
        }

        $scope.openDirectory = function (dirName) {
            $scope.getServerFiles($scope.currentFilesystemURI + dirName + '/');
        }

        $scope.addFileFromServer = function (serverFile) {
            if ($scope.files.indexOf(serverFile) == -1) {
                $scope.files.push(serverFile);
                $scope.selectedFile = serverFile;
                $scope.hasOneCompleteElement = true;
            }
            else {
                $scope.files.splice($scope.files.indexOf(serverFile), 1);
                if (!$scope.files.length) {
                    $scope.hasOneCompleteElement = false;
                }
                else {
                    $scope.selectedFile = $scope.files[0];
                }
            }

        }

        render();

    };
})();
