(function () {
    'use strict';
  
    angular
      .module('damMultiDownloadMdl')
      .factory('damMultiDownloadFactory', damMultiDownloadFactory);
  
    /** @ngInject */
    function damMultiDownloadFactory($q, $log, MainService) {
      return {
        postMultiDownload: function (medias) {
            var deferred = $q.defer();
            MainService.serviceProvider.multiDownload({ service: 'zip', resource1: 'download-media' }, medias, function (response) {
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
  