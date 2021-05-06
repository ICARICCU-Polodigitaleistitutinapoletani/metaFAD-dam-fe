(function () {
    'use strict';

    angular
        .module('videoScenesMdl')
        .directive('videoScenes', videoScenes);

    /** @ngInject */
    function videoScenes() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/videoScenes/videoScenes.html',
            scope: {
                data: '=',
                videoUrl: '='
            },
            controller: videoScenesController,
            controllerAs: 'videoScenes',
            bindToController: true
        };
        return directive;
    }

    /** @ngInject */
    function videoScenesController(timeToSeconds) {
        // inizializzo una variabile che referenzia il modulo
        var vm = this;
        vm.sceneTypes = [{
            "id": "TEXT",
            "label": "Testo"
        }, {
            "id": "ACTION",
            "label": "Parlato"
        }, {
            "id": "CHANGE",
            "label": "Cambio scena"
        }, {
            "id": "SUBTITLE",
            "label": "Sottotitolo"
        }];

        vm.availableViews = [{
            id: 'visual',
            label: 'Modifica visuale'
        }, {
            id: 'webVTT',
            label: 'Modifica WebVTT'
        }];
        vm.currentView = vm.availableViews[0].id;
        vm.webVTT = '';

        vm.changeView = function (view) {
            if (view === 'webVTT') {
                vm.webVTT = '';
                var i = 1;
                for (var i = 0; i < vm.data.metadata.length; i++) {
                    var scene = vm.data.metadata[i];
                    vm.webVTT += (scene.id || i) + '\n';
                    vm.webVTT += scene.start + ' --> ' + scene.end + '\n';
                    if (scene.type) {
                        vm.webVTT += scene.type + '\n';
                    }
                    
                    vm.webVTT += scene.data ? scene.data : '---';
                    vm.webVTT += '\n\n';
                }
            } else {
                // Parse back
                vm.data.metadata = vm.vttParse(vm.webVTT);
            }
            vm.currentView = view;
        }

        vm.updateData = function (scene) {
            if (scene.type === 'ACTION') {
                scene.data = 'speak';
            } else {
                scene.data = '';
            }
        };

        // VIDEO SCENES
        vm.videoCurrentTime = 0;
        vm.videoSceneSelectedTime = 0;
        vm.goToScene = function (scene) {
            var seconds = timeToSeconds(scene.start);
            vm.videoSceneSelectedTime = seconds;
        };

        vm.isActiveScene = function (scene, nextScene) {
            var currentTime = vm.videoCurrentTime ? vm.videoCurrentTime : 0;
            if (scene.start) {
                var startSeconds = scene.start ? timeToSeconds(scene.start) : scene.start;
                var sceneEnd = nextScene ? nextScene.start : undefined;
                if (sceneEnd) {
                    var endSeconds = sceneEnd ? timeToSeconds(sceneEnd) : sceneEnd;
                    return startSeconds <= currentTime && currentTime < endSeconds;
                } else {
                    return startSeconds <= currentTime;
                }
            } else {
                return false;
            }
        }
        vm.removeScene = function (index) {
            if (vm.isActiveScene(vm.data.metadata[index], vm.data.metadata[index + 1])) {
                if (index > 0) {
                    vm.goToScene(vm.data.metadata[index - 1]);
                } else if (index === 0 && vm.data.metadata.length > 1) {
                    vm.goToScene(vm.data.metadata[index + 1]);
                } else {
                    vm.videoCurrentTime = 0;
                    vm.videoSceneSelectedTime = 0;
                }
            }
            vm.data.metadata.splice(index, 1);
        }
        vm.addScene = function () {
            vm.data.metadata.push({
                'data': '',
                'start': '',
                'end': '',
                'type': ''
            });
        }
        vm.updateScenes = function() {
            vm.data.metadata = vm.vttParse(vm.webVTT);
        };        
        // WEB VTT
        vm.vttParse = function (srtOrVtt) {
            if (!srtOrVtt) { return []; }

            var sourceScenes = srtOrVtt
                .trim()
                .concat('\n')
                .replace(/\r\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .replace(/^WEBVTT.*\n{2}/, '')
                .split('\n\n');

            return sourceScenes.reduce(function(scenes, sceneSource){
                var sceneParts = sceneSource.split('\n').filter(function(s) { return s !== ''; });
                scenes.push(sceneParts.reduce(function (scene, part) {
                    if (!scene.id) {
                        if (/^\d+$/.test(part)) {
                            scene.id = parseInt(part, 10);
                            return scene;
                        }
                    }
                    if (!scene.start) {
                        Object.assign(scene, vm.parseTimestamps(part));
                        return scene;
                    }

                    if (!scene.type && sceneParts.length > 3) {
                        scene.type = part;
                    } else {
                        scene.data += part + '\n';
                    }
                    if (scene.type === 'ACTION') {
                        scene.data = 'speak';
                    }
                    if (scene.type === 'CHANGE') {
                        scene.data = '';
                    }
                    return scene;
                }, { data: '' }));
                return scenes;
            }, []);
        };

        vm.parseTimestamps = function(value) {
            var timestampRE = /^((?:\d{2,}:)?\d{2}:\d{2}[,.]\d{3}) --> ((?:\d{2,}:)?\d{2}:\d{2}[,.]\d{3})(?: (.*))?$/;
            var match = timestampRE.exec(value);
            if (match) {
                var cue = {
                    start: match[1],
                    end: match[2]
                };
                if (match[3]) {
                    cue.settings = match[3];
                }
                return cue;
            } else {
                var framesRE = /^(\d*) --> (\d*)(?: (.*))?$/;
                var match = framesRE.exec(value);
                if (match) {
                    var cue = {
                        start: match[1],
                        end: match[2]
                    };
                    if (match[3]) {
                        cue.settings = match[3];
                    }
                    return cue;
                }
            }
            return undefined;
        }
    }
})();
