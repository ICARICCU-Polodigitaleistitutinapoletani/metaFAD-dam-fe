(function () {
    'use strict';

    angular
        .module('damApp')
        .service('MainService', MainService);

    /** @ngInject */
    function MainService($rootScope, $window, $resource, $cookies, $state, fetchFromObject, DamSearchService) {
        var vm = this;
        vm.initialized = false;
        vm.cms = false;
        vm.mediaType = false;
        vm.singleSelection = false;
        vm.externalFilters = null;
        vm.searchSimilarImg = null;
        vm.externalFiltersOR = null;
        vm.externalInput = null;
        vm.setState = false;
        vm.historySearchId = null;
        vm.jwtToken = null;
        vm.needsLogin = false;
        vm.config = {
            appHeight: ($window.innerHeight - CONFIG.windowHeight)
        };
        vm.getAppHeight = function (height) {
            var newHeight = height ? height - CONFIG.windowHeight : vm.config.appHeight;
            newHeight = vm.cms ? newHeight - 40 : newHeight;
            return newHeight;
        };
        var _activeState;
        vm.setActiveState = function (state) {
            $cookies.put('activeState', state);
        };
        vm.getActiveState = function () {
            _activeState = $cookies.get('activeState');
            return _activeState;
        };
        vm.getActiveStateName = function () {
            var activeState = this.setState && this.getActiveState() || 'main.list';
            var objState = activeState.split("|");
            return objState[0];
        };
        vm.getActiveStateParams = function () {
            var activeState = this.setState && this.getActiveState() || 'main.list';
            var objState = activeState.split("|");
            var params = objState && objState[1] ? JSON.parse(objState[1]) : undefined;
            return params;
        };
        vm.refreshActiveState = function () {
            $cookies.remove('activeState');
        };
        var _autocompleteValue = "";
        var setTagSchemaForm = function (newTag) {
            var item = {
                value: newTag,
                label: newTag
            };
            _autocompleteValue = newTag;
            return item;
        };
        vm.getAutocompleteValue = function () {
            return _autocompleteValue;
        };
        vm.setAutocompleteValue = function (schema, mapProp, field, value) {
            var properties = fetchFromObject(schema, mapProp);
            if (properties[field]) {
                var ar = [];
                _.forEach(value, function (val) {
                    var obj = {
                        "label": val,
                        "value": val
                    };
                    ar.push(obj);
                });
                properties[field].items = ar;
            }
            _autocompleteValue = "";
        };
        vm.setTag = function (schema, value, mapProp, type) {
            var properties = fetchFromObject(schema, mapProp);
            for (var key in properties) {
                if (properties[key].tagging) {
                    var mapTag = type ? properties[key].mapFuncTagging.replace("||type||", type) : properties[key].mapFuncTagging;
                    mapTag = mapTag.replace(".options", "");
                    var obj = fetchFromObject(schema, mapTag);
                    if (obj && obj.schema && obj.schema.tagging !== "string") {
                        obj.select_models = [];
                        if (!value[key])
                            value[key] = [];
                        _.forEach(value[key], function (val) {
                            obj.select_models.push({ value: val, label: val });
                        });
                    }
                    else if (obj && obj.schema && obj.schema.tagging === "string") {
                        //var objSelected = {value:value[key],label:value[key]};
                        //$rootScope.$broadcast('uis:select', objSelected);
                        obj.select_model = {
                            selected: { value: value[key], label: value[key] }
                        }
                    }
                }
            };
        };
        vm.initTagSchemaForm = function (schema, mapProp, type) {
            var properties = fetchFromObject(schema, mapProp);
            for (var key in properties) {
                if (properties[key].tagging === true) {
                    var mapTag = type ? properties[key].mapFuncTagging.replace("||type||", type) : properties[key].mapFuncTagging;
                    var obj = fetchFromObject(schema, mapTag);
                    if (obj) {
                        obj.tagging = setTagSchemaForm;
                    }
                }
            };
        };
        vm.initAutocompleteSchemaForm = function (schema, mapProp, fn, type) {
            var properties = fetchFromObject(schema, mapProp);
            for (var key in properties) {
                if (properties[key].autocomplete) {
                    var mapClb = type ? properties[key].mapFuncCallback.replace("||type||", type) : properties[key].mapFuncCallback;
                    var obj = fetchFromObject(schema, mapClb);
                    if (obj) {
                        obj.refreshDelay = 100;
                        obj.callback = fn;
                    }
                }
            };
        };
        vm.getHistorySearch = function (id) {
            if (!id)
                return false;
            var historySearchObj = localStorage.getItem("dam:historySearch") ? JSON.parse(localStorage.getItem("dam:historySearch")) : {};
            var history = historySearchObj[id];
            if (!history)
                return false;
            return history;
        };
        vm.setHistorySearch = function (search) {
            if (!vm.historySearchId)
                return false;
            var historySearch = DamSearchService.getSearchHistoryPrm();
            var historyObj = {};
            if (historySearch && (historySearch.search.length > 0 || historySearch.filters.length > 0)) {
                historyObj.search = historySearch.search.length > 0 ? historySearch.search : null;
                historyObj.filters = historySearch.filters.length > 0 ? historySearch.filters : null;
            }
            var historySearchObj = localStorage.getItem("dam:historySearch") ? JSON.parse(localStorage.getItem("dam:historySearch")) : {};
            var historySearchId = vm.historySearchId;
            historySearchObj[historySearchId] = historyObj;
            localStorage.setItem("dam:historySearch", JSON.stringify(historySearchObj));
        };

        vm.serviceProvider;
        vm.searchSimilarProvider;
        vm.imageAutoTaggingProvider;
        vm.videoScenesProvider;
        vm.initResource = function () {
            var commonHeaders = {};
            if (vm.jwtToken) {
                commonHeaders['x-auth-token'] = 'Bearer ' + vm.jwtToken;
            }
            vm.serviceProvider = $resource(CONFIG.serverRoot + CONFIG.instance + "/" + ':service/:resource1/:element1/:resource2/:element2/:resource3/:element3/:resource4', {
                service: '@service',
                resource1: '@resource1',
                element1: '@element1',
                resource2: '@resource2',
                element2: '@element2',
                resource3: '@resource3',
                element3: '@element3',
                resource4: '@resource4'
            }, {
                    autocomplete: {
                        method: 'POST',
                        cache: false,
                        withCredentials: true,
                        ignoreLoadingBar: true,
                        headers: _.extend(commonHeaders, {
                            'Content-Type': 'application/json'
                        }),
                        interceptor: {
                            responseError: vm.resourceErrorHandler
                        }
                    },
                    information: {
                        method: 'GET',
                        cache: false,
                        withCredentials: true,
                        ignoreLoadingBar: true,
                        headers: commonHeaders,
                        interceptor: {
                            responseError: vm.resourceErrorHandler
                        }
                    },
                    get: {
                        method: 'GET',
                        cache: false,
                        withCredentials: true,
                        headers: commonHeaders,
                        interceptor: {
                            responseError: vm.resourceErrorHandler
                        }
                    },
                    getArray: {
                        method: 'GET',
                        cache: false,
                        withCredentials: true,
                        isArray: true,
                        headers: commonHeaders,
                        interceptor: {
                            responseError: vm.resourceErrorHandler
                        }
                    },
                    post: {
                        method: 'POST',
                        cache: false,
                        withCredentials: true,
                        headers: _.extend(commonHeaders, {
                            'Content-Type': 'application/json'
                        }),
                        interceptor: {
                            responseError: vm.resourceErrorHandler
                        }
                    },
                    postArray: {
                        method: 'POST',
                        cache: false,
                        withCredentials: true,
                        headers: _.extend(commonHeaders, {
                            'Content-Type': 'application/json'
                        }),
                        isArray: true,
                        interceptor: {
                            responseError: vm.resourceErrorHandler
                        }
                    },
                    saveSync: {
                        method: 'POST',
                        cache: false,
                        withCredentials: true,
                        headers: _.extend(commonHeaders, {
                            'Content-Type': 'application/json'
                        }),
                        async: false,
                        interceptor: {
                            responseError: vm.resourceErrorHandler
                        }
                    },
                    put: {
                        method: 'PUT',
                        cache: false,
                        withCredentials: true,
                        headers: _.extend(commonHeaders, {
                            'Content-Type': 'application/json'
                        }),
                        interceptor: {
                            responseError: vm.resourceErrorHandler
                        }
                    },
                    delete: {
                        method: 'DELETE',
                        cache: false,
                        withCredentials: true,
                        headers: _.extend(commonHeaders, {
                            'Content-Type': 'application/json'
                        }),
                        interceptor: {
                            responseError: vm.resourceErrorHandler
                        }
                    },
                    deleteArray: {
                        method: 'DELETE',
                        cache: false,
                        withCredentials: true,
                        headers: _.extend(commonHeaders, {
                            'Content-Type': 'application/json'
                        }),
                        isArray: true,
                        interceptor: {
                            responseError: vm.resourceErrorHandler
                        }
                    },
                    searchSimilar: {
                        url: CONFIG.searchSimilarImagesUrl ? CONFIG.searchSimilarImagesUrl : '',
                        method: 'POST',
                        cache: false,
                        withCredentials: true,
                        headers: _.extend(commonHeaders, {
                            'Content-Type': 'application/json'
                        }),
                        interceptor: {
                            responseError: vm.resourceErrorHandler
                        }
                    },
                    multiDownload: {
                        method: 'POST',
                        ignoreLoadingBar: true,
                        cache: false,
                        withCredentials: true,
                        headers: _.extend(commonHeaders, {
                            'Content-Type': 'application/json'
                        }),
                        interceptor: {
                            responseError: vm.resourceErrorHandler
                        }
                    }
                });
            if (CONFIG.searchSimilarImagesUrl) {
                vm.searchSimilarProvider = $resource(CONFIG.searchSimilarImagesUrl + "/", { }, {
                        post: {
                            method: 'POST',
                            cache: false,
                            withCredentials: true,
                            headers: _.extend(commonHeaders, {
                                'Content-Type': 'application/json'
                            }),
                            interceptor: {
                                responseError: vm.resourceErrorHandler
                            }
                        }
                    });
            }
            // if (CONFIG.imageTaggingUrl) {
            //     vm.imageAutoTaggingProvider = $resource(CONFIG.imageTaggingUrl + "/" , { }, {
            //             get: {
            //                 method: 'GET',
            //                 cache: false,
            //                 withCredentials: true,
            //                 headers: _.extend(commonHeaders, {
            //                     'Content-Type': 'application/json'
            //                 }),
            //                 interceptor: {
            //                     responseError: vm.resourceErrorHandler
            //                 }
            //             }
            //         });
            // }
            // if (CONFIG.videoScenesUrl) {
            //     vm.videoScenesProvider = $resource(CONFIG.videoScenesUrl, { }, {
            //             get: {
            //                 method: 'GET',
            //                 cache: false,
            //                 withCredentials: true,
            //                 headers: _.extend(commonHeaders, {
            //                     'Content-Type': 'application/json'
            //                 }),
            //                 interceptor: {
            //                     responseError: vm.resourceErrorHandler
            //                 }
            //             }
            //         });
            // }
        };

        vm.isDisabledFeature = function (feature) {
            return vm.disabledFeatures && vm.disabledFeatures.indexOf(feature) !== -1;
        };

        vm.isEnabledFeature = function (feature) {
            return vm.enabledFeatures !== undefined && vm.enabledFeatures.indexOf(feature) > -1;
        };

        vm.resourceErrorHandler = function (error) {
            // Il DAM è ospitato quando è dentro un iframe e quando setState=true
            var hosted = vm.setState && document.getElementsByTagName('iframe').length > 0;
            if (error.status === 403) { // 403 - Forbidden
                // hosted = true;
                if (hosted) {
                    // se DAM è ospitata => mostrare view di errore
                    $rootScope.$broadcast('authorizationError');
                } else {
                    // se DAM è standalone => mostrare form di login
                    vm.needsLogin = true;
                    $rootScope.$broadcast('needsLogin');
                }
            }
        };

        vm.setJwtToken = function (jwtToken) {
            vm.jwtToken = jwtToken;
        };
    }
})();
