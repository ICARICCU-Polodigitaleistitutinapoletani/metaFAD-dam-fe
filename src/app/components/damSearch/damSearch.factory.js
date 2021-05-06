(function () {
    'use strict';

    angular
        .module('damSearchMdl')
        .factory('damSearchFactory', damSearchFactory);

    /** @ngInject */
    function damSearchFactory($q, MainService, DamSearchService, ListItemsService, FilterSearchService, InputSearchService, DamPaginationService, DamCollectionManagerService, $log) {
        return {
            search: function (prm) {
                var deferred = $q.defer();
                //Codice per obbligare la ricerca a inserire come filtro il media_type impostato in query string
                var mediaType = MainService.mediaType && _.findIndex(prm.filters, { "type": MainService.mediaType }) === -1;
                if (mediaType) {
                    prm.filters.push(
                        {
                            "type": MainService.mediaType
                        }
                    );
                }
                //Codice per obbligare la ricerca a inserire come filtri anche quelli passati in query string con il parametro constantFilters
                var constantFilters = MainService.constantFilters;
                _.forEach(constantFilters, function (value) {
                    var exist = _.findIndex(prm.filters, value);
                    if (exist === -1)
                        prm.filters.push(value);
                });

                var serviceUrl;
                var searchCallback = function(deferred, response) {
                    var results = response.results || [];
                    ListItemsService.setObjList(results);
                    var filters_applied = {
                        search: (response.filters_applied && response.filters_applied.search) || [],
                        filters: (response.filters_applied && response.filters_applied.filters) || []
                    }
                    InputSearchService.setFiltersApplied(filters_applied.search);
                    FilterSearchService.setFiltersApplied(filters_applied.filters);
                    var collection = (response.filters && response.filters.collection) || [];;
                    if(collection){
                        FilterSearchService.setCollectionFolderTree("collection",collection);
                        delete response.filters.collection;
                    }
                    var folder = (response.filters && response.filters.folder) || [];
                    if(folder) {
                        FilterSearchService.setCollectionFolderTree("folder",folder);
                        delete response.filters.folder;
                    }
                    var filters = response.filters || {};
                    FilterSearchService.setFilters(filters);
                    var page = response.page;
                    var pages = response.pages;
                    if(page && pages){
                        DamPaginationService.initPagination(page,pages);
                    }
                    DamSearchService.setSearchHistoryPrm(prm,false);
                    deferred.resolve(results);
                }
            
                if (MainService.isEnabledFeature('searchSimilarImages') &&
                    _.find(prm.filters, function (oObj) { return oObj.searchSimilarImg !== null && oObj.searchSimilarImg !== undefined; }) !== undefined) {
                    // SEARCH SIMILAR ACTIVE
                    console.log('prm', prm);
                    if (CONFIG.searchSimilarImagesUrl) {
                        MainService.searchSimilarProvider.post({}, prm, function (response) {
                            searchCallback(deferred, response);
                        }, function (error) {
                            var errMsg = error.data && error.data.response ? error.data.response : "Server non raggiungibile";
                            $log.error(errMsg);
                            deferred.reject(errMsg);
                        });
                    } else {
                        var errMsg = "URL per la ricerca di immagini simili non configurato.";
                        $log.error(errMsg);
                        deferred.reject(errMsg);
                    }
                } else {
                    serviceUrl = "search";
                    MainService.serviceProvider.post({ service: serviceUrl }, prm, function (response) {
                        searchCallback(deferred, response);
                    }, function (error) {
                        var errMsg = error.data && error.data.response ? error.data.response : "Server non raggiungibile";
                        $log.error(errMsg);
                        deferred.reject(errMsg);
                    });
                }

                return deferred.promise;
            },
            removeMedias: function (prm) {
                var deferred = $q.defer();
                MainService.serviceProvider.post({ resource1: 'removeMedias' }, prm, function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
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
        }
    }
})();