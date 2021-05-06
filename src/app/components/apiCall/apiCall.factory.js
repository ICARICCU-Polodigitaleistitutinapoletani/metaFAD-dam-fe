(function () {
    'use strict';

    angular
        .module('apiCallMdl')
        .factory('apiCall', apiCall);

    /** @ngInject */
    function apiCall($location, $http, $q, $rootScope, $timeout) {
        return ({
            config: config,
            info: info,
            show: show,
            showall: showall,
            showCollectionsFolders: showCollectionsFolders,
            history: history,
            rollback: rollback,
            add: add,
            collectionFolder: collectionFolder,
            modify: modify,
            modifyBytestream: modifyBytestream,
            removeMedia: removeMedia,
            removeContainer: removeContainer,
            showFilesystem: showFilesystem,
            autocomplete: autocomplete,
            startBatch: startBatch,
            containerAdd: containerAdd,
            containerModify: containerModify,
            imageAutoTagging: imageAutoTagging,
            videoScenes: videoScenes,
            jsonParser: jsonParser,
            jsonStringify: jsonStringify
        });

        function config() {
            var request = $timeout(function () { return CONFIG }, 100);
            return (request.then(function (data) { return data }, handleError));
        }
        function info() {
            var request = $http.get(CONFIG.serverRoot + CONFIG.instance + '/info');
            return (request.then(handleSuccess, handleError));
        }
        function show(id) {
            var request = $http.get(CONFIG.serverRoot + CONFIG.instance + '/single/' + id);
            return (request.then(handleSuccess, handleError));
        }
        function showall(pageId, obj) {
            var request = $http.post(CONFIG.serverRoot + CONFIG.instance + '/all/' + pageId, obj);
            return (request.then(handleSuccess, handleError));
        }
        function showCollectionsFolders(type) {
            if (!type) {
                var request = $http.get(CONFIG.serverRoot + CONFIG.instance + '/collectionfolder/all/');
            }
            else {
                var request = $http.get(CONFIG.serverRoot + CONFIG.instance + '/collectionfolder/all/' + type);
            }

            return (request.then(handleSuccess, handleError));
        }
        function history(id) {
            var request = $http.get(CONFIG.serverRoot + CONFIG.instance + '/history/' + id);
            return (request.then(handleSuccess, handleError));
        }
        function rollback(modelID, detailID) {
            var request = $http.get(CONFIG.serverRoot + CONFIG.instance + '/rollback/' + modelID + '/' + detailID);
            return (request.then(handleSuccess, handleError));
        }
        function add(obj) {
            var request = $http.put(CONFIG.serverRoot + CONFIG.instance + '/add/', obj);
            return (request.then(handleSuccess, handleError));
        }
        function collectionFolder(obj) {
            var request = $http.post(CONFIG.serverRoot + CONFIG.instance + '/collectionfolder/', obj);
            return (request.then(handleSuccess, handleError));
        }
        function modify(id, obj) {
            var request = $http.post(CONFIG.serverRoot + CONFIG.instance + '/edit/' + id, obj);
            return (request.then(handleSuccess, handleError));
        }
        function modifyBytestream(download, obj) {
            var request = $http.post(CONFIG.serverRoot + CONFIG.instance + '/bytestream/edit/' + download, obj);
            return (request.then(handleSuccess, handleError));
        }
        function removeMedia(id) {
            var request = $http.delete(CONFIG.serverRoot + CONFIG.instance + '/delete/' + id);
            return (request.then(handleSuccess, handleError));
        }
        function removeContainer(id) {
            var request = $http.delete(CONFIG.serverRoot + CONFIG.instance + '/container/delete/' + id);
            return (request.then(handleSuccess, handleError));
        }
        function showFilesystem(obj) {
            var request = $http.post(CONFIG.serverRoot + CONFIG.instance + '/filesystem/', obj);
            return (request.then(handleSuccess, handleError));
        }
        function autocomplete(field, value) {
            var request = $http.get(CONFIG.serverRoot + CONFIG.instance + '/autocomplete/' + field + '/' + value);
            return (request.then(handleSuccess, handleError));
        }
        function startBatch(obj, mode) {
            var request = $http.post(CONFIG.serverRoot + CONFIG.instance + '/startbatch/' + mode, obj);
            return (request.then(handleSuccess, handleError));
        }
        function containerAdd(obj) {
            var request = $http.put(CONFIG.serverRoot + CONFIG.instance + '/container/add/', obj);
            return (request.then(handleSuccess, handleError));
        }
        function containerModify(id, obj) {
            var request = $http.post(CONFIG.serverRoot + CONFIG.instance + '/container/edit/' + id, obj);
            return (request.then(handleSuccess, handleError));
        }
        function imageAutoTagging(idMedia) {
            var url = CONFIG.imageTaggingUrl ? CONFIG.imageTaggingUrl : '';
            var request = $http.get(url + '?id=' + idMedia);
            return (request.then(handleSuccess, handleErrorAllowDataNull));
        }
        function videoScenes(idMedia) {
            var url = CONFIG.videoScenesUrl ? CONFIG.videoScenesUrl : '';
            var request = $http.get(url + '?id=' + idMedia);
            return (request.then(handleSuccess, handleErrorAllowDataNull));
        }
        function jsonParser(obj) {
            return JSON.parse(obj);
        }
        function jsonStringify(string) {
            return JSON.stringify(string);
        }

        function handleError(response) {
            console.log(response);
            if (!angular.isObject(response.data) || !response.data.message) {
                return ($q.reject("An unknown error occurred."));
            }
            return ($q.reject(response.data));
        }

        function handleErrorAllowDataNull(response) {
            return ($q.reject(response.data));
        }

        function handleSuccess(response) {
            return (response.data);
        }

    }
})();
