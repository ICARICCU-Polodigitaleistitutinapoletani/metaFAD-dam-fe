(function () {
    'use strict';

    angular
        .module('damSearchMdl')
        .directive('damSearch', damSearch);

    /** @ngInject */
    function damSearch() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/damSearch/damSearch.html',
            scope: {
                templateoptions: '='
            },
            controller: damSearchController,
            controllerAs: 'damSearch',
            bindToController: true
        };
        return directive;
    }

    /** @ngInject */
    function damSearchController($element, $scope, $rootScope, $log, damSearchFactory, DamSearchService, $timeout, ListItemsService, listFactory, InputSearchService, FilterSearchService, DamPaginationService, DamCollectionManagerService, $uibModal, DamActionBatchService, $uiMrFeedback, $window, checkResize, MainService, DamMultiDownloadService, MetadataMultiEditService) {
        // inizializzo una variabile che referenzia il modulo
        var vm = this;
        var render = function () {
            //vm.setActiveList(0);
            //requestSearch({});
        };
        var syncTemplateOptions = $scope.$on("damSearchSetTemplateOptions", function (event, obj) {
            _.forEach(obj, function (value, key) {
                vm.templateoptions[key] = value;
            });
        });
        vm.requestError = null;
        var requestSearch = function (prm) {
            $scope.$emit("damPaginationView", false);
            damSearchFactory.search(prm)
                .then(function (data) {
                    $scope.$emit("damSearchDone", data);
                    vm.requestError = null;
                })
                .catch(function (err) {
                    vm.requestError = err;
                });
        };
        var getAssetsForPage = function (height) {
            var listWidth = $element.find(".list")[0] ? $($element.find(".list")[0]).width() : null;
            if (!listWidth)
                return null;
            var objWidth = [
                { "min": 1450, "max": 1759, "perc": 13.3 },
                { "min": 1300, "max": 1449, "perc": 15.5 },
                { "min": 1125, "max": 1299, "perc": 18.5 },
                { "min": 975, "max": 1124, "perc": 23 },
                { "min": 825, "max": 974, "perc": 30 },
                { "min": 0, "max": 824, "perc": 45 }
            ];
            function getAssetsInHeight() {
                var assetWidth = (listWidth - 20) / assetsInWidth;
                var inHeight = parseInt((h - 32) / assetWidth);
                return inHeight;
            };
            var windowWhidth = $window.innerWidth;
            var h = parseInt(height);
            var perc;
            _.forEach(objWidth, function (value, key) {
                if (windowWhidth >= value.min && windowWhidth <= value.max)
                    perc = value.perc;
            });
            perc = perc || 10.35;
            var assetsInWidth = parseInt(100 / perc);
            var assetsInHeight = getAssetsInHeight();
            var assetsForPage = assetsInWidth * assetsInHeight;
            return assetsForPage;
        };
        var prepareRequestSearchWithPrm = function () {
            ListItemsService.setObjList(null);
            var qry = {};
            qry.sort = vm.arSort[vm.activeSort];
            qry.page = DamPaginationService.getSearchPage();
            qry.search = InputSearchService.getFiltersApplied();
            var searchQuery = InputSearchService.getQueryApplied();
            if (searchQuery)
                qry.search.push({ "text": searchQuery });
            qry.filters = FilterSearchService.getFiltersApplied();
            qry.filtersOR = FilterSearchService.getFiltersORApplied();
            var assetsForPage = getAssetsForPage(vm.containerHeight);
            qry.rowsPerPage = assetsForPage || parseInt(CONFIG.rowsPerPage);
            $timeout(function () {
                requestSearch(qry);
            }, 200);
        };
        var triggerRequestSearch = $scope.$on("damSearchTriggerRequestSearch", function () {
            prepareRequestSearchWithPrm();
        });
        var prepareRequestSearchHistory = function () {
            ListItemsService.setObjList(null);
            var qry = DamSearchService.getSearchHistoryPrm();
            var assetsForPage = getAssetsForPage(vm.containerHeight);
            if (assetsForPage)
                qry.rowsPerPage = assetsForPage;
            $timeout(function () {
                requestSearch(qry);
            }, 200);
        };
        var triggerRequestSearchHistory = $scope.$on("damSearchTriggerRequestSearchHistory", function () {
            prepareRequestSearchHistory();
        });
        var setContainerHeight = function (height) {
            var h = height - 70;
            return h;
        };
        if (vm.templateoptions.scrollable) {
            $scope.$watch('damSearch.templateoptions.scrollable.height',
                function (newValue, oldValue) {
                    vm.containerHeight = setContainerHeight(vm.templateoptions.scrollable.height) + "px";
                }
            );
        };
        vm.getMarginContentSearch = function () {
            var margin = 0;
            if (vm.templateoptions.actionBatch)
                margin = margin + 148;
            if (vm.templateoptions.sortedMenu)
                margin = margin + 159;
            if (vm.templateoptions.listTemplate)
                margin = margin + 116;
            if (margin !== 0)
                margin += 5;

            if (vm.templateoptions.searchSimilar &&
                (MainService.isEnabledFeature('searchSimilarImages')))
                margin += 37;
            return margin;
        };
        vm.activeList = 0;
        vm.setActiveList = function (list) {
            vm.activeList = list;
            MainService.activeList = list;
            $rootScope.$broadcast('listItemsChangeActiveList', list);
        };
        vm.activeSort = 0;
        vm.arSort = [
            { "field": "title", "order": "asc" },
            { "field": "title", "order": "desc" },
            { "field": "date", "order": "asc" },
            { "field": "date", "order": "desc" }
        ];
        vm.sortResults = function (n) {
            vm.activeSort = n;
            MainService.activeSort = n;
            $scope.$broadcast('damSearchTriggerRequestSearch');
        };
        vm.popoverSetting = {
            isOpen: false
        };
        var setPopoverState = $scope.$on("setPopoverState", function (event, state) {
            vm.popoverSetting.isOpen = state;
        });
        //var deleteMediaMassivePsw;
        vm.enableDeleteMediaMassive = function () {
            // if(deleteMediaMassivePsw)
            //     return prepareDeleteMediaMassive();
            var feedback = {
                title: "Abilita cancellazione",
                msg: "",
                templateBody: '<p>Inserisci la chiave per abilitare la cancellazione dei media:<br/><br/>' +
                    '<input ng-disabled="mrFeedback.feedback.msg" ng-model="mrFeedback.feedback.psw" type="text" /></p>' +
                    '{{mrFeedback.feedback.msg}}',
                templateButtons: '<div class="box-btnAction" ng-if="mrFeedback.feedback.msg">' +
                    '<div class="button-feedback" ng-click="mrFeedback.feedback.msg=\'\';mrFeedback.feedback.psw=\'\';">Riprova</div>' +
                    '</div>' +
                    '<div class="box-btnAction" ng-if="mrFeedback.feedback.btnAction">' +
                    '<button ng-repeat="button in mrFeedback.feedback.btnAction" class="button-feedback" ng-if="button.isVisible()" ' +
                    'style="{{button.btnStyle}}" data-type="{{button.type}}" ng-click="mrFeedback.action($index)">' +
                    '<i ng-if="button.icon" class="fa {{button.icon}}"></i>' +
                    '{{button.text}}' +
                    '</button>' +
                    '</div>',
                close: false,
                hideIcon: false,
                icon: 'fa-lock',
                btnAction: [
                    {
                        func: function () {
                            var pswUser = Tea.encrypt(mrFbkDeleteMediaMassiveInst.psw, "d3cr1p7P5w");
                            if (pswUser !== CONFIG.useKey)
                                return mrFbkDeleteMediaMassiveInst.msg = "Password errata";
                            mrFbkDeleteMediaMassiveInst.remove();
                            prepareDeleteMediaMassive();
                            //deleteMediaMassivePsw=true;
                        },
                        isVisible: function () {
                            return mrFbkDeleteMediaMassiveInst.msg === "";
                        },
                        params: [],
                        text: "Continua"
                    },
                    {
                        func: function () {
                            mrFbkDeleteMediaMassiveInst.remove();
                        },
                        isVisible: function () { return true; },
                        params: [],
                        text: "Annulla",
                        type: "grey"
                        // btnStyle: "background:#F66957;border-color:#b00;#color:#FFF"
                    }
                ]
            };
            var mrFbkDeleteMediaMassiveInst = $uiMrFeedback.open(feedback);
        };
        var prepareDeleteMediaMassive = function () {
            var deleteMedias;
            var deleteMediasSearch;
            switch (vm.actionBatchActive) {
                case 'selection':
                    deleteMedias = ListItemsService.getObjSelected();
                    break;
                case 'page':
                    deleteMedias = ListItemsService.getObjList();
                    break;
                case 'searched':
                    deleteMediasSearch = { search: DamSearchService.getSearchHistoryPrm().search, filters: DamSearchService.getSearchHistoryPrm().filters }
                    break;
            }
            if (deleteMedias && deleteMedias.length > 0) {
                var prm = {
                    medias: []
                };
                _.forEach(deleteMedias, function (value) {
                    prm.medias.push(value.id);
                });
                deleteMediaMassive(prm);
            }
            else {
                if (deleteMediasSearch) {
                    var prm = {
                        mediaSearch: deleteMediasSearch
                    };
                    deleteMediaMassive(prm);
                }
                else
                    setBatchError("Non hai ancora selezionato nessun elemento");
            }
        };
        var deleteMediaMassive = function (mediaToDelete) {
            damSearchFactory.removeMedias(mediaToDelete)
                .then(function (data) {
                    $scope.$emit('damSearchTriggerRequestSearchHistory');
                    ListItemsService.refreshObjSelected();
                })
                .catch(function (err) {
                    $log.error(err);
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore durante l'operazione"
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        vm.actionBatchType = null;
        vm.prepareOpenBatchModal = function (type) { // type='actionPanel'
            var batchMedia;
            var batchHistory;
            switch (vm.actionBatchActive) {
                case 'selection':
                    batchMedia = ListItemsService.getObjSelected();
                    break;
                case 'page':
                    batchMedia = ListItemsService.getObjList();
                    break;
                case 'searched':
                    batchHistory = { search: DamSearchService.getSearchHistoryPrm().search, filters: DamSearchService.getSearchHistoryPrm().filters }
                    break;
                default:
                    break;
            }
            if (batchMedia && batchMedia.length > 0) {
                var error;
                var medias = [];
                var indexObject = 0;
                var indexCicle = 0;
                _.forEach(batchMedia, function (media) {
                    if (media.type !== 'IMAGE' && media.type !== 'CONTAINER') {
                        error = true;
                    }
                    else {
                        if (media.type === 'CONTAINER') {
                            obj = {};
                            obj.resource1 = "container";
                            obj.element1 = media.id;
                            obj.ContainedMedia = true;
                            listFactory.getMedia(obj)
                                .then(function (data) {
                                    _.forEach(data.ContainedMedia, function (mediaCon) {
                                        var objCon = {
                                            id: mediaCon.id,
                                            name: null,
                                            img: CONFIG.filesServerRoot + CONFIG.instance + "/" + mediaCon.id + '/original'
                                        };
                                        medias.push(objCon);
                                        indexObject++;
                                    });
                                    indexCicle++;
                                    if (indexCicle === batchMedia.length)
                                        checkOpenBatchModal(medias, type, error);
                                })
                                .catch(function (err) {
                                    console.log(err);
                                    indexCicle++;
                                    if (indexCicle === batchMedia.length)
                                        checkOpenBatchModal(medias, type, error);
                                });
                        }
                        else {
                            var url = media.url || CONFIG.serverRoot + CONFIG.instance + "/get/" + media.id + "/original";
                            var obj = {
                                id: media.id,
                                name: null,
                                img: media.type === 'IMAGE' ? checkResize(url) : url
                            };
                            medias.push(obj);
                            indexCicle++;
                            if (indexCicle === batchMedia.length)
                                checkOpenBatchModal(medias, type, error);
                        }
                    }
                });
            }
            else {
                if (batchHistory) {
                    vm.openBatchModal(batchHistory, type);
                }
                else
                    setBatchError("Non hai ancora selezionato nessun elemento");
            }
        };
        var checkOpenBatchModal = function (medias, type, err) {
            if (!err) {
                vm.openBatchModal(medias, type);
            }
            else {
                setBatchError("L'operazione di modifica è applicabile solamente alle immagini");
            }
        }
        var listItemsOpenBatchEditor = $scope.$on("listItemsOpenBatchEditor", function (event, media) {
            var medias = [];
            medias.push({
                id: media.id,
                name: null,
                img: media.urlPreviewBig || media.url
            });
            vm.openBatchModal(medias, 'actionEditor');
        });
        var modalBatchInstance;
        vm.openBatchModal = function (batchMedia, type) { // type = 'actionPanel' | 'actionEditor'
            if (type === "actionEditor" && batchMedia.length > 1) {
                setBatchError("Puoi aprire nell'editor di modifica solo un'immagine alla volta");
                return;
            }
            if (batchMedia.search) {
                DamActionBatchService.setObjList([]);
                DamActionBatchService.setObjSearch(batchMedia);
            }
            else {
                DamActionBatchService.setObjList(batchMedia);
                DamActionBatchService.setObjSearch(null);
            }
            modalBatchInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modal-actionBatch.html',
                appendTo: angular.element("#damSearch"),
                openedClass: type === "actionEditor" ? "modal-actionBatch modal-editor" : "modal-actionBatch",
                controller: function ($scope, $uibModalInstance) {
                    $scope.actionBatchType = type;
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
        vm.actionBatchPopover = {
            templateUrl: 'actionBatchPopoverTemplate.html'
        };
        vm.batchError = null;
        var setBatchError = function (text) {
            vm.batchError = text;
            $timeout(function () {
                vm.batchError = null;
            }, 4000);
        };
        vm.actionBatchActive = "selection";
        vm.openEditorBatch = function (batchMedia) {
            EditorService.setObjMedia(batchMedia);
            vm.goToRouter("main.edit", {});
        };

        var onListItemReady = $scope.$on("listItemsReady", function (ev, ele) {
            var sort = vm.templateoptions.activeSort || 0;
            vm.activeSort = sort;
            MainService.activeSort = sort;
            var list = vm.templateoptions.activeList || 0;
            vm.setActiveList(list);
        });
        vm.isMultiDownloadEnabled = function () {
            return MainService.isEnabledFeature('multiDownload');
        }
        vm.startMultiDownload = function () {
            var batchMedia;
            var batchHistory;
            switch (vm.actionBatchActive) {
                case 'selection':
                    batchMedia = ListItemsService.getObjSelected();
                    break;
                case 'page':
                    batchMedia = ListItemsService.getObjList();
                    break;
                case 'searched':
                    batchHistory = { search: DamSearchService.getSearchHistoryPrm().search, filters: DamSearchService.getSearchHistoryPrm().filters }
                    console.log(DamSearchService.getSearchHistoryPrm());
                    break;
                default:
                    break;
            }
            if (batchMedia && batchMedia.length > 0) {
                var medias = [];
                console.log('batchMedia', batchMedia);
                _.forEach(batchMedia, function (media) {
                    if (media.type === 'CONTAINER') {
                        console.log(media);
                        var obj = {};
                        obj.resource1 = "container";
                        obj.element1 = media.id;
                        obj.ContainedMedia = true;
                        listFactory.getMedia(obj)
                            .then(function (data) {
                                _.forEach(data.ContainedMedia, function (mediaCon) {
                                    medias.push(mediaCon);
                                });
                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                    } else {
                        medias.push(media);
                    }
                });
                var started = DamMultiDownloadService.startDownload(medias);
                if (vm.actionBatchActive === 'selection' && started) {
                    ListItemsService.refreshObjSelected();
                    ListItemsService.clearObjSelectedInController();
                }
            } else {
                if (batchHistory) {
                    setBatchError("Non è possibile scaricare tutti i risultati in una volta sola");
                } else {
                    setBatchError("Non hai ancora selezionato nessun elemento");
                }
            }
        };
        var modalMultiEditInstance;
        vm.isMultiEditEnabled = function () {
            return MainService.isEnabledFeature('multipleEditing');
        }
        vm.startMultiEdit = function () {
            var batchMedia;
            var batchHistory;
            switch (vm.actionBatchActive) {
                case 'selection':
                    batchMedia = ListItemsService.getObjSelected();
                    break;
                case 'page':
                    batchMedia = ListItemsService.getObjList();
                    break;
                case 'searched':
                    batchHistory = { search: DamSearchService.getSearchHistoryPrm().search, filters: DamSearchService.getSearchHistoryPrm().filters }
                    console.log(DamSearchService.getSearchHistoryPrm());
                    break;
                default:
                    break;
            }
            if (batchMedia && batchMedia.length > 0) {
                var medias = [];
                console.log('batchMedia', batchMedia);
                _.forEach(batchMedia, function (media) {
                    if (media.type === 'CONTAINER') {
                        console.log(media);
                        var obj = {};
                        obj.resource1 = "container";
                        obj.element1 = media.id;
                        obj.ContainedMedia = true;
                        listFactory.getMedia(obj)
                            .then(function (data) {
                                _.forEach(data.ContainedMedia, function (mediaCon) {
                                    medias.push(mediaCon);
                                });
                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                    } else {
                        medias.push(media);
                    }
                });
                MetadataMultiEditService.setSelectedMedias(medias);
                vm.goToRouter("main.metadataMultiEdit", {});
            } else {
                if (batchHistory) {
                    setBatchError("Non è possibile modificare tutti i risultati in una volta sola");
                } else {
                    setBatchError("Non hai ancora selezionato nessun elemento");
                }
            }
        };
        $rootScope.$on("damSearchMultiEditInstance", function (event, action) {
            if (action === "close" && modalMultiEditInstance) {
                modalMultiEditInstance.close();
            }
        });
        //funzione che emette l'evento callRouter passandogli stato e parametri. Questo evento sarà ascoltato dal main controller che scatenerà il cambiamento di stato
        vm.goToRouter = function (state, params) {
            $scope.$emit('callRouter', state, params);
        };
        $scope.$on("$stateChangeStart", function () {
            setPopoverState();
            triggerRequestSearch();
            syncTemplateOptions();
            FilterSearchService.refresh();
            InputSearchService.refresh();
            onListItemReady();
        });

        vm.isSearchSimilarEnabled = function () {
            return MainService.isEnabledFeature('searchSimilarImages');
        };

        vm.searchByImage = function (mediaId) {
            var obj = {};
            obj.resource1 = "media";
            obj.element1 = mediaId;
            obj.bytestream = true;
            damSearchFactory.getMedia(obj)
                .then(function (data) {
                    var thumbnail = _.find(data.bytestream, function (oObj) {
                        return oObj && oObj.name === 'thumbnail';
                    });
                    var previewUrl = thumbnail ? thumbnail.url : '';
                    $scope.$broadcast("damSearchTriggerRequestSearchSimilar", mediaId, previewUrl);
                })
                .catch(function (err) {
                    $log.error(err);
                });
        };

        $scope.$on("damSearchTriggerSearchSimilar", function (event, id) {
            vm.searchSimilarImages(id);
        });

        vm.searchSimilarImages = function (id) {
            if (vm.templateoptions.filterSearch) {
                vm.searchByImage(id);
            } else {
                vm.goToRouter('main.list', { 'searchSimilarImg': id });
            }
        }
        vm.triggerSearchSimilarImages = function () {
            var batchMedia;
            switch (vm.actionBatchActive) {
                case 'selection':
                    batchMedia = ListItemsService.getObjSelected();
                    break;
                case 'page':
                    batchMedia = ListItemsService.getObjList();
                    break;
            }
            var err;
            if (batchMedia && batchMedia.length > 0) {
                if (batchMedia.length > 1) {
                    err = "Devi selezionare solo un elemento per accedere a questa funzionalità.";
                } else {
                    if (batchMedia[0].type !== 'IMAGE') {
                        err = "Questa funzionalità può essere utilizzata solo selezionando media di tipo immagine.";
                    } else {
                        vm.searchSimilarImages(batchMedia[0].id);
                    }
                }
            } else {
                err = "Devi selezionare un elemento immagine per accedere a questa funzionalità.";
            }
            if (err) {
                var feedback = {
                    title: "Attenzione",
                    msg: err,
                    close: true,
                    btnAction: null,
                    modal: true
                };
                $uiMrFeedback.open(feedback);
            }
        };
        vm.getSelectedNum = function () {
            return ListItemsService.getSelectedNum();
        };

        vm.getSelectedSize = function () {
            return ListItemsService.getSelectedSize() || 0;
        };
        vm.paginationVisible = false;
        $rootScope.$on('damPaginationInitPagination', function (_currentPage, _totPage) {
            if (_totPage > 0) {
                vm.paginationVisible = true;
            }
        });

        render();
    }
})();
