(function() {
    'use strict';

    angular
        .module('damApp')
        .factory('mainFactory', mainFactory);

    /** @ngInject */
    function mainFactory($q, MainService, $log, $http) {
        return {
            information: function(prm) {
                var deferred = $q.defer();
                MainService.serviceProvider.information({service: 'information'}, {}, function(response) {
                    deferred.resolve(response);
                }, function(error) {
                    var errMsg = error.data && error.data.response ? error.data.response : "Server non raggiungibile";
                    $log.error(errMsg);
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            autocomplete: function(prm) {
                var deferred = $q.defer();
                MainService.serviceProvider.autocomplete({service: 'autocomplete'}, prm, function(response) {
                    deferred.resolve(response);
                }, function(error) {
                    var errMsg = error.data && error.data.response ? error.data.response : "Server non raggiungibile";
                    $log.error(errMsg);
                    deferred.reject(errMsg);
                });
                return deferred.promise;
            },
            rollback: function(resource, prm) {
                var deferred = $q.defer();
                MainService.serviceProvider.post({service: 'rollback', resource1: resource}, prm, function(response) {
                    deferred.resolve(response);
                }, function(error) {
                    var errMsg = error.data && error.data.response ? error.data.response : "Server non raggiungibile";
                    $log.error(errMsg);
                    deferred.reject(errMsg);
                });
                return deferred.promise;
            },
        }
    }
})();