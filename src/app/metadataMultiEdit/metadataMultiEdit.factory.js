(function () {
  'use strict';

  angular
    .module('damApp')
    .factory('metadataMultiEditFactory', metadataMultiEditFactory);

  /** @ngInject */
  function metadataMultiEditFactory($q, $log, MainService) {
    return {
      getSchemaForm: function () {
        var deferred = $q.defer();
        MainService.serviceProvider.get({ service: 'batch-edit', resource1: 'schema' }, {}, function (response) {
          deferred.resolve(response);
        }, function (error) {
          var errMsg = (error.data && error.data.message) ? error.data.message : "Server non raggiungibile";
          $log.error(errMsg);
          deferred.reject(errMsg);
        });
        return deferred.promise;
      },

      postChanges: function (medias, changes) {
        var deferred = $q.defer();
        MainService.serviceProvider.post({ service: 'batch-edit', resource1: 'save' }, {
          id: medias,
          data: changes
        }, function (response) {
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
