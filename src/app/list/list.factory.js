(function() {
    'use strict';

    angular
        .module('damApp')
        .factory('listFactory', listFactory);

    /** @ngInject */
    function listFactory($q, MainService, $log) {
        return {
            getMedia: function(prm) {
                var deferred = $q.defer();
                MainService.serviceProvider.get(prm, {}, function(response) {
                    deferred.resolve(response);
                }, function(error) {
                    var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
                    $log.error(errMsg);
                    deferred.reject(errMsg);
                });
                return deferred.promise;
            }
        }
    }
})();
