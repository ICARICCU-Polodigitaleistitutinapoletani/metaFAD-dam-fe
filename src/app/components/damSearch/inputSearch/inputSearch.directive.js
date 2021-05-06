(function() {
  'use strict';

  angular
    .module('inputSearchMdl')
    .directive('inputSearch', inputSearch);

  /** @ngInject */
    function inputSearch() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/damSearch/inputSearch/inputSearch.html',
            scope: {
                boxFixed:"="
            },
            controller: inputSearchController,
            controllerAs: 'inputSearch',
            bindToController: true
        };
        return directive;
    }

    /** @ngInject */
    function inputSearchController($scope,$rootScope,$log,InputSearchService,inputSearchFactory,$templateCache,$compile,$timeout,$filter,mainFactory){
        var vm = this;
        vm.classFixed = vm.boxFixed ? "box-fixed" : "";
        var render = function(){
            compileSearchBox({});
        };
        $templateCache.put('angular-advanced-searchbox.html',
              "<div class=\"advancedSearchBoxContainer\"><div class=\"advancedSearchBox\" ng-class={active:focus} ng-init=\"focus = false\"><a id=\"removeAllFilters\" ng-href=\"\" ng-click=removeAll() ng-show=\"false\" role=button><span class=\"remove-all-icon glyphicon glyphicon-trash\"></span></a><div class=\"content-box-parameters\" ng-scrollbars ng-scrollbars-config=\"{axis: 'yx'}\"><div class=\"box-parameters\"><div class=\"search-parameter\" ng-repeat=\"searchParam in searchParams\"><a ng-href=\"\" ng-click=removeSearchParam($index) role=button><span class=\"remove glyphicon glyphicon-remove-circle\"></span></a><div class=key>{{searchParam.name}}:</div><div class=value><span ng-show=!searchParam.editMode ng-click=enterEditMode($index)>{{searchParam.value}}</span> <input name=value nit-auto-size-input nit-set-focus=searchParam.editMode class=\"inputSingleParam\" ng-keydown=\"keydown($event, $index)\" ng-keyup=\"keyup($event, $index)\" ng-blur=leaveEditMode($index) ng-show=searchParam.editMode ng-model=searchParam.value placeholder=\"{{searchParam.placeholder}}\"></div></div><input name=searchbox class=search-parameter-input nit-set-focus=setSearchFocus ng-keydown=keydown($event) placeholder={{placeholder}} ng-focus=\"focus = true\" ng-blur=\"setSearchQuery()\" typeahead-on-select=\"typeaheadOnSelect($item, $model, $label)\" typeahead=\"parameter as parameter.name for parameter in parameters | filter:{name:$viewValue} | limitTo:8\" ng-model=\"searchQuery\"></div></div><div class=search-parameter-suggestions ng-show=\"parameters && focus\"><span class=title>Filtra per:</span> <span class=search-parameter ng-repeat=\"param in parameters\" ng-mousedown=addSearchParam(param)>{{param.name}}</span></div></div><div class=\"advancedSearchBoxButtons\"><div class=\"button btn-search fg-white bg-blue left\" ng-click=\"searchClick()\"><span class=\"fa fa-search btn-icon\"></span><span class=\"btn-label\">Cerca</span></div><div class=\"button fg-white btn-azzera bg-grey left\" ng-click=\"removeAll(); $parent.clearQuery();\"><span class=\"fa fa-close btn-icon\"></span><span class=\"btn-label\">Azzera</span></div></div></div>"
            );
        //Inizio funzioni per controllo scroll x su box di ricerca
        var setBoxParameterWidth = function(width){
            angular.element("div.box-parameters").css("width",width);
            angular.element(".list-menu .mCSB_container").css("width",width);
            reloadListScrollbar(".content-box-parameters");
            //$(".content-box-parameters").mCustomScrollbar("update");
        };
        var calculateBoxParameterWidth = function(initWidth,index){
            var totWidth=initWidth;
            _(angular.element("div.search-parameter")).forEach(function(value, key){
                if(index!==key){
                    var eleWidth=angular.element(value)[0].clientWidth;
                    var inputWidth = angular.element(value)[0].querySelector('.inputSingleParam').clientWidth
                    totWidth+=(eleWidth-inputWidth+5+7);
                }
            });
            setBoxParameterWidth(totWidth+"px");
        };
        var enterEditMode = $scope.$on('advanced-searchbox:enterEditMode', function (event, searchParameter) {
            calculateBoxParameterWidth(450);
            vm.valueAutocomplete = null;
        });
        var addSearchParam = $scope.$on('advanced-searchbox:addSearchParam', function (event, searchParameter, searchParameters) {
            calculateBoxParameterWidth(450);
            vm.valueAutocomplete = null;
        });
        var leavedEditMode = $scope.$on('advanced-searchbox:leavedEditMode', function (event, searchParameter, searchParameters) {
            var params = [];
            _(searchParameters).forEach(function(value){
                var param = {};
                param[value.key] = value.value;
                params.push(param);
            });
            InputSearchService.setFiltersApplied(params,true);
            $timeout(function(){
                calculateBoxParameterWidth(180);
                vm.valueAutocomplete = null;
            },50,false);
        });
        var removeSearchParam = $scope.$on('advanced-searchbox:removeSearchParam', function (event, index, searchParameters) {
            calculateBoxParameterWidth(180,index);
            var params = [];
            _(searchParameters).forEach(function(value){
                var param = {};
                param[value.key] = value.value;
                params.push(param);
            });
            InputSearchService.setFiltersApplied(params,true);
        });
        var removeAllSearchParam = $scope.$on('advanced-searchbox:removeAllSearchParam', function (event, index) {
            calculateBoxParameterWidth(180);
            InputSearchService.setFiltersApplied([],true);
            InputSearchService.setQueryApplied(null);
            vm.search();
        });
        var setSearchQuery = $scope.$on('advanced-searchbox:setSearchQuery', function (event, query, searchParameters) {
            vm.searchQuery = query;
            InputSearchService.setQueryApplied(query);
        });
        //Fine funzioni per controllo scroll x su box di ricerca

        var reloadListScrollbar = function(ele){
            $(ele).mCustomScrollbar("update");
        };
        var defaultSearchParams = [
            { "key": "title", "name": "Titolo", "placeholder": "Titolo..." },
            { "key": "author", "name": "Autore", "placeholder": "Autore..." },
            { "key": "tag", "name": "Tag", "placeholder": "Tag..." },
            { "key": "folder", "name": "Cartella", "placeholder": "Cartella..." },
            { "key": "collection", "name": "Collezione", "placeholder": "Collezione..." }
        ];
        //vm.availableSearchParams = CONFIG.availableSearchParams || defaultSearchParams;
        vm.searchParams = [];
        vm.searchQuery = "";
        var lastObjSetted = [];
        var syncFiltersApplied = $scope.$on('inputSearchSetFiltersApplied', function (event, objs) {
            var objSearch = objs || lastObjSetted;
            compileSearchBox(objSearch);
            lastObjSetted = objSearch;
        });
        var compileSearchBox = function(objs){
            var text = _.findIndex(objs,"text");
            vm.searchQuery = text===-1 ? "" : objs[text].text;
            if(text!==-1)
                objs.splice(text,1);
            vm.searchParams = objs;
            vm.availableSearchParams = CONFIG.availableSearchParams || defaultSearchParams;
            var ele = $compile('<nit-advanced-searchbox search-query="inputSearch.searchQuery" ng-model="inputSearch.searchParams" parameters="inputSearch.availableSearchParams" placeholder="Cerca..." search-click="inputSearch.search()"></nit-advanced-searchbox>')($scope);
            angular.element(".content-advSearBox").html(ele);
            $timeout(function(){calculateBoxParameterWidth(180);},100);
        };
        vm.search = function(){
            $scope.$emit('damSearchTriggerRequestSearch');  
        };
        var setValueOfSearchParam = $scope.$on("advanced-searchbox:setValueOfSearchParam",function(event,index,key,value){
            if(value===""){
                vm.valueAutocomplete = null;
            }
            vm.getAutocomplete(index,key,value); 
        });
        var searchParamActive = null;
        vm.getAutocomplete = function(index,key,val){
            var field = (_.find(vm.availableSearchParams, {"key":key}) && _.find(vm.availableSearchParams, {"key":key}).autocomplete) || key;
            var value = val;
            searchParamActive=index;
            if(field && value){
                var prm = {
                    field:field,
                    value:value
                };
                mainFactory.autocomplete(prm)
                .then(function(data){
                    vm.valueAutocomplete = data.value;
                })
                .catch(function(err){
                    $log.error(err);
                });
            }
        };
        vm.setFieldFromAutocomplete = function(value){
            $scope.$broadcast("advanced-searchbox:setValueOfSingleSearchParamFromOutside",searchParamActive,value);
            vm.valueAutocomplete = null;
        };
        $scope.$on("$destroy",function(){
            enterEditMode();
            addSearchParam();
            setSearchQuery();
            syncFiltersApplied();
            leavedEditMode();
            removeSearchParam();
            removeAllSearchParam();
            setValueOfSearchParam();
            InputSearchService.refresh();
        });
        $scope.$emit("inputSearchReady","inputSearch");
        render();
    }
})();
