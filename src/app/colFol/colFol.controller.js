(function () {
    'use strict';

    angular
        .module('damApp')
        .controller('collectionFolderCtrl', collectionFolderCtrl);

    /** @ngInject */
    function collectionFolderCtrl($scope, $rootScope, $state, $stateParams, $timeout, MenuTabService, collectionFolderFactory, DamCollectionManagerService, DamSearchService, ListItemsService, InputSearchService, DamRelatedMediaService, FilterSearchService, MainService, refreshAngularCircle, $uiMrFeedback, $window, DamPaginationService, checkResize) {
        var vm = this;
        var render = function () {
            vm.setEditState(true, false);
            vm.getChildren(vm.type, 0);
            //MainService.setActiveState('main.collectionfolder|{"is_folder":"' + $stateParams.is_folder + '"}');
            $timeout(function () { activeTab() }, 300, false);
        };
        vm.cms = MainService.cms;
        vm.scrollHeight = {};
        var onDetectPosition = $scope.$on("detectPosition:onDetectPosition", function (ev, top, ele) {
            setScrollHeight(top, ele);
        });

        var setScrollHeight = function(top,ele){
            var height = $window.innerHeight-top-10;
            if (vm.cms) {
                height -= 44;
            }
            vm.scrollHeight[ele] = (height)+"px";
        };
        vm.toggle = function (variable) {
            if (!variable) {
                return true;
            }
            else {
                return false;
            }
        };
        vm.type = $stateParams.is_folder == 1 ? "folder" : "collection";
        var activeTab = function () {
            if ($stateParams.is_folder == 1) {
                MenuTabService.setMainActiveTab(3);
            }
            else {
                MenuTabService.setMainActiveTab(2);
            }
        };
        vm.damSearchTemplateOptions = {
            "listItems": true,
            "inputSearch": false
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
        var listActionSelected = "selected";
        var listItemsReady = $scope.$on("listItemsReady", function (event, ele) {
            damSearchComponents[ele] = true;
            checkEleLoaded(damSearchComponents);
            $scope.$broadcast("listItemsSetActionSelected", listActionSelected);
        });
        /*vm.damRelatedMediaTemplateOptions = {
            "actionType":"aggiungi"
        };*/
        var activateCollection = function (data) {
            DamCollectionManagerService.setActiveNode(data.options.instance, data.node, true);
            vm.colActive = data.node;
            refreshAngularCircle($scope);
        };
        vm.getChildrenError = null;
        vm.getChildren = function (type, id) {
            collectionFolderFactory.getChildren(type, id)
                .then(function (data) {
                    if (data[0]) {
                        DamCollectionManagerService.initTree(type, vm.treeConfig, data, true, false);
                    }
                    else {
                        vm.getChildrenError = "Nessuna " + (type === 'collection' ? "collezione" : "cartella") + " disponibile"
                    }
                })
                .catch(function (err) {
                    vm.getChildrenError = err;
                });
        };
        vm.tabState = {
            browsing: true,
            editing: false
        };
        var refactorTreeToSource = function (source) {
            var tree = [];
            _.forEach(source, function (value) {
                var node = {
                    "id": value.data && value.data.id,
                    "key": value.key,
                    "title": value.title,
                    "lazy": value.expanded ? false : value.lazy,
                    "folder": true,
                    "expanded": value.expanded
                };
                if (value.children && value.children.length > 0) {
                    node.children = refactorTreeToSource(value.children);
                }
                tree.push(node);
            });
            return tree;
        };
        vm.addFiltersApplied = function (key, value, search) {
            var obj = {};
            obj[key] = value;
            FilterSearchService.setFiltersApplied([obj]);
            vm.filtersApplied = FilterSearchService.getFiltersApplied();
            if (search)
                $scope.$broadcast('damSearchTriggerRequestSearch');
        };
        vm.treeConfig = {
            extensions: ["dnd", "glyph", "edit"],
            glyph: {
                map: {
                    doc: "fa fa-folder-o icon-folder",
                    docOpen: "fa fa-folder-open-o icon-folder",
                    dropMarker: "fa fa-arrow-right",
                    expanderClosed: "fa fa-caret-right",
                    expanderLazy: "fa fa-caret-right",
                    expanderOpen: "fa fa-caret-down",
                    folder: "fa fa-folder-o icon-folder",
                    folderOpen: "fa fa-folder-open-o icon-folder"
                }
            },
            lazyLoad: function (event, data) {
                var node = data.node;
                data.result = {
                    url: CONFIG.serverRoot + CONFIG.instance + "/" + vm.type + "/" + encodeURIComponent(node.key) + "/children",
                    cache: true
                };
            },
            renderNode: function (event, data) {
                var node = data.node;
                angular.element(node.span).find(".fa-trash").remove();
                var deleteButton = angular.element('<i class="fa fa-trash right"></i>');
                angular.element(node.span).append(deleteButton);
                deleteButton.click(function () {
                    deleteCollectionFolder(node);
                });
            }
        }
        vm.listTreeConfig = {
            browsing: {
                activate: function (event, data) {
                    FilterSearchService.setFiltersApplied([]);
                    DamCollectionManagerService.setActiveNode(data.options.instance, data.node, false);
                    var path = DamCollectionManagerService.getActivePath(data.options.instance);
                    vm.addFiltersApplied(data.options.instance, path, true);
                    vm.colActive = data.node;
                    //refreshAngularCircle($scope);
                },
                dnd: {
                    autoExpandMS: 400,
                    draggable: {
                        zIndex: 1000,
                        scroll: false,
                        revert: "invalid"
                    },
                    preventVoidMoves: true,
                    preventRecursiveMoves: true,
                    dragStart: function () { return false; },
                    dragEnter: function () { },
                    dragOver: function () { },
                    dragLeave: function () { },
                    dragStop: function () { },
                    dragDrop: function () { }
                },
                edit: {}
            },
            editing: {
                activate: function (event, data) {
                    FilterSearchService.setFiltersApplied([]);
                    DamCollectionManagerService.setActiveNode(data.options.instance, data.node, false);
                    var path = DamCollectionManagerService.getActivePath(data.options.instance);
                    vm.addFiltersApplied(data.options.instance, path, false);
                    vm.colActive = data.node;
                    //refreshAngularCircle($scope);
                    vm.toggleSearch(true);
                    getRelatedMedia(data.options.instance);
                },
                dnd: {
                    autoExpandMS: 400,
                    draggable: {
                        zIndex: 1000,
                        scroll: false,
                        revert: "invalid"
                    },
                    preventVoidMoves: true,
                    preventRecursiveMoves: true,
                    dragStart: function (node, data) {
                        if (node.parent.children.length > 1) {
                            node.parent.folder = true;
                        }
                        else {
                            node.parent.folder = false;
                        }
                        node.parent.renderStatus();
                        return true;
                    },
                    dragEnter: function (node, data) {
                        return true;
                    },
                    dragOver: function (node, data) {
                    },
                    dragLeave: function (node, data) {

                    },
                    dragStop: function (node, data) {
                        if (!data.otherNode) {
                            return;
                        }
                        if (node.parent.children.length > 0) {
                            node.parent.folder = true;
                        }
                        else {
                            node.parent.folder = false;
                        }
                        node.parent.renderStatus();
                    },
                    dragDrop: function (node, data) {
                        if (!data.otherNode) {
                            /*if(id==="multiDrag"){
                                var multiDragList = angular.element(data.draggable.element).attr("data-multi-drag-list");
                                vm.moveMedia.show = true;
                                vm.moveMedia.multiDoc = JSON.parse(multiDragList);
                                vm.moveMedia.col = node;
                                refreshAngularCircle($scope);
                                return
                            }*/
                            var docs = DamRelatedMediaService.getObjMoveList();
                            if (docs.length === 0)
                                return false;
                            vm.moveMedia.show = true;
                            vm.moveMedia.multiDoc = docs;
                            vm.moveMedia.col = node;
                            refreshAngularCircle($scope);
                            return;
                        }
                        var supLevelNodes = data.hitMode === "over" ? data.node.children : data.node.parent.children;
                        var existsSameNameNode = _.find(supLevelNodes, function(oObj) { return oObj.title === data.otherNode.title; });
                        if (existsSameNameNode) {
                            var feedback = {
                                title: "Impossibile spostare la " + (vm.type === 'collection' ? "collezione" : "cartella"),
                                msg: "Una " + (vm.type === 'collection' ? "collezione" : "cartella") + " con il nome \"" + data.otherNode.title + "\" esiste già a questo livello.",
                                close: true
                            };
                            $uiMrFeedback.error(feedback);
                            return;
                        } else {
                            data.otherNode.moveTo(node, data.hitMode);
                            if (node.children && node.children.length > 0) {
                                node.folder = true;
                            }
                            else {
                                node.folder = false;
                            }
                            node.renderStatus();
                            var sourceTree = refactorTreeToSource(data.tree.toDict());
                            DamCollectionManagerService.setTree(vm.type, sourceTree, true, false);
                            
                            var idParent = data.hitMode === "over" ? data.node.data.id : data.node.parent.key;
                            idParent = idParent.indexOf("root") > -1 ? "0" : idParent;
                            updateCollectionFolder(data.otherNode.data.id, data.otherNode.title, idParent);
                        }
                    }
                },
                edit: {
                    inputCss: { height: "18px", padding: "0", backgroundColor: "#eee", minWidth: "100%", border: "none" },
                    triggerCancel: ["esc", "tab", "click"],
                    triggerStart: ["f2", "dblclick", "shift+click", "mac+enter"],
                    beforeEdit: function (event, data) {
                    },
                    edit: function (event, data) {
                        console.log('***', data);
                    },
                    beforeClose: function (event, data) {
                    },
                    save: function (event, data) {
                        var idParent = data.node.parent.data.id || "0";
                        var existsSameNameNode = _.find(data.node.parent.children, function(oObj) { return oObj.title === data.input.val(); });
                        if (existsSameNameNode) {
                            var feedback = {
                                title: "Impossibile rinominare la " + (vm.type === 'collection' ? "collezione" : "cartella"),
                                msg: "Una " + (vm.type === 'collection' ? "collezione" : "cartella") + " con il nome \"" + data.input.val() + "\" esiste già a questo livello.",
                                close: true
                            };
                            $uiMrFeedback.error(feedback);
                            data.input.val(data.orgTitle);
                            return false;
                        } else {
                            updateCollectionFolder(data.node.data.id, data.input.val(), idParent);
                        }
                    },
                    close: function (event, data) {
                        data.node.render(); // Necessario per aggiungere nuovamente il pulsante di cancellazione
                    }
                }
            }
        };
        vm.moveMedia = {
            show: false,
            refresh: function () {
                vm.moveMedia.multiDoc = null;
                vm.moveMedia.doc = null;
                vm.moveMedia.col = null;
                DamRelatedMediaService.setObjMoveList([]);
            },
            close: function () {
                vm.moveMedia.show = false;
                vm.moveMedia.refresh();
            },
            copia: function () {
                DamCollectionManagerService.setActiveNode(vm.type, vm.moveMedia.col, false);
                var medias = vm.moveMedia.multiDoc ? vm.moveMedia.multiDoc : vm.moveMedia.doc ? [vm.moveMedia.doc] : null;
                if (!medias)
                    console.log("medias no setted");
                addRelatedMedia(medias, vm.moveMedia.col, addMediaDnDSuccess);
                vm.moveMedia.close();
            }
        }
        vm.setEditState = function (state, setConfig) {
            if (!state) {
                vm.tabState.browsing = false;
                vm.tabState.editing = true;
                vm.damSearch = false;
                vm.treeConfig.activate = vm.listTreeConfig.editing.activate;
                vm.treeConfig.dnd = vm.listTreeConfig.editing.dnd;
                vm.treeConfig.edit = vm.listTreeConfig.editing.edit;
                vm.damSearchTemplateOptions.inputSearch = true;
                listActionSelected = "aggiungi";
                if (vm.colActive) {
                    getRelatedMedia(vm.type);
                }
            }
            else {
                ListItemsService.setObjSelected([]);
                vm.tabState.browsing = true;
                vm.tabState.editing = false;
                vm.treeConfig.activate = vm.listTreeConfig.browsing.activate;
                vm.treeConfig.dnd = vm.listTreeConfig.browsing.dnd;
                vm.treeConfig.edit = vm.listTreeConfig.browsing.edit;
                vm.damSearchTemplateOptions.inputSearch = false;
                listActionSelected = "selected";
                if (vm.damSearch === true) {
                    $scope.$broadcast("listItemsSetActionSelected", listActionSelected);
                }
                else {
                    vm.damSearch = true;
                }
                if (vm.colActive) {
                    FilterSearchService.setFiltersApplied([]);
                    DamCollectionManagerService.setActiveNode(vm.type, vm.colActive, false);
                    var path = DamCollectionManagerService.getActivePath(vm.type);
                    $timeout(function () { vm.addFiltersApplied(vm.type, path, true) }, 300, false);
                }
            }
            InputSearchService.refresh();
            DamSearchService.setTemplateOptions(vm.damSearchTemplateOptions, true);
            if (setConfig)
                setTreeConfigPart();
        };
        var setTreeConfigPart = function () {
            var configValue = [
                { "key": "activate", "value": vm.treeConfig.activate },
                { "key": "dnd", "value": vm.treeConfig.dnd },
                { "key": "edit", "value": vm.treeConfig.edit }
            ];
            DamCollectionManagerService.setTreeConfigPart(vm.type, configValue, true);
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
                var path = DamCollectionManagerService.getActivePath(vm.type);
                vm.addFiltersApplied(vm.type, path, false);
                vm.damSearch = false;
                $timeout(function () {
                    if (vm.relMediaPage && vm.relMediaPages) {
                        DamPaginationService.initPagination(vm.relMediaPage, vm.relMediaPages);
                    }
                }, 200);
            }
        };
        vm.refreshActiveNode = function () {
            vm.colActive = null;
            DamCollectionManagerService.refreshActiveNode(vm.type, true);
        };
        vm.addCollectionFolder = function (idPar) {
            var title = (vm.type === "collection" ? "Collezione" : "Cartella") + " senza titolo";
            title = DamCollectionManagerService.checkTitleAndRename(vm.type, title);
            var idParent = vm.colActive ? vm.colActive.data.id : "0";
            var prm = {
                title: title,
                idParent: idParent
            };
            collectionFolderFactory.postCollectionFolder(vm.type, prm)
                .then(function (data) {
                    if (idParent == "0")
                        vm.getChildren(vm.type, 0);
                    else {
                        vm.expandNode(idParent);
                    }
                    vm.getChildrenError = '';
                })
                .catch(function (err) {
                    var feedback = {
                        title: "Errore",
                        msg: err
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        vm.expandNode = function (id) {
            if (id) {
                DamCollectionManagerService.addExpandNode(vm.type, id, "id", true);
            }
        };
        var updateCollectionFolder = function (idCol, title, idParent) {
            var prm = {
                title: title,
                idParent: idParent
            };
            collectionFolderFactory.putCollectionFolder(vm.type, idCol, prm)
                .then(function (data) {
                    vm.expandNode(idParent);
                })
                .catch(function (err) {
                    var feedback = {
                        title: "Errore",
                        msg: err
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        var deleteCollectionFolder = function (col) {
            collectionFolderFactory.deleteCollectionFolder(vm.type, col.data.id)
                .then(function (data) {
                    if (col === vm.colActive) {
                        vm.colActive = undefined;
                    }
                    var tree = col.tree;
                    col.remove();
                    var rootNode = tree.getRootNode();
                    var totChildren = rootNode && rootNode.children ? rootNode.children.length : 0;
                    if (totChildren <= 0) {
                        vm.getChildrenError = "Nessuna " + (vm.type === 'collection' ? "collezione" : "cartella") + " disponibile";
                    }
                    DamCollectionManagerService.removeNodeFromInstance(vm.type, col.key);
                })
                .catch(function (err) {
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nello scaricamento dei dati"
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        var getAssetsForPage = function (height) {
            var contWidth = $('.collectionFolder').find(".box-rightColumn")[0] ? $($('.collectionFolder').find(".box-rightColumn")[0]).width() : null;
            if (!contWidth)
                return null;
            function getAssetsInHeight() {
                var assetWidth = (contWidth - 20) / assetsInWidth;
                var inHeight = parseInt(h / assetWidth) - 1;
                return inHeight;
            }
            var frameWidth = 130;
            var h = parseInt(height);
            var assetsInWidth = parseInt(contWidth / frameWidth);
            var assetsInHeight = getAssetsInHeight();
            var assetsForPage = assetsInWidth * assetsInHeight;
            return assetsForPage;
        };
        getAssetsForPage();
        var getRelatedMedia = function (type) {
            var qry = {};
            qry.sort = { field: "title", order: "asc" };
            qry.page = DamPaginationService.getSearchPage();
            qry.search = [];
            qry.filters = [];
            var obj = {};
            obj[type] = DamCollectionManagerService.getActivePath(type);
            qry.filters.push(obj);
            var height = vm.scrollHeight['boxRightColumn'];
            var assetsForPage = getAssetsForPage(height);
            qry.rowsPerPage = assetsForPage || parseInt(CONFIG.rowsPerPage);
            collectionFolderFactory.searchRelatedMedia(qry)
                .then(function (data) {
                    var results = data.results;
                    var related = _.clone(results);
                    DamRelatedMediaService.setObjList(related, true);
                    var selected = _.clone(results);
                    ListItemsService.setObjSelected(selected);
                    vm.relMediaPage = data.page;
                    vm.relMediaPages = data.pages;
                    if (vm.relMediaPage && vm.relMediaPages) {
                        DamPaginationService.initPagination(vm.relMediaPage, vm.relMediaPages);
                    }
                })
                .catch(function (err) {
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nello scaricamento dei dati"
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        vm.openMediaPreview = function () {
            var relatedMedia = ListItemsService.getObjList();
            if (!relatedMedia || relatedMedia.length === 0) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Non ci sono media contenuti da visualizzare"
                };
                $uiMrFeedback.info(feedback);
                return;
            }
            var medias = [];
            _.forEach(relatedMedia, function (value) {
                var url = value.urlPreviewBig || value.url || CONFIG.serverRoot + CONFIG.instance + "/get/" + value.id + "/original";
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
        var setMediaSelected = $rootScope.$on("listItemsSetObjSelected", function (event, obj, objs, action) {
            if (action === "add" && vm.tabState.editing && vm.type === "folder") {
                if (obj.folder) {
                    var feedback = {
                        title: "Attenzione",
                        msg: "Il media è già presente in un'altra cartella. Lo vuoi spostare?",
                        btnAction: [
                            {
                                text: "Conferma",
                                func: function () {
                                    var medias = [obj];
                                    addRelatedMedia(medias, vm.colActive);
                                    alertInstance.remove();
                                }
                            },
                            {
                                text: "Annulla",
                                func: function () {
                                    alertInstance.remove();
                                    ListItemsService.removeObjSelected(obj, true);
                                },
                                type: "grey"
                                // btnStyle: "background:#F66957;border-color:#b00;#color:#FFF"
                            }
                        ],
                        close: false
                    };
                    var alertInstance = $uiMrFeedback.warning(feedback);
                    return;
                }
            }
            if (action === "add" && vm.tabState.editing) {
                var medias = [obj];
                addRelatedMedia(medias, vm.colActive);
            }
        });
        var addRelatedMedia = function (medias, col, next) {
            var prm = {
                addMedias: []
            };
            _.forEach(medias, function (media) {
                /*var path = DamCollectionManagerService.getActivePath(vm.type);
                var obj =  {
                    id:media.id,
                    path:path
                }*/
                prm.addMedias.push(media.id);
            });
            var idCol = col.data.id;
            if (!idCol) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Devi attivare una " + (vm.type === "collection" ? "collezione" : "cartella") + " prima di poter aggiungere un media!"
                };
                $uiMrFeedback.warning(feedback);
                return;
            }
            collectionFolderFactory.postRelatedMedia(vm.type, idCol, prm)
                .then(function (data) {
                    _.forEach(medias, function (media) {
                        DamRelatedMediaService.addObjList(media, true);
                    });
                    if (next)
                        next(medias, col);
                })
                .catch(function (err) {
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
        var addMediaDnDSuccess = function (medias, col) {
            DamCollectionManagerService.setActiveNode(vm.type, col, true);
        };
        var removeMediaSelected = $rootScope.$on("damRelatedMediaRemoveObjList", function (event, obj, objs) {
            removeRelatedMedia(obj);
        });
        var removeRelatedMedia = function (media) {
            var idCol = vm.colActive.data.id;
            var idMedia = media.id;
            if (!idCol || !idMedia) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Non è possibile procedere con l'eliminazione del media"
                };
                $uiMrFeedback.warning(feedback);
                return;
            }
            collectionFolderFactory.deleteRelatedMedia(vm.type, idCol, idMedia)
                .then(function (data) {
                    ListItemsService.removeObjSelected(media, true);
                })
                .catch(function (err) {
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore nell'elaborazione dei dati"
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        var triggerRequestSearch = $scope.$on("damSearchTriggerRequestSearch", function () {
            if (vm.tabState.editing && !vm.damSearch)
                getRelatedMedia(vm.type);
        });
        var eventReturnSelection = $scope.$on("listReturnSelection", function (event, ele) {
            vm.returnSelection();
        });
        vm.returnSelection = function (empty) {
            $scope.$emit('main:returnSelection', empty);
        };
        var onSuccessReturnSelection = $scope.$on('main:successReturnSelection', function (ev, obj) {
            MainService.setHistorySearch();
            ListItemsService.clearObjSelectedInController();
        });
        vm.totMedia = 0;
        
        $scope.$on("damSearchDone", function(event, data) {
            vm.totMedia = data ? data.length : 0;
        });
        $scope.$on("$stateChangeStart", function () {
            listItemsReady();
            setMediaSelected();
            removeMediaSelected();
            triggerRequestSearch();
            eventReturnSelection();
            onSuccessReturnSelection();
            DamCollectionManagerService.refresh();
            DamRelatedMediaService.refresh();
            ListItemsService.refresh();
            FilterSearchService.refresh();
        });
        render();
    }
})();
