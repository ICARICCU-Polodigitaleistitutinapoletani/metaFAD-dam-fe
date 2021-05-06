(function() {
  'use strict';

  angular
    .module('damApp')
    .factory('collectionFolderFactory', ['$q', 'MainService', '$log', collectionFolderFactory]);

  /** @ngInject */
    function collectionFolderFactory($q, MainService, $log) {
        return {
				getChildren: function(type,id) {
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
                searchRelatedMedia: function(prm) {
					var deferred = $q.defer();
					MainService.serviceProvider.post({service: 'search'}, prm, function(response) {
						//var results = response.results || [];
                        deferred.resolve(response);
					}, function(error) {
                        var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
						$log.error(errMsg);
						deferred.reject(errMsg);
					});
					return deferred.promise;
				},
                postCollectionFolder: function(type,prm){
                    var deferred = $q.defer();
					MainService.serviceProvider.post({resource1: type}, prm, function(response) {
						deferred.resolve(response);
					}, function(error) {
                        var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
						$log.error(errMsg);
						deferred.reject(errMsg);
					});
					return deferred.promise;
                },
                putCollectionFolder: function(type,id,prm){
                    var deferred = $q.defer();
					MainService.serviceProvider.put({resource1: type, element1:id}, prm, function(response) {
						deferred.resolve(response);
					}, function(error) {
                        var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
						$log.error(errMsg);
						deferred.reject(errMsg);
					});
					return deferred.promise;
                },
                deleteCollectionFolder: function(type,id){
                    var deferred = $q.defer();
					MainService.serviceProvider.delete({resource1: type, element1:id}, {}, function(response) {
						deferred.resolve(response);
					}, function(error) {
                        var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
						$log.error(errMsg);
						deferred.reject(errMsg);
					});
					return deferred.promise;
                },
                postRelatedMedia: function(type,id,prm){
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
                deleteRelatedMedia: function(type,idCol,idMedia){
                    var deferred = $q.defer();
					MainService.serviceProvider.deleteArray({resource1: type, element1:idCol, resource2: "media", element2:idMedia}, {}, function(response) {
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