(function () {
    'use strict';
    angular.module("utilsMdl", [
    ])
        .factory('getAllByKey', function () {
            return function (input, key, value) {
                var len = input.length, arObj = [];
                for (var i = 0; i < len; i++) {
                    if (input[i][key] == value) {
                        arObj.push(input[i]);
                    }
                }
                return arObj;
            };
        })
        .factory('getByKey', function () {
            return function (input, key, value) {
                var len = input.length, arObj = [];
                for (var i = 0; i < len; i++) {
                    if (input[i][key] == value) {
                        return input[i];
                    }
                }
                return false;
            };
        })
        .factory('getByDoubleKey', function () {
            return function (input, key1, value1, key2, value2) {
                var len = input.length;
                for (var i = 0; i < len; i++) {
                    if (input[i][key1] === value1 && input[i][key2] === value2) {
                        return input[i];
                    }
                }
                return false;
            };
        })
        .factory('getUrlParamByName', function () {
            return function (name) {
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(location.href);
                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            };
        })
        .filter('normalizeData', function ($filter) {
            return function (value) {
                var date = new Date(value.replace(" ", "T"));
                var formattedDate = $filter('date')(date, "dd/MM/yyyy");
                return formattedDate;
            };
        })
        .factory('refreshAngularCircle', function () {
            return function ($scope) {
                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    $scope.$apply();
                }
            }
        })
        .factory('fetchFromObject', function () {
            var fetchFromObject = function (obj, prop) {
                if (typeof obj === 'undefined') return false;
                var _index = prop.indexOf('.');
                if (_index > -1) {
                    return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
                }
                return obj[prop];
            };
            return fetchFromObject;
        })
        .filter('range', function () {
            return function (input, total) {
                total = parseInt(total);

                for (var i = 0; i < total; i++) {
                    input.push(i);
                }

                return input;
            };
        })
        .filter('bytes', function() {
            return function(bytes, precision) {
                if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
                if (typeof precision === 'undefined') precision = 1;
                var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                    number = Math.floor(Math.log(bytes) / Math.log(1000));
                return (bytes / Math.pow(1000, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
            }
        })
        .directive('detectPosition', function ($timeout) {
            return function (scope, element, attrs) {
                function getCoords(elem) { // crossbrowser version
                    var box = elem.getBoundingClientRect();

                    var body = document.body;
                    var docEl = document.documentElement;

                    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
                    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

                    var clientTop = docEl.clientTop || body.clientTop || 0;
                    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

                    var top = box.top + scrollTop - clientTop;
                    var left = box.left + scrollLeft - clientLeft;

                    return { top: Math.round(top), left: Math.round(left) };
                }
                var ele = attrs.detectPosition;
                $timeout(function () {
                    var top = getCoords(element[0]).top;
                    scope.$broadcast("detectPosition:onDetectPosition", top, ele);
                }, 1000);
            };
        })
        .factory('checkResize', function () {
            return function (url, w) {
                var check = url.indexOf('/original') !== -1 && CONFIG.originalResize;
                if (check) {
                    url = url.replace('get', 'resize');
                    var wResize = w ? "w=" + w : CONFIG.originalResize;
                    url = url.indexOf('/original?') !== -1 ? url += '&' + wResize : url += '?' + wResize;
                }
                return url;
            };
        })
        .factory('timeToSeconds', function () {
            return function (timeToConvert) {
                if (timeToConvert) {
                    return timeToConvert.split ? timeToConvert.split(':').reduce(function (acc, time) { return (60 * acc) + +time }) : timeToConvert;
                }
                return '';
            };
        });
        
})();
