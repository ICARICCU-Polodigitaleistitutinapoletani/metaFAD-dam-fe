(function () {
    'use strict';

    angular
        .module('damApp')
        .config(routeConfig);
    function routeConfig($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('main', {
                url: '/tecadam?instance&setState&disabledFeatures&cms&mediaType&singleSelection&externalFilters&externalFiltersOR&externalInput&constantFilters&addDatastream&historySearchId&searchSimilarImg&jwtToken',
                templateUrl: 'app/main/main.html',
                controller: "MainController",
                controllerAs: "main",
                //abstract: true,
                resolve: {
                    setJwtToken:['MainService', '$state', function(MainService, $state) {
                        MainService.setJwtToken($state.toParams.jwtToken);
                    }],
                    setInstance: ['MainService', '$state', function (MainService, $state) {
                        var instance = $state.toParams.instance;
                        if (instance) {
                            CONFIG.instance = instance;
                        }
                        MainService.initResource();
                    }],
                    setActiveState: ['MainService', '$state', function (MainService, $state) {
                        var state = $state.next.name;
                        var setState = $state.toParams.setState;
                        if (state && state !== "main") {
                            //if(setState){
                            MainService.setState = true;
                            var params = _.isEmpty($state.toParams) ? "" : "|" + angular.toJson($state.toParams);
                            MainService.setActiveState(state + params);
                            return;
                            //}
                            //state="main.list";
                            //MainService.refreshActiveState();
                        }
                    }],
                    setCms: ['MainService', '$state', function (MainService, $state) {
                        var cms = $state.toParams.cms;
                        if (cms && cms === "true") {
                            MainService.cms = true;
                        }
                    }],
                    /*setDisabledFeatures:['MainService','$state', function(MainService,$state){
                        var disabledFeatures = $state.toParams.disabledFeatures;
                        if(disabledFeatures){
                            try{
                                var objDisabledFeatures = JSON.parse(disabledFeatures);
                                MainService.disabledFeatures=objDisabledFeatures;
                            }
                            catch(err){
                                console.log("Error in disabledFeatures parameter: " + err);   
                            }
                        }
                    }],*/
                    setMediaType: ['MainService', '$state', function (MainService, $state) {
                        var mediaType = $state.toParams.mediaType;
                        if (mediaType) {
                            MainService.mediaType = mediaType;
                        }
                    }],
                    setSingleSelection: ['MainService', '$state', function (MainService, $state) {
                        var singleSelection = $state.toParams.singleSelection;
                        if (singleSelection && singleSelection === "true") {
                            MainService.singleSelection = true;
                        }
                    }],
                    setExternalSearch: ['MainService', '$state', function (MainService, $state) {
                        var externalFilters = $state.toParams.externalFilters;
                        externalFilters = externalFilters ? JSON.parse(decodeURI(externalFilters)) : undefined;
                        // var searchSimilarImg = $state.toParams.searchSimilarImg;
                        // if (searchSimilarImg) {
                        //     externalFilters = externalFilters ? externalFilters : [];
                        //     externalFilters.push({'searchSimilarImg': searchSimilarImg});
                        //     if (!_.find(externalFilters, function(oObj) {
                        //         return oObj && oObj.type === 'IMAGE'
                        //     })) {
                        //         externalFilters.push({'type': 'IMAGE'});
                        //     }
                        //     console.log('externalFilters', externalFilters);
                        // }
                        MainService.externalFilters = externalFilters;
                        
                        var externalFiltersOR = $state.toParams.externalFiltersOR;
                        if (externalFiltersOR) {
                            try {
                                MainService.externalFiltersOR = JSON.parse(decodeURI(externalFiltersOR));
                            }
                            catch (err) {
                                console.log(err);
                            }
                        }
                        var externalInput = $state.toParams.externalInput;
                        if (externalInput) {
                            MainService.externalInput = JSON.parse(decodeURI(externalInput));
                        }
                        var constantFilters = $state.toParams.constantFilters;
                        if (constantFilters) {
                            try {
                                MainService.constantFilters = JSON.parse(constantFilters);
                            }
                            catch (err) {
                                console.log("Error in constantFilters")
                            }
                        }

                        var searchSimilarImg = $state.toParams.searchSimilarImg;
                        if (searchSimilarImg) {
                            MainService.searchSimilarImg = searchSimilarImg;
                        }
                    }],
                    setHistorySearchId: ['MainService', '$state', function (MainService, $state) {
                        var historySearchId = $state.toParams.historySearchId;
                        if (historySearchId) {
                            MainService.historySearchId = historySearchId;
                            var history = MainService.getHistorySearch(historySearchId);
                            var mergeFilters = function (oldFilters, newFilters) {
                                var filters = [];
                                for (var i = 0; i < newFilters.length; i++) {
                                    for (var key in newFilters[i]) {
                                        var chiave = key;
                                        var value = newFilters[i][key];
                                        var exist = _.find(oldFilters, function (obj) {
                                            return obj[chiave] === value;
                                        });
                                        if (!exist)
                                            filters.push(newFilters[i]);
                                    }
                                }
                                filters = oldFilters.concat(filters);
                                return filters;
                            };
                            if (history) {
                                if (history.filters) {
                                    if (MainService.externalFilters) {
                                        MainService.externalFilters = mergeFilters(MainService.externalFilters, history.filters);
                                    }
                                    else {
                                        MainService.externalFilters = history.filters;
                                    }
                                }
                                if (history.search) {
                                    if (MainService.externalInput) {
                                        MainService.externalInput = mergeFilters(MainService.externalInput, history.search);
                                    }
                                    else {
                                        MainService.externalInput = history.search;
                                    }
                                }
                            }
                        }
                    }],
                    setAddDatastream: ['MainService', '$state', function (MainService, $state) {
                        var addDatastream = $state.toParams.addDatastream;
                        if (addDatastream) {
                            try {
                                var objAddDatastream = JSON.parse(addDatastream);
                                MainService.addDatastream = objAddDatastream;
                            }
                            catch (err) {
                                console.log("Error in addDatastream parameter: " + err);
                            }
                        }
                    }]
                }
            })
            .state('main.list', {
                url: '/list',
                templateUrl: 'app/list/list.html',
                controller: 'ListCtrl',
                controllerAs: 'list',
                resolve: {
                    initApp: ['$q', 'MainService', '$state', function ($q, MainService, $state) {
                        if (!MainService.initialized) {
                            return $q.reject("App Not initialized");
                        }
                    }],
                    searchHistory: ['MainService', function (MainService) {
                        var searchHistory = MainService.previousState === "main.details";
                        return searchHistory;
                    }]
                }
            })
            .state('main.addmedia', {
                url: '/addmedia?boxFrame&containerId',
                templateUrl: 'app/addMedia/addmedia.html',
                controller: 'AddmediaCtrl',
                controllerAs: 'addmedia',
                resolve: {
                    initApp: ['$q', 'MainService', function ($q, MainService) {
                        if (!MainService.initialized) {
                            return $q.reject("App Not initialized");
                        }
                    }]
                }
            })
            .state('main.container', {
                url: '/container',
                templateUrl: 'app/container/container.html',
                controller: 'ContainerCtrl',
                controllerAs: 'container',
                resolve: {
                    initApp: ['$q', 'MainService', function ($q, MainService) {
                        if (!MainService.initialized) {
                            return $q.reject("App Not initialized");
                        }
                    }]
                }
            })
            .state('main.container_edit', {
                url: '/container/:id?activeTab',
                templateUrl: 'app/container/container.html',
                controller: 'ContainerCtrl',
                controllerAs: 'container',
                resolve: {
                    initApp: ['$q', 'MainService', function ($q, MainService) {
                        if (!MainService.initialized) {
                            return $q.reject("App Not initialized");
                        }
                    }]
                }
            })
            .state('main.details', {
                url: '/details/:id?activeTab&fromContainer',
                templateUrl: 'app/details/details.html',
                controller: 'DetailsCtrl',
                controllerAs: 'details',
                resolve: {
                    initApp: ['$q', 'MainService', function ($q, MainService) {
                        if (!MainService.initialized) {
                            return $q.reject("App Not initialized");
                        }
                    }]
                }
            })
            .state('main.metadataMultiEdit', {
                url: '/metadataMultiEdit/',
                templateUrl: 'app/metadataMultiEdit/metadataMultiEdit.html',
                controller: 'MetadataMultiEditCtrl',
                controllerAs: 'metadataMultiEdit',
                resolve: {
                    initApp: ['$q', 'MainService', 'MetadataMultiEditService', function ($q, MainService, MetadataMultiEditService) {
                        if (!MainService.initialized) {
                            return $q.reject("App Not initialized");
                        }
                    }]
                }
            })
            .state('main.collectionfolder', {
                url: '/collectionfolder/:is_folder',
                templateUrl: 'app/colFol/colFol.html',
                controller: 'collectionFolderCtrl',
                controllerAs: 'colFol',
                reloadOnSearch: false,
                resolve: {
                    initApp: ['$q', 'MainService', function ($q, MainService) {
                        if (!MainService.initialized) {
                            return $q.reject("App Not initialized");
                        }
                    }]
                }
            })
            .state('main.login', {
                url: '/login',
                templateUrl: 'app/login/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'login',
                reloadOnSearch: false,
                resolve:{
                    initApp: ['$q','MainService', function($q,MainService){ }]
                }
            });
        $urlRouterProvider.otherwise('/tecadam/list');
    }

})();
