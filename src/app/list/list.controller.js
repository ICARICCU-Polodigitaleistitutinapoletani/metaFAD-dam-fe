(function(){
    'use strict';

    /**
      *  @ngdoc function
      *  @name damApp.controller:ListCtrl
      *  @description
      *  # ListCtrl
      *  Controller of the damApp
      */
    angular.module('damApp')
        .controller('ListCtrl',ListCtrl);

    /** @ngInject */
    function ListCtrl($rootScope,$scope,$state,$stateParams,searchHistory,$location,MenuTabService,$window,$timeout,MainService,DamSearchService,FilterSearchService,InputSearchService,ListItemsService,listFactory, PinaxService,$uiMrFeedback){
        // inizializzo una variabile che referenzia il modulo
        var vm = this;
        var render = function(){
            MenuTabService.setMainActiveTab(0);
            $timeout(function(){
                vm.damSearchTemplateOptions.scrollable.height = checkDamSearchHeight();
            },400);
        };
        vm.cms = MainService.cms;
        var checkDamSearchHeight = function(){
            var eleHeight = 0;
            var windowHeight = MainService.getAppHeight($window.innerHeight);
            var damSearchPosition = angular.element("dam-search")[0].getBoundingClientRect().top;
            var dif = CONFIG.advancedSearchFixed ? 35 : 10;
            eleHeight = (windowHeight-damSearchPosition-dif);
            return eleHeight;
        };
        vm.damSearchTemplateOptions = {
            "activeList": MainService.activeList,
            "activeSort": MainService.activeSort,
            "actionType":"list",
            "inputSearch":true,
            "inputFixed":CONFIG.advancedSearchFixed,
            "actionBatch":vm.cms ? false : true,
            "searchSimilar":true,
            "sortedMenu":true,
            "listTemplate":true,
            "listItems":true,
            "filterSearch":true,
            "facetGroupNum": CONFIG.facetGroupNum,
            "folderManager":true,
            "collectionManager":true,
            "populateType":"populateList",
            "scrollable":{
                "height":600
            }
        };
        var damSearchComponents = {
            "inputSearch":false,
            "listItems":false,
            "filterSearch":false,
            "collectionManager":false,
            "folderManager":false
        };
        var finishLoaded = false;
        var checkEleLoaded = function(arEle){
            var finisch = true;
            _.forOwn(damSearchComponents,function(value){
                if(!value){
                    finisch=false;
                }
            });
            var stateInit = !finishLoaded && finisch;
            if(stateInit && MainService.initialized){
                finishLoaded = true;
                if(MainService.externalFilters){
                    var filters = typeof MainService.externalFilters === "string" ? JSON.parse(decodeURI(MainService.externalFilters)) : MainService.externalFilters;
                    FilterSearchService.setFiltersApplied(filters);
                    $location.search('externalFilters', null);
                }
                if(MainService.searchSimilarImg) {
                    var searchSimilarImg = _.clone(MainService.searchSimilarImg);
                    $scope.$broadcast("damSearchTriggerSearchSimilar", searchSimilarImg);
                    $location.search('searchSimilarImg', null);
                }
                if(MainService.externalFiltersOR){
                    var filtersOR = MainService.externalFiltersOR;
                    FilterSearchService.setFiltersORApplied(filtersOR);
                }
                if(MainService.externalInput){
                    var filters = typeof MainService.externalInput === "string" ? JSON.parse(decodeURI(MainService.externalInput)) : MainService.externalInput;
                    InputSearchService.setFiltersApplied(filters,true);
                    $location.search('externalInput', null);
                }
                FilterSearchService.manageEnableRefresh(false);
                if(searchHistory)
                    $timeout(function(){
                        $scope.$broadcast('damSearchTriggerRequestSearchHistory');
                        FilterSearchService.manageEnableRefresh(true);
                    },1000);
                else
                    $timeout(function(){
                        $scope.$broadcast('damSearchTriggerRequestSearch');
                        FilterSearchService.manageEnableRefresh(true);
                    },1000);
            }
        };
        var inputSearchReady = $scope.$on("inputSearchReady",function(event,ele){
            damSearchComponents[ele] = true;
            checkEleLoaded(damSearchComponents);
        });
        var listItemsReady = $scope.$on("listItemsReady",function(event,ele){
            damSearchComponents[ele] = true;
            checkEleLoaded(damSearchComponents);
            $scope.$broadcast("listItemsSetActionSelected","selected");
        });
        var filterSearchReady = $scope.$on("filterSearchReady",function(event,ele){
            damSearchComponents[ele] = true;
            checkEleLoaded(damSearchComponents);
        });
        var collectionManagerReady = $scope.$on("collectionManagerReady",function(event,ele){
            damSearchComponents[ele] = true;
            checkEleLoaded(damSearchComponents);
        });
        var folderManagerReady = $scope.$on("folderManagerReady",function(event,ele){
            damSearchComponents[ele] = true;
            checkEleLoaded(damSearchComponents);
        });
        var syncInfo = $scope.$on("mainSyncInformation",function(event,info){
            checkEleLoaded(damSearchComponents);
            $scope.$broadcast("inputSearchSetFiltersApplied",null);
        });
        $(window).on("resize.doResize", function (){
            $scope.$apply(function(){
                vm.damSearchTemplateOptions.scrollable.height = checkDamSearchHeight();
            });
        });
        var eventReturnSelection = $scope.$on("listReturnSelection",function(event,ele){
            vm.returnSelection();
        });
        vm.returnSelection = function(empty) {
            $scope.$emit('main:returnSelection',empty);
        };
        var onSuccessReturnSelection = $scope.$on('main:successReturnSelection',function(ev,obj){
            MainService.setHistorySearch();
            ListItemsService.clearObjSelectedInController();
            //window.location.reload();
        });
        var actionBatchPostSuccess = $rootScope.$on('damActionBatchPostSuccess', function (ev, data) {
            var list = ListItemsService.getObjList();
            _.forEach(list, function(ele) {
                if(data.medias.indexOf(ele.id) !== -1)
                    ele.bytestream_batch=true;
            });
            ListItemsService.setObjList(list);
        });
        //funzione che emette l'evento callRouter passandogli stato e parametri. Questo evento sarà ascoltato dal main controller che scatenerà il cambiamento di stato
        vm.goToRouter = function(state,params){
            $scope.$broadcast('callRouter',state,params);
        };
        $scope.$on("$stateChangeStart",function (){
            $(window).off("resize.doResize");
            syncInfo();
            inputSearchReady();
            listItemsReady();
            filterSearchReady();
            collectionManagerReady();
            folderManagerReady();
            eventReturnSelection();
            onSuccessReturnSelection();
            actionBatchPostSuccess();
        });
        render();
    }
}());
