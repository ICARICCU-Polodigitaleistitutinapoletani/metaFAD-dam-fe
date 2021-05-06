(function () {
    'use strict';

    angular
        .module('damApp')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController($scope, $rootScope, $location, $state, mainFactory, MainService, $timeout, $uiMrFeedback, ListItemsService, listFactory, PinaxService, mrFeedbackConfig, LoginService) {
        var vm = this;
        var initializationFeedback;
        function render() {
            if (!MainService.initialized) {
                var feedback = {
                    "title": "Inizializzazione in corso",
                    "msg": "Attendi il caricamento delle informazioni...",
                    "animation": "none",
                    "theme": "ios",
                    "modal": true
                };
                initializationFeedback = $uiMrFeedback.open(feedback);
                getConfigInfo();
            }
        };
        var onActiveState = $rootScope.$on("app:activeState", function (ev, state) {
            vm.activeState = state.replace(".", "-");
        })
        vm.initialized = MainService.initialized;
        var getConfigInfo = function () {
            mainFactory.information({})
                .then(function (data) {
                    MainService.initialized = true;
                    vm.initialized = true;
                    CONFIG.schemaForm = data.schemaForm;
                    CONFIG.rowsPerPage = data.rowsPerPage;
                    CONFIG.fileTypes = data.fileTypes;
                    CONFIG.filtersLanguage = data.filtersLanguage;
                    CONFIG.facetGroupNum = data.facetGroupNum || 10;
                    CONFIG.availableSearchParams = data.availableSearchParams;
                    CONFIG.advancedSearchFixed = data.advancedSearchFixed;
                    CONFIG.facetOr = data.facetsOR || [];
                    CONFIG.allSchemaForms = data;
                    MainService.disabledFeatures = data.disabledFeatures;
                    MainService.enabledFeatures=data.enabledFeatures;
                    MainService.uploadMaxFiles = data.uploadMaxFiles ? data.uploadMaxFiles : null;
                    MainService.uploadMaxSize = data.uploadMaxSize ? parseInt(data.uploadMaxSize) : 3000;
                    MainService.hideFrameTitle = data.hideFrameTitle;
                    var activeState = MainService.setState && MainService.getActiveState() || "main.list";
                    var objState = activeState.split("|");
                    $timeout(function () {
                        if (objState[1]) {
                            $state.go(objState[0], JSON.parse(objState[1]));
                        }
                        else {
                            $state.go(activeState);
                        }
                    }, 300);
                    $scope.$broadcast("mainSyncInformation", CONFIG);
                    initializationFeedback.remove();
                })
                .catch(function (err) {
                });
        }
        var returnSelection = function (returnEmpty) {
            if (returnEmpty) {
                launchPinaxEvent([]);
                return;
            }
            var returnObjects = {};
            var indexObject = 0;
            var indexCicle = 0;
            var selected = ListItemsService.getObjSelected();
            var returnObjectsToPinax = function () {
                var check = _.isEmpty(returnObjects);
                if (check) {
                    var feedback = {
                        title: "Attenzione",
                        msg: "Devi selezionare almeno un elemento per poterlo condividere",
                        close: true
                    };
                    $uiMrFeedback.warning(feedback);
                    return;
                }
                launchPinaxEvent(returnObjects);
            };
            if (!selected || selected.length === 0) {
                returnObjectsToPinax();
            }
            _.forEach(selected, function (value) {
                if (value.type === "CONTAINER") {
                    obj = {};
                    obj.resource1 = "container";
                    obj.element1 = value.id;
                    obj.ContainedMedia = true;
                    listFactory.getMedia(obj)
                        .then(function (data) {
                            _.forEach(data.ContainedMedia, function (media) {
                                var obj = media.exportFields || {};
                                obj.id = media.id;
                                obj.title = media.title;
                                obj.type = media.type;
                                obj.src = media.thumbnail.replace("thumbnail", "original").split("?")[0];
                                obj.thumbnail = media.thumbnail.split("?")[0];
                                obj.metadata = CONFIG.serverRoot + CONFIG.instance + '/media/' + media.id;
                                var checkExist = _.find(returnObjects, { id: media.id });
                                if (!checkExist) {
                                    returnObjects[indexObject] = obj;
                                    indexObject++;
                                }
                            });
                            indexCicle++;
                            if (indexCicle === selected.length)
                                returnObjectsToPinax();
                        })
                        .catch(function (err) {
                            console.log(err);
                            indexCicle++;
                            if (indexCicle === selected.length)
                                returnObjectsToPinax();
                        });
                }
                else {
                    var obj = value.exportFields || {};
                    obj.id = value.id;
                    obj.title = value.title;
                    obj.type = value.type;
                    obj.src = value.thumbnail.replace("thumbnail", "original").split("?")[0];
                    obj.thumbnail = value.thumbnail.split("?")[0];
                    obj.metadata = CONFIG.serverRoot + CONFIG.instance + '/media/' + value.id;
                    returnObjects[indexObject] = obj;
                    indexObject++;
                    indexCicle++;
                    if (indexCicle === selected.length)
                        returnObjectsToPinax();
                }
            });
        };
        var launchPinaxEvent = function (obj) {
            PinaxService.events.broadcast('dam.selectMedia', obj);
            if (MainService.singleSelection) {
                PinaxService.events.broadcast('pinaxcms.onSetMediaPicker', obj[0]);
            }
            else {
                PinaxService.events.broadcast('pinaxcms.onSetMediaPicker', obj);
            }
            $scope.$broadcast('main:successReturnSelection', obj);
        };
        var onReturnSelection = $scope.$on('main:returnSelection', function (event, empty) {
            returnSelection(empty)
        });
        //funzione che ascolta l'evento callRouter emesso da tutti i moduli quando vogliono cambiare stato
        var router = $scope.$on('callRouter', function (event, toState, toParams) {
            console.log('CALL ROUTER', toState, toParams);
            $state.go(toState, toParams);
        });
        render();

        /* LOGIN */
        vm.needsLogin = function() {
            return MainService.needsLogin;
        };

        $scope.$on("needsLogin", function (event, info) {
            if (initializationFeedback)
                initializationFeedback.remove();

            var currentParams = vm.initialized ? _.clone($state.params) : MainService.getActiveStateParams();
            var currentName = vm.initialized ? _.clone($state.current.name) : MainService.getActiveStateName();
            LoginService.setRedirectState(currentName);
            LoginService.setRedirectParams(currentParams);
            
            $timeout(function () {
                $state.go('main.login', currentParams);
            }, 300);
        });
        vm.authorizationError = false;
        $scope.$on("authorizationError", function (event, info) {
            if (initializationFeedback)
                initializationFeedback.remove();
            vm.authorizationError = true;
        });

        $scope.$on('$destroy', function () {
            router();
            onActiveState();
            onReturnSelection();
        });

    }
})();
