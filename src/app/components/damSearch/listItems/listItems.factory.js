(function() {
    'use strict';

    angular
        .module('listItemsMdl')
        .factory('listItemsFactory', listItemsFactory);

    /** @ngInject */
    function listItemsFactory($q, MainService, $log) {
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
            },
            removeMedia: function(id){
                var deferred = $q.defer();
                MainService.serviceProvider.delete({resource1: 'media', element1: id}, {}, function(response) {
                    deferred.resolve(response);
                }, function(error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            removeContainer: function(id,removeContainedMedia){
                var deferred = $q.defer();
                MainService.serviceProvider.delete({resource1: 'container', element1: id, removeContainedMedia:removeContainedMedia}, {}, function(response) {
                    deferred.resolve(response);
                }, function(error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            }
        }
    }
})();
