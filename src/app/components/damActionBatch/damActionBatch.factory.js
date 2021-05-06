(function() {
  'use strict';

  angular
    .module('damActionBatchMdl')
    .factory('damActionBatchFactory', damActionBatchFactory);

  /** @ngInject */
    function damActionBatchFactory($q, MainService, $log) {
        return {
				postActionBatch: function(prm) {
					var deferred = $q.defer();
					MainService.serviceProvider.post({service: 'batch'}, prm, function(response) {
						deferred.resolve(response);
					}, function(error) {
                        deferred.reject(error);
					});
					return deferred.promise;
				}
        }
    }
})();
