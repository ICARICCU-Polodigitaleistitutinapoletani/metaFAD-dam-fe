(function() {
    'use strict';

    angular
        .module('pinaxMdl')
        .service('PinaxService', PinaxService);

    /** @ngInject */
    function PinaxService($rootScope) {
        var eventMap;
        this.events = {};
        this.events.broadcast = function(type, message) {
            if (window.postMessage) {
                window.top.postMessage({type: type, message: message},"*");
                if (window.top!==window) window.postMessage({type: type, message: message}, "*");
//                $('iframe', window.top.document).each(function(index, el){
//                    el.contentWindow.postMessage({type: type, message: message}, "*");
//                });
            }
        };

        this.events.on = function(type, callback) {
            $(document).on(type, callback);
            if (window.postMessage) {
                if (eventMap===undefined) {
                    eventMap = {};
                    var triggeredFunction = function(e) {
                        if (eventMap[e.data.type]!==undefined) {
                            $(eventMap[e.data.type]).each(function(index, el){
                                if (el) {
                                    el({
                                        type: e.data.type,
                                        message: e.data.message,
                                        time: new Date()
                                    });
                                }
                            });
                        }
                    }

                    if (typeof window.addEventListener != 'undefined') {
                        window.addEventListener('message', triggeredFunction, false);
                    } else if (typeof window.attachEvent != 'undefined') {
                        window.attachEvent('onmessage', triggeredFunction);
                    }
                }

                var pos;
                if (eventMap[type]===undefined) {
                    eventMap[type] = [];
                }
                pos = eventMap[type].length;
                eventMap[type].push(callback);

                return pos;
            }
            return null;
        };

        this.events.unbind = function(type, pos) {
            $(document).unbind(type);
            if (window.postMessage) {
                if (eventMap[type]===undefined) {
                    eventMap[type] = [];
                }
                eventMap[type][pos] = null;
            }
        };
    }
})();
