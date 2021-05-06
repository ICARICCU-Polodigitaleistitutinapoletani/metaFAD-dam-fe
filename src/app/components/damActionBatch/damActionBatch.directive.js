(function () {
    'use strict';

    angular
        .module('damActionBatchMdl')
        .directive('damActionBatch', damActionBatch);

    /** @ngInject */
    function damActionBatch() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/damActionBatch/damActionBatch.html',
            scope: {
                actionPanel: "=actionPanel",
                actionEditor: "=actionEditor"
            },
            controller: damActionBatchController,
            controllerAs: 'damActionBatch',
            bindToController: true
        };
        return directive;
    }

    /** @ngInject */
    function damActionBatchController($rootScope, $element, DamActionBatchService, damActionBatchFactory, $timeout, $uiMrFeedback, checkResize) {
        // inizializzo una variabile che referenzia il modulo
        var vm = this;
        var mediaSearch = null;
        var render = function () {
            mediaSearch = DamActionBatchService.getObjSearch();
            if (!mediaSearch) {
                vm.medias = DamActionBatchService.getObjList();
                if (vm.actionEditor) {
                    if (vm.medias.length > 0) {
                        vm.activeMedia = vm.medias[0];
                        vm.activeMedia.img = checkResize(vm.activeMedia.img);
                        vm.nameStream = vm.activeMedia.name || "original";
                        vm.newNameStream = vm.activeMedia.name || "Stream_" + new Date().getTime();
                        $timeout(function () {
                            vm.ready = true;
                            initCropper();
                        }, 600, false);
                    }
                }
                else {
                    vm.nameStream = vm.medias[0].name || "original";
                    vm.newNameStream = vm.medias[0].name || "Stream_" + new Date().getTime();
                }
            }
            else {
                vm.nameStream = "original";
                vm.newNameStream = "Stream_" + new Date().getTime();
            }
        };
        vm.fileTypes = CONFIG.fileTypes["IMAGE"];
        vm.actions = {
            "resize": {
                "label": "Ridimensiona",
                "selected": false,
                "concat": true,
                "setConcat": function (state) {
                    if (state) {
                        vm.actions.resize.concat = false;
                    }
                    else {
                        vm.actions.resize.concat = true;
                    }
                    vm.actions.resize.parameters.width = null;
                    vm.actions.resize.parameters.height = null;
                },
                "setMeasureConcat": function (dim) {
                    if (!vm.actions.resize.concat)
                        return;
                    var w = $element.find("#editingImage")[0].naturalWidth;
                    var h = $element.find("#editingImage")[0].naturalHeight;
                    var d1 = vm.actions.resize.parameters[dim];
                    if (dim === "width")
                        vm.actions.resize.parameters.height = Math.round(((d1 * h) / w) * 100) / 100;
                    else
                        vm.actions.resize.parameters.width = Math.round(((d1 * w) / h) * 100) / 100;
                },
                "parameters": {
                    "width": null,
                    "height": null
                },
                "checkParameters": function () {
                    var check = vm.actions.resize.parameters.width || vm.actions.resize.parameters.height;
                    var par;
                    if (check) {
                        par = {
                            "width": vm.actions.resize.parameters.width,
                            "height": vm.actions.resize.parameters.height
                        };
                        return par;
                    }
                    else {
                        return false;
                    }
                }
            },
            "setImageFormat": {
                "label": "Converti",
                "selected": false,
                "parameters": {
                    "format": null
                },
                "checkParameters": function () {
                    var check = vm.actions.setImageFormat.parameters.format;
                    var par;
                    if (check) {
                        par = {
                            "format": vm.actions.setImageFormat.parameters.format
                        };
                        return par;
                    }
                    else {
                        return false;
                    }
                }
            },
            "rotate": {
                "label": "Ruota",
                "selected": false,
                "parameters": {
                    "degrees": null
                },
                "checkParameters": function () {
                    var check = vm.actions.rotate.parameters.degrees;
                    var par;
                    if (check) {
                        par = {
                            "degrees": vm.actions.rotate.parameters.degrees
                        };
                        return par;
                    }
                    else {
                        return false;
                    }
                }
            },
            "flip": {
                "label": "Rifletti verticalmente",
                "selected": false,
                "parameters": null,
                "checkParameters": function () {
                    return true;
                }
            },
            "flop": {
                "label": "Rifletti orizzontalmente",
                "selected": false,
                "parameters": null,
                "checkParameters": function () {
                    return true;
                }
            },
            "crop": {
                "label": "Ritaglio",
                "selected": false,
                "parameters": {
                    "x": null,
                    "y": null,
                    "width": null,
                    "height": null
                },
                "checkParameters": function () {
                    var check = (vm.actions.crop.parameters.x === 0 || vm.actions.crop.parameters.x) && (vm.actions.crop.parameters.y === 0 || vm.actions.crop.parameters.y) && vm.actions.crop.parameters.width && vm.actions.crop.parameters.height;
                    var par;
                    if (check) {
                        par = vm.actions.crop.parameters;
                        return par;
                    }
                    else {
                        return false;
                    }
                }
            },
            "resampleImage": {
                "label": "Ricampiona",
                "selected": false,
                "parameters": {
                    "resize": true,
                    "maintainAspect": true,
                    "xResolution": null,
                    "yResolution": null
                },
                "checkParameters": function () {
                    var check = vm.actions.resampleImage.parameters.xResolution && vm.actions.resampleImage.parameters.yResolution;
                    var par;
                    if (check) {
                        par = {
                            "resize": vm.actions.resampleImage.parameters.resize,
                            "maintainAspect": vm.actions.resampleImage.parameters.resize ? vm.actions.resampleImage.parameters.maintainAspect : null,
                            "xResolution": vm.actions.resampleImage.parameters.xResolution,
                            "yResolution": vm.actions.resampleImage.parameters.yResolution
                        };
                        return par;
                    }
                    else {
                        return false;
                    }
                }
            }
        };
        var actionsApplied = [];
        var mrFeedbackPrepareActionBatch;
        vm.prepareApplyActions = function () {
            var actions = [];
            if (eleCrop) {
                var crop = _.isEmpty(eleCrop.cropper('getCropBoxData')) ? null : eleCrop.cropper('getData');
                if (crop) {
                    vm.actions.crop.selected = true;
                    if (crop.x < 0)
                        crop.x === 0;
                    if (crop.y < 0)
                        crop.y === 0;
                    _.forOwn(vm.actions.crop.parameters, function (value, key) {
                        vm.actions.crop.parameters[key] = crop[key];
                    });
                }
            }
            for (var key in vm.actions) {
                var value = vm.actions[key];
                if (value.selected) {
                    var checkValidation = value.checkParameters();
                    if (checkValidation) {
                        var action = checkValidation === true ? { "type": key } : { "type": key, "parameters": checkValidation };
                        actions.push(action);
                    }
                    else {
                        var feedback = {
                            title: "Attenzione",
                            msg: "Settaggi mancanti: " + value.label
                            // appendTo: ".damActionBatch"
                        };
                        $uiMrFeedback.warning(feedback);
                        return;
                    }
                }
            };
            if (actions.length === 0) {
                var feedback = {
                    title: "Attenzione",
                    msg: "Devi settare almeno una modifica per poterla salvare"
                    // appendTo: ".damActionBatch"
                };
                $uiMrFeedback.warning(feedback);
                return;
            }
            actionsApplied = actions;
            var feedback = {
                icon: 'fa-spinner fa-pulse',
                title: "Attendi",
                msg: "Attendi l'invio dei dati per la modifica...",
                close: false
                // appendTo: ".damActionBatch"
            };
            mrFeedbackPrepareActionBatch = $uiMrFeedback.open(feedback);
            var medias = [];
            _.forEach(vm.medias, function (value) {
                medias.push(value.id);
            });
            $timeout(function () {
                postActionBatch(vm.nameStream, vm.newNameStream, medias, actionsApplied);
            }, 300, false);
        };
        var postActionBatch = function (name, newName, medias, actions) {
            var prm = {
                "actions": actions
            };
            if (mediaSearch)
                prm.mediaSearch = mediaSearch;
            else
                prm.medias = medias;
            if (name) {
                prm.bytestreamName = name;
            }
            if (newName) {
                prm.bytestreamNewName = newName.replace(/ /g, "");
            }
            damActionBatchFactory.postActionBatch(prm)
                .then(function (data) {
                    mrFeedbackPrepareActionBatch.remove();
                    $rootScope.$emit("damActionBatchPostSuccess", prm);
                    $rootScope.$emit("damSearchModalBatchInstance", "close");
                    //                var feedback = {
                    //                    title:"Complimenti",
                    //                    msg:"La modifica è stata messa in coda e verrà effettuata al più presto.",
                    //                    close:true,
                    //                    appendTo:".damActionBatch"
                    //                };
                    //                $uiMrFeedback.open(feedback);
                })
                .catch(function (err) {
                    mrFeedbackPrepareActionBatch.remove();
                    var feedback = {
                        title: "Errore",
                        msg: "C'è stato un errore durante l'invio dei dati"
                        // appendTo: ".damActionBatch"
                    };
                    $uiMrFeedback.error(feedback);
                });
        };
        var eleCrop;
        var initCropper = function () {
            var img = $element.find("#editingImage");
            vm.currentCommand = "crop";
            eleCrop = img.cropper(
                {
                    autoCrop: true,
                    autoCropArea: 0.8,
                    built: function (value) {
                        $(this).cropper('setDragMode', 'move');
                        $timeout(function () { vm.cropperCommand("clear"); }, 100);
                        var containerData = $(this).cropper("getContainerData");
                        var setZoomTo = (value.currentTarget.width < containerData.width) && (value.currentTarget.height < containerData.height);
                        if (setZoomTo)
                            vm.zoomTo(1);
                    },
                    preview: ".preview"
                }
            );
        };
        vm.currentCommand = 'move';
        vm.rotate = null;
        vm.crop = null;
        vm.toFlop = false;
        var currentRotation = 0;
        vm.showAnteprima = true;
        vm.actionCrop = true;
        vm.setActionInEditor = function (type) {
            if (type === "rotate") {
                angular.element("#editingImage").cropper('rotateTo', vm.actions.rotate.parameters.degrees);
            }
            else if (type === "flop") {
                var dir = vm.actions.flop.selected ? -1 : 1;
                angular.element("#editingImage").cropper('scaleX', dir);
            }
            else if (type === "flip") {
                var dir = vm.actions.flip.selected ? -1 : 1;
                angular.element("#editingImage").cropper('scaleY', dir);
            }
            else if (type === "resize") {
                vm.setDragMode("move");
                vm.cropperCommand("clear");
            }
        };
        var setContainerDim = function (deg) {
            var isOdd = function (num) { return num % 2; }
            currentRotation = currentRotation + deg;
            if (isOdd(currentRotation / 90))
                var h = angular.element(".cropper-canvas img")[0].offsetWidth;
            else {
                var h = angular.element(".cropper-canvas img")[0].offsetHeight;
            }
            angular.element(".cropper-container").height(h + "px");
        };

        vm.flop = function () {
            if (vm.toFlop) {
                angular.element("#editingImage").cropper('scaleX', 1);
                vm.toFlop = false;
                vm.actions.flop.selected = false;
            }
            else {
                angular.element("#editingImage").cropper('scaleX', -1);
                vm.toFlop = true;
                vm.actions.flop.selected = true;
            }
        }
        vm.rotate = function (degrees) {
            var deg = vm.actions.flop.selected ? -degrees : degrees;
            angular.element("#editingImage").cropper('rotate', deg);
            switch (currentRotation + degrees) {
                case 270:
                    currentRotation = -90
                    break;
                case -180:
                    currentRotation = 180
                    break;
                default:
                    currentRotation = currentRotation + degrees
            }
            vm.actions.rotate.selected = currentRotation ? true : false;
            vm.actions.rotate.parameters.degrees = currentRotation;
        }

        vm.setDragMode = function (mode) {
            vm.currentCommand = mode;
            angular.element("#editingImage").cropper('setDragMode', mode);
            /*if(mode==="crop"){
                vm.cropperCommand("reset"); 
            }*/
        }

        vm.zoom = function (factor) {
            angular.element("#editingImage").cropper('zoom', factor);
        }

        vm.zoomTo = function (ratio) {
            angular.element("#editingImage").cropper('zoomTo', ratio);
        }

        vm.cropperCommand = function (command) {
            angular.element("#editingImage").cropper(command);
            if (command === "reset") {
                currentRotation = 0;
                vm.actions.rotate.selected = false;
                vm.actions.rotate.parameters.degrees = null;
                angular.element(".cropper-canvas").removeClass('flop');
                angular.element(".cropper-view-box").removeClass('flop');
                vm.toFlop = false;
                vm.actions.flop.selected = false;
            }
            if (command === "clear") {
                vm.actionCrop = false;
                vm.showAnteprima = false;
            }
            else if (command === "crop") {
                vm.actionCrop = true;
                vm.showAnteprima = true;
            }
        }
        vm.aspectRatio = function (ratio) {
            angular.element("#editingImage").cropper('setAspectRatio', ratio);
        }
        vm.prepareActionsEditor = function () {
            var crop = _.isEmpty(eleCrop.cropper('getCropBoxData')) ? null : eleCrop.cropper('getData');
            if (crop) {
                vm.actions.crop.selected = true;
                if (crop.x < 0)
                    crop.x === 0;
                if (crop.y < 0)
                    crop.y === 0;
                _.forOwn(vm.actions.crop.parameters, function (value, key) {
                    vm.actions.crop.parameters[key] = crop[key];
                });
            }
            vm.prepareApplyActions();
        };

        render();
    }
})();
