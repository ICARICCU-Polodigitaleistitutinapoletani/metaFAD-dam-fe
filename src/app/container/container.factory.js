(function() {
    'use strict';

    angular
        .module('damApp')
        .factory('containerFactory', containerFactory);

    /** @ngInject */
    function containerFactory($q, MainService, $log, $resource) {
        return {
            postContainer: function(prm) {
                var deferred = $q.defer();
                MainService.serviceProvider.post({resource1:"container"}, prm, function(response) {
                    deferred.resolve(response);
                }, function(error) {
                    var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
                    $log.error(errMsg);
                    deferred.reject(errMsg);
                });
                return deferred.promise;
            },
            getContainer: function(prm) {
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
            putContainerResource: function(idMedia,resource,idResource,prm) {
				var deferred = $q.defer();
				MainService.serviceProvider.put({resource1: "container", element1: idMedia, resource2: resource, element2:idResource }, prm, function(response) {
                    deferred.resolve(response);
				}, function(error) {
                    var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
            },
            getColChildren: function(type,id) {
                var deferred = $q.defer();
                MainService.serviceProvider.getArray({resource1: type, element1: id, resource2: "children"}, {}, function(response) {
                    deferred.resolve(response);
                }, function(error) {
                    var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
                    $log.error(errMsg);
                    deferred.reject(errMsg);
                });
                return deferred.promise;
            },
            postColRelatedMedia: function(type,id,prm){
                var deferred = $q.defer();
                MainService.serviceProvider.postArray({resource1: type, element1:id, resource2: "media"}, prm, function(response) {
                    deferred.resolve(response);
                }, function(error) {
                    var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
                    $log.error(errMsg);
                    deferred.reject(errMsg);
                });
                return deferred.promise;
            },
            deleteColRelatedMedia: function(type,idCol,idMedia){
                var deferred = $q.defer();
                MainService.serviceProvider.deleteArray({resource1: type, element1:idCol, resource2: "media", element2:idMedia}, {}, function(response) {
                    deferred.resolve(response);
                }, function(error) {
                    var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
                    $log.error(errMsg);
                    deferred.reject(errMsg);
                });
                return deferred.promise;
            },
            postContainedMedia: function(id,resource,prm){
                var deferred = $q.defer();
                MainService.serviceProvider.post({resource1: "container", element1:id, resource2: resource}, prm, function(response) {
                    deferred.resolve(response);
                }, function(error) {
                    var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
                    $log.error(errMsg);
                    deferred.reject(errMsg);
                });
                return deferred.promise;
            },
            deleteContainedMedia: function(idMedia,resource,idRelMedia,removeFromDam){
                var deferred = $q.defer();
                MainService.serviceProvider.delete({resource1: "container", element1:idMedia, resource2: resource, element2:idRelMedia,removeFromDam:removeFromDam}, {}, function(response) {
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
