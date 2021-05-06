(function () {
	'use strict';

	angular
		.module('damApp')
		.factory('detailsFactory', detailsFactory);

	/** @ngInject */
	function detailsFactory($q, MainService, $log, $resource) {
		return {
			getMedia: function (prm) {
				var deferred = $q.defer();
				MainService.serviceProvider.get(prm, {}, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			getBytestreamDatastream: function (idMedia, idBytestream, datastream) {
				var deferred = $q.defer();
				MainService.serviceProvider.get({ resource1: "media", element1: idMedia, resource2: "bytestream", element2: idBytestream, resource3: "datastream", element3: datastream }, {}, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			postMediaResource: function (idMedia, resource, idResource, comment, prm) {
				var deferred = $q.defer();
				MainService.serviceProvider.post({ resource1: "media", element1: idMedia, resource2: "datastream", element2: resource, comment: comment }, prm, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			putMediaResource: function (idMedia, resource, idResource, comment, prm) {
				var deferred = $q.defer();
				MainService.serviceProvider.put({ resource1: "media", element1: idMedia, resource2: "datastream", element2: resource, resource3: idResource, comment: comment }, prm, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			postBytestreamResource: function (idMedia, idBytestream, datastream, comment, prm) {
				var deferred = $q.defer();
				MainService.serviceProvider.post({ resource1: "media", element1: idMedia, resource2: "bytestream", element2: idBytestream, resource3: "datastream", element3: datastream, comment: comment }, prm, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			putBytestreamResource: function (idMedia, idBytestream, datastream, idResource, comment, prm) {
				var deferred = $q.defer();
				MainService.serviceProvider.put({ resource1: "media", element1: idMedia, resource2: "bytestream", element2: idBytestream, resource3: "datastream", element3: datastream, resource4: idResource, comment: comment }, prm, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			getBytestreamDatastreamHistory: function (idMedia, idBytestream, resource) {
				var deferred = $q.defer();
				MainService.serviceProvider.get({ resource1: "media", element1: idMedia, resource2: "bytestream", element2: idBytestream, resource3: 'datastream', element3: resource, resource4: 'history' }, {}, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			getColChildren: function (type, id) {
				var deferred = $q.defer();
				MainService.serviceProvider.getArray({ resource1: type, element1: id, resource2: "children" }, {}, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			postColRelatedMedia: function (type, id, prm) {
				var deferred = $q.defer();
				MainService.serviceProvider.postArray({ resource1: type, element1: id, resource2: "media" }, prm, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			deleteColRelatedMedia: function (type, idCol, idMedia) {
				var deferred = $q.defer();
				MainService.serviceProvider.deleteArray({ resource1: type, element1: idCol, resource2: "media", element2: idMedia }, {}, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			postRelatedMedia: function (id, prm) {
				var deferred = $q.defer();
				MainService.serviceProvider.post({ resource1: "media", element1: id, resource2: "RelatedMedia" }, prm, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			deleteRelatedMedia: function (idMedia, idRelMedia) {
				var deferred = $q.defer();
				MainService.serviceProvider.delete({ resource1: "media", element1: idMedia, resource2: "RelatedMedia", element2: idRelMedia }, {}, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			postBytestream: function (id, prm) {
				var deferred = $q.defer();
				MainService.serviceProvider.post({ resource1: "media", element1: id, resource2: "bytestream" }, prm, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			deleteBytestream: function (idMedia, idBytestream) {
				var deferred = $q.defer();
				MainService.serviceProvider.delete({ resource1: "media", element1: idMedia, resource2: "bytestream", element2: idBytestream }, {}, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			},
			postReplaceMedia: function (id, prm) {
				var deferred = $q.defer();
				MainService.serviceProvider.put({ resource1: "media", element1: id, resource2: "bytestream", element2: "originalReplace" }, prm, function (response) {
					deferred.resolve(response);
				}, function (error) {
					var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
					$log.error(errMsg);
					deferred.reject(errMsg);
				});
				return deferred.promise;
			}
		}
	}
})();
