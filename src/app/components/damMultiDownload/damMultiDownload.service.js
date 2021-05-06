(function () {
    'use strict';

    angular
        .module('damMultiDownloadMdl')
        .service('DamMultiDownloadService', DamMultiDownloadService);

    /** @ngInject */
    function DamMultiDownloadService($sce, $uiMrFeedback, $filter, $interval, ngToast, damMultiDownloadFactory) {
        var vm = this;
        var runningDownloads = [];
        var maxDowloadSize = 1e+9; // 1GB
        vm.startDownload = function (medias) {
            var size = 0;
            _.forEach(medias, function (obj) {
                if (!obj.size) {
                    console.log(obj);
                }
                size += obj.size ? obj.size : 0;
            });
            console.log('size', size);
            if (size > maxDowloadSize) {
                ngToast.danger({
                    content: 'Gli elementi selezionati superano il peso massimo consentito per il download massivo.',
                    dismissOnTimeout: true,
                    timeout: 2000
                });
                return false;
            }
            var stringMedia = medias.length === 1 ? '1 elemento' : medias.length + ' elementi';
            var mediasInfo = stringMedia + ' - ' + $filter('bytes')(size);
            var requestId = new Date().valueOf();
            var toastObj = ngToast.info({
                content: $sce.trustAsHtml('<div style="text-align:left; min-width: 220px;"><b>Preparazione archivio in corso</b></div>' +
                    '<div style="text-align:left;">' + mediasInfo + '</div>' +
                    '<div style="text-align:center"><i class="fa fa-spinner fa-pulse"></i></div>'),
                compileContent: true,
                dismissOnClick: false,
                dismissOnTimeout: false,
                dismissButton: true,
                onDismiss: function () {
                    const requestObj = getRequestObj(requestId);
                    requestObj.cancelled = true;
                }
            });
            var mediasId = _.map(medias, function (media) { return media.id });
            runningDownloads.push({
                id: requestId,
                toastObj: toastObj,
                medias: mediasId,
                mediasInfo: mediasInfo
            });
            this.launchRequest(requestId);
            return true;
        }

        var startPeriodicRequest = function (requestObj) {
            if (requestObj) {
                requestObj.periodicRequest = $interval(function() {
                    vm.launchRequest(requestObj.id);
                }, 5000);
            }
        }
        var stopPeriodicRequest = function (requestObj) {
            if (requestObj && angular.isDefined(requestObj.periodicRequest)) {
                $interval.cancel(requestObj.periodicRequest);
                requestObj.periodicRequest = undefined;
            }
        };
        var getRequestObj = function (requestId) {
            return _.findWhere(runningDownloads, { id: requestId });
        };

        vm.launchRequest = function (requestId) {
            var requestObj = getRequestObj(requestId);
            if (requestObj) {
                damMultiDownloadFactory.postMultiDownload(requestObj.medias)
                    .then(function (data) {
                        if (data && data.status === 'ready') {
                            if (requestObj && !requestObj.cancelled) {
                                var link = document.createElement("a");
                                link.href = data.url;
                                link.style = "visibility:hidden";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);

                                stopPeriodicRequest(requestObj);
                                ngToast.dismiss(requestObj.toastObj);
                                ngToast.info({
                                    content: $sce.trustAsHtml('<div style="min-width:220px; text-align:left">' +
                                        '<div><b>Archivio pronto</b></div>' +
                                        '<div>' + requestObj.mediasInfo + '</div>' +
                                        '<div>' +
                                        '<i class="fa fa-arrow-circle-o-down pointer" style="margin-right:10px"></i>' +
                                        '<a href="' + data.url + '" target="_blank">Scarica pacchetto</a>' +
                                        '</div>' +
                                        '</div>'),
                                    compileContent: true,
                                    dismissOnClick: false,
                                    dismissOnTimeout: true,
                                    timeout: 10000,
                                    dismissButton: true,
                                    onDismiss: function () {
                                        var index = _.findIndex(runningDownloads, function (obj) { return obj && obj.id === requestId; }) || -1;
                                        if (index > -1) {
                                            runningDownloads.splice(index, 1);
                                        }
                                    }
                                });
                            }
                        } else if (!angular.isDefined(requestObj.periodicRequest)){
                            startPeriodicRequest(requestObj);
                        }
                    })
                    .catch(function (err) {
                        if (requestObj && !requestObj.cancelled) {
                            var feedback = {
                                title: "Attenzione",
                                msg: "C'è stato un errore nella richiesta",
                                close: true
                            };
                            $uiMrFeedback.error(feedback);
                            ngToast.dismiss(requestObj.toastObj);
                            stopPeriodicRequest(requestObj);
                        }
                    });
            }
        }
    }
})();
