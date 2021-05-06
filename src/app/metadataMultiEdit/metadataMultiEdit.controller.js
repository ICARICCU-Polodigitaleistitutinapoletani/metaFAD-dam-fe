(function () {
    'use strict';

    /**
     *  @ngdoc function
     *  @name damApp.controller:MetadataMultiEditCtrl
     *  @description
     *  # MetadataMultiEditCtrl
     *  Controller of the damApp
     */
    angular.module('damApp').controller('MetadataMultiEditCtrl', MetadataMultiEditCtrl);

    /** @ngInject */
    function MetadataMultiEditCtrl($uiMrFeedback, $window, $scope, $log, mainFactory, MainService, MetadataMultiEditService, metadataMultiEditFactory) {
        var vm = this;
        vm.selectedMedias = [];
        vm.changes = [];
        vm.tabs = [];
        vm.activeDataModel = {};
        vm.activeEnablingKeys = [];
        vm.activeForm = [];
        vm.activeSchema = {};
        vm.activeTab;
        vm.activeTabId;
        vm.schemaForm;
        var render = function () {
            vm.selectedMedias = MetadataMultiEditService.getSelectedMedias();

            if (!vm.selectedMedias || vm.selectedMedias.length <= 0) {
                vm.goToRouter("main.list", {});
                return;
            }
            var appHeight = MainService.getAppHeight();
            vm.eleHeight = {};
            vm.eleHeight.tabContentRight = appHeight - 176 - 132 + "px";
            vm.eleHeight.tabContentLeft = appHeight - 176 + "px";
            metadataMultiEditFactory.getSchemaForm()
                .then(function (data) {
                    vm.schemaForm = data;
                    console.log(data);
                    vm.tabs = data;
                    try {
                        var tabId = Object.keys(data)[0];
                        vm.setActiveTab(tabId, true);
                    } catch (e) {
                        console.log(e);
                    }
                })
                .catch(function (err) {
                    $log.error(err);
                    $uiMrFeedback.error({
                        title: "Attenzione",
                        msg: 'Non è stato possibile recuperare il modulo di modifica massiva\n' + err,
                        close: false,
                        autoClose: true,
                        btnAction: [
                            {
                                func: function () {
                                    vm._doCloseEditing();
                                },
                                text: "Chiudi"
                            }
                        ]
                    });
                });
        };
        vm.tabsScrollbarsOptions = {
            axis: 'x',
            scrollButtons: {
                scrollAmount: 50,
                enable: true
            },
            advanced: {
                updateOnContentResize: true
            }
        };
        vm.imgMiddleRespOptions = {
            container: {
                maxWidth: "150px",
                maxHeight: "150px"
            }
        };
        $(window).on("resize.doResize", function () {
            $scope.$apply(function () {
                vm.eleHeight.tabContentRight = MainService.getAppHeight($window.innerHeight) - 176 - 132 + "px";
                vm.eleHeight.tabContentLeft = MainService.getAppHeight($window.innerHeight) - 176 + "px";
            });
        });
        vm.getChanges = function () {
            var changes = [];
            console.log(vm.activeDataModel);
            if (vm.activeDataModel && vm.activeEnablingKeys) {
                for (var i = 0; i < vm.activeEnablingKeys.length; i++) {
                    if (vm.activeDataModel[vm.activeEnablingKeys[i]]) {
                        var fieldId = vm.activeEnablingKeys[i].replace('enable_', '');
                        changes.push({
                            fieldId: fieldId,
                            value: vm.activeDataModel[fieldId]
                        });
                        console.log(changes);
                    }
                }
            }
            return changes;
        };
        vm.setActiveTab = function (tabId, force) {
            var changes = vm.getChanges();
            if (!force && changes && changes.length > 0) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Ci sono modifiche non salvate. Uscendo dalla sezione perderai i nuovi dati inseriti. Vuoi salvare prima di procedere?",
                    close: false,
                    autoClose: true,
                    modal: true,
                    btnAction: [
                        {
                            func: function (nextTab) {
                                setTimeout(function () {
                                    MetadataMultiEditService.saveChanges(vm.selectedMedias, vm.activeTabId, changes)
                                        .then(function (data) {
                                            vm.resetDataModel();
                                            vm.setActiveTab(nextTab);
                                        })
                                        .catch(function (err) {
                                            $uiMrFeedback.error({
                                                title: "Attenzione",
                                                msg: err
                                            });
                                            $log.error(err);
                                        });
                                }, 420);
                            },
                            params: [tabId],
                            text: "Salva"
                        },
                        {
                            func: function (nextTab) {
                                vm.resetDataModel();
                                vm.setActiveTab(nextTab);
                            },
                            params: [tabId],
                            text: "Annulla",
                            type: 'grey'
                        }
                    ]
                };
                $uiMrFeedback.warning(feedback);
                return;
            }
            var tab = vm.schemaForm[tabId];
            vm.activeTabId = tabId;
            vm.activeTab = tab;
            vm.resetDataModel();
            var mapProp = tabId + '.schema.properties';
            MainService.initAutocompleteSchemaForm(vm.schemaForm, mapProp, vm.getAutocomplete);
            MainService.initTagSchemaForm(vm.schemaForm, mapProp);
            console.log(vm.schemaForm);
            // FORM 
            var newItems = [];
            for (var i = 0; i < tab.form[0].items[0].items.length; i++) {
                var item = tab.form[0].items[0].items[i];
                if (typeof item === 'string') {
                    newItems.push(
                        {
                            "key": item,
                            "htmlClass": "col-xs-10",
                            "condition": "!model.enable_" + item,
                            "readonly": true
                        }, {
                            "key": item,
                            "htmlClass": "col-xs-10",
                            "condition": "model.enable_" + item,
                            "readonly": false
                        }, {
                            "key": "enable_" + item,
                            "htmlClass": "col-xs-2 fieldEnabler"
                        });
                    vm.activeEnablingKeys.push("enable_" + item);
                } else {
                    if (item.key) {
                        vm._handleItemByKey(item, newItems);
                    } else if (item.items && item.items.length > 0) {
                        for (var j = 0; j < item.items.length; j++) {
                            vm._handleItemByKey(item.items[j], newItems);
                        }
                    }
                }
            }
            vm.activeForm = _.cloneDeep(tab.form);
            vm.activeForm[0].items[0].items = newItems;
            // SCHEMA AND DATA MODEL
            var activeSchema = _.cloneDeep(tab.schema);
            for (var i = 0; i < vm.activeEnablingKeys.length; i++) {
                activeSchema.properties[vm.activeEnablingKeys[i]] = {
                    "type": "boolean",
                    "key": vm.activeEnablingKeys[i],
                    "title": "Sovrascrivi"
                }
            }
            vm.activeSchema = activeSchema;
            console.log(vm.activeSchema);
        };
        vm._handleItemByKey = function (item, newItems) {
            var itemDisabled = _.cloneDeep(item);
            itemDisabled['condition'] = '!model.enable_' + item.key;
            itemDisabled['htmlClass'] = 'col-xs-10';
            itemDisabled['readonly'] = true;
            var itemEnabled = _.cloneDeep(item);
            itemEnabled['condition'] = 'model.enable_' + item.key;
            itemEnabled['htmlClass'] = 'col-xs-10';
            itemEnabled['readonly'] = false;

            newItems.push(
                itemDisabled,
                itemEnabled,
                {
                    "key": "enable_" + item.key,
                    "htmlClass": "col-xs-2 fieldEnabler"
                });
            vm.activeEnablingKeys.push("enable_" + item.key);
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
                var mapProp = vm.activeTabId + '.schema.properties';
                mainFactory.autocomplete(prm)
                    .then(function (data) {
                        data.value.unshift(value);
                        MainService.setAutocompleteValue(vm.schemaForm, mapProp, key, data.value);
                        vm.activeSchema.properties[key].items = vm.schemaForm[vm.activeTabId].schema.properties[key].items;
                    })
                    .catch(function (err) {
                        $log.error(err);
                        var arValue = [value];
                        MainService.setAutocompleteValue(vm.schemaForm, mapProp, key, arValue);
                        vm.activeSchema.properties[key].items = vm.schemaForm[vm.activeTabId].schema.properties[key].items;
                    });
            }
        };
        vm.resetDataModel = function () {
            vm.activeDataModel = {};
            vm.activeEnablingKeys = [];
        };
        vm.save = function () {
            var changes = vm.getChanges();
            MetadataMultiEditService.saveChanges(vm.selectedMedias, vm.activeTabId, changes)
                .then(function (data) {
                    var feedback = {
                        msg: "Modifiche salvate correttamente.",
                        close: false,
                        autoClose: true,
                        modal: true,
                        btnAction: [
                            {
                                func: function () {
                                    vm.activeDataModel = {};
                                },
                                text: "Continua"
                            }
                        ]
                    };
                    $uiMrFeedback.success(feedback);
                })
                .catch(function (err) {
                    $log.error(err);
                    $uiMrFeedback.error({
                        title: "Attenzione",
                        msg: err
                    });
                });
        };
        vm.saveAndClose = function () {
            var changes = vm.getChanges();
            MetadataMultiEditService.saveChanges(vm.selectedMedias, vm.activeTabId, changes)
                .then(function (data) {
                    vm._doCloseEditing();
                })
                .catch(function (err) {
                    $log.error(err);
                    $uiMrFeedback.error({
                        title: "Attenzione",
                        msg: err
                    });
                });
        };
        vm.goToRouter = function (state, params) {
            $scope.$emit('callRouter', state, params);
        };
        vm.closeEditing = function () {
            var changes = vm.getChanges();
            if (changes && changes.length > 0) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Ci sono modifiche non salvate. Uscendo dalla sezione perderai i nuovi dati inseriti. Vuoi continuare senza salvare?",
                    close: false,
                    autoClose: true,
                    modal: true,
                    btnAction: [
                        {
                            func: function () {
                                vm._doCloseEditing();
                            },
                            text: "Ok"
                        },
                        {
                            func: function () { },
                            text: "Annulla",
                            type: 'grey'
                        }
                    ]
                };
                $uiMrFeedback.warning(feedback);
                return;
            } else {
                vm._doCloseEditing();
            }
        }
        vm._doCloseEditing = function () {
            vm.resetDataModel();
            MetadataMultiEditService.setSelectedMedias([]);
            vm.goToRouter("main.list", {});
        }
        vm.getOriginalFileName = function (media) {
            if (media.original_file_name) {
                return media.original_file_name;
            } else {
                var idString = media.file_uri.split('_')[0];
                if ((idString.match(/\d/g) || []).length > 1 && idString.length > 3) {
                    return media.file_uri.slice(idString.length + 1, media.file_uri.length);
                }
                else {
                    return media.file_uri;
                }
            }
        }
        render();
    }
})();
