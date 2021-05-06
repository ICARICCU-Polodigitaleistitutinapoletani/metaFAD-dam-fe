(function() {
  'use strict';

  angular
    .module('damApp')
    .factory('addMediaFactory', addMediaFactory);

  /** @ngInject */
    function addMediaFactory($q, MainService, $log) {
        return {
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
                postMedia: function(prm){
                    var deferred = $q.defer();
					MainService.serviceProvider.post({resource1: "media"}, prm, function(response) {
						deferred.resolve(response);
					}, function(error) {
                        var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
						$log.error(errMsg);
						deferred.reject(errMsg);
					});
					return deferred.promise;
                },
                postMediaResource: function(idMedia,resource,prm) {
					var deferred = $q.defer();
					MainService.serviceProvider.post({resource1: "media", element1: idMedia, resource2: resource }, prm, function(response) {
                        deferred.resolve(response);
					}, function(error) {
                        var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
						$log.error(errMsg);
						deferred.reject(errMsg);
					});
					return deferred.promise;
				},
        }
    }
})();
