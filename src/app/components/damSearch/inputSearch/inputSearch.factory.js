(function () {
  'use strict';

  angular
    .module('inputSearchMdl')
    .factory('inputSearchFactory', inputSearchFactory);

  /** @ngInject */
  function inputSearchFactory($q, MainService) {
    return {
      getAutocomplete: function (field, value) {
        var deferred = $q.defer();
        MainService.serviceProvider.getArray({ service: 'autocomplete', resource1: field, element1: value }, {}, function (response) {
          deferred.resolve(response);
        }, function (error) {
          deferred.reject(error);
        });
        return deferred.promise;
      }
    }
  }
})();
