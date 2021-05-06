(function() {
  'use strict';

  angular
    .module('filterSearchMdl')
    .directive('filterSearch', filterSearch)

  /** @ngInject */
    function filterSearch() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/damSearch/filterSearch/filterSearch.html',
            scope: {
                templateoptions:'='
            },
            controller: filterSearchController,
            controllerAs: 'filterSearch',
            bindToController: true
        };
        return directive;
    }

    /** @ngInject */
    function filterSearchController($scope,$rootScope,$location, FilterSearchService,DamCollectionManagerService,MainService){
        var vm = this;
        var render = function(){
        };
        vm.cms = MainService.cms;
        vm.toggle=function(variable){
            if (!variable){
                return 1;
            }
            else{
                return 0;
            }
        };
        vm.filtersBox = {
            filters:true,
            collection:false,
            folder:false
        };
        vm.facetGroupNum = vm.templateoptions.facetGroupNum || 10;
        vm.filtersApplied = [];
        var syncFiltersApplied = $rootScope.$on('filterSearchSetFiltersApplied', function (event, objs) {
            vm.filtersApplied = objs;
            DamCollectionManagerService.setExpandNode("collection",[],"path",false);
            _.forEach(objs,function(value,key){
                if(value["collection"])
                    DamCollectionManagerService.addExpandNode("collection",value["collection"],"path",false);
                else if(value["folder"])
                    DamCollectionManagerService.addExpandNode("folder",value["folder"],"path",false);
            });
        });
        vm.addFiltersApplied = function(key,value){
            var obj = {};
            obj[key]=value;
            FilterSearchService.addFiltersApplied(obj);
            vm.filtersApplied = FilterSearchService.getFiltersApplied();
            $scope.$emit('damSearchTriggerRequestSearch');
        };
        vm.removeFiltersApplied = function(obj){
            FilterSearchService.removeFiltersApplied(obj);
            if (obj.type === 'IMAGE') {
                vm.disableSearchSimilar();
            }
            vm.filtersApplied = FilterSearchService.getFiltersApplied();
            $scope.$emit('damSearchTriggerRequestSearch');
        };
        vm.filters = [];
        var syncFilters = $rootScope.$on('filterSearchSetFilters', function (event, objs) {
            vm.filters = objs;
            vm.setFacetOrInFiltersApplied(vm.filtersApplied);
        });
        vm.showColFol = {
            collection:true,
            folder:true
        };
        vm.facetInFacetOr = function(key){
            var check = CONFIG.facetOr.indexOf(key)!==-1;
            return check;
        };
        vm.isInFiltersApplied = function(key) {
            var check = _.find(vm.filtersApplied, function (o) {
                return _.has(o, key) ? o : false;
            });
            return check;
        };
        vm.setFacetOrInFiltersApplied = function(filters){
            _.forEach(filters,function(filter,index){
                var fil = _.clone(filter);
                var key = Object.keys(fil)[0];
                var check = CONFIG.facetOr.indexOf(key)!==-1;
                if(check){
                    if(!_.isArray(fil[key]))
                        fil[key] = [fil[key]];
                    _.forEach(fil[key],function(v,i){
                        var filChecked = _.find(vm.filters[key],{'label':v});
                        filChecked.checked = true;
                    });
                }
            });
        };
        vm.changeFacetOr = function(key,filter){
            var obj = _.find(vm.filtersApplied,function(o){
                return _.has(o, key) ? o : false; 
            });
            if(obj){
                FilterSearchService.removeFiltersApplied(obj);
                if(!_.isArray(obj[key]))
                    obj[key] = [obj[key]];
                var check = obj[key].indexOf(filter.label);
                if(check!==-1){
                    obj[key].splice(check,1);
                    if(!obj[key].length){
                        $scope.$emit('damSearchTriggerRequestSearch');
                        return;
                    }
                    obj[key].length===1 ? obj[key] = obj[key][0] : obj[key];
                }
                else{
                    obj[key].push(filter.label);
                }
                FilterSearchService.addFiltersApplied(obj);
            }
            else{            
                var obj = {};
                obj[key]=filter.label;
                FilterSearchService.addFiltersApplied(obj);
            }
            $scope.$emit('damSearchTriggerRequestSearch');
        };
        var setCollectionFolderTree = $rootScope.$on('filterSearchSetCollectionFolderTree', function(event,instance,obj){
            vm.showColFol[instance] = obj.length>0;
            DamCollectionManagerService.initTree(instance,vm.treeConfig,obj,true,"path");
        });
        vm.checkContantFilters = function(filter){
            var check = _.find(MainService.constantFilters,filter);
            return check;
        };
        vm.treeConfig = {
            extensions: ["glyph"],
            activate: function(event, data){
                DamCollectionManagerService.setActiveNode(data.options.instance,data.node,false);
                var path = DamCollectionManagerService.getActivePath(data.options.instance);
                vm.addFiltersApplied(data.options.instance,path);
            },
            glyph: {
                map: {
                    doc: "fa fa-align-left",
                    docOpen: "fa fa-align-left",
                    checkbox: "fa fa-unchecked",
                    checkboxSelected: "fa fa-check",
                    checkboxUnknown: "fa fa-share",
                    dropMarker: "fa fa-arrow-right",
                    expanderClosed: "fa fa-caret-right",
                    expanderOpen: "fa fa-caret-down",
                    folder: "fa fa-folder-o hidden",
                    folderOpen: "fa fa-folder-open-o hidden",
                }
            }
        };
        $scope.$on("$destroy",function(){
            syncFiltersApplied();
            syncFilters();
            setCollectionFolderTree();
            DamCollectionManagerService.refresh();
            FilterSearchService.refresh();
        });
        $scope.$emit("filterSearchReady","filterSearch");

        // SEARCH SIMILAR IMAGES
        $scope.$on("damSearchTriggerRequestSearchSimilar", function(event, id, previewUrl) {
            if (id) {
                vm.addFiltersApplied('searchSimilarImg', id);
            }
            vm.searchSimilarPreviewUrl = previewUrl;
        });
        vm.disableSearchSimilar = function() {
            vm.removeFiltersApplied('searchSimilarImg', vm.searchSimilarSelectedMedia);
            $scope.$emit("damSearchTriggerRequestSearchSimilar", undefined, undefined);
        }
        render();
    }
})();
