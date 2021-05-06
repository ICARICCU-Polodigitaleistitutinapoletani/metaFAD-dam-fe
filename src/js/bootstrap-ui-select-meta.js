angular.module("schemaForm").run(["$templateCache", function (e) {
    e.put("directives/decorators/bootstrap/uiselect/multi.html", '<div class="form-group {{form.htmlClass}}" ng-class="{\'has-error\': hasError(), \'has-success\': hasSuccess(), \'has-feedback\': form.feedback !==false}" ng-init="form.select_models=(form.schema.items| whereMulti : \'value\' : ($$value$$||[]))"><label class="control-label" ng-show="showTitle()">{{form.title}}</label> <div class="form-group" ng-controller="UiSelectController"> <ui-select multiple="" sortable-options="{{form.sortableOptions}}" ng-if="!(form.options.tagging||false)" ng-model="form.select_models" theme="bootstrap" on-select="$$value$$.push($item.value)" ng-disabled="form.readonly" on-remove="$$value$$.splice($$value$$.indexOf($item.value), 1)" class="{{form.options.uiClass}}"> <ui-select-match allow-clear="{{allowClear($$value$$)}}" placeholder="{{form.placeholder || form.schema.placeholder || (\'placeholders.select\' | translate)}}">{{$item.label}}</ui-select-match> <ui-select-choices refresh="fetchResult(form.schema, form.options, $select.search)" refresh-delay="form.options.refreshDelay" group-by="form.options.groupBy" repeat="item in form.schema.items | propsFilter:{label: $select.search, description: (form.options.searchDescriptions===true ? $select.search : \'NOTSEARCHINGFORTHIS\')}"> <div ng-bind-html="item.label | highlight: $select.search"></div><div ng-if="item.description"><span ng-bind-html="\'<small>\' + (\'\'+item.description | highlight: (form.options.searchDescriptions===true ? $select.search : \'NOTSEARCHINGFORTHIS\'))+ \'</small>\'"></span> </div></ui-select-choices> </ui-select> <ui-select ng-controller="UiSelectController" multiple="" ng-disabled="form.readonly" ng-if="(form.options.tagging||false) && !(form.options.groupBy || false)" tagging="form.options.tagging||false" tagging-label="form.options.taggingLabel" tagging-tokens="form.options.taggingTokens" sortable-options="{{form.sortableOptions}}" ng-model="form.select_models" theme="bootstrap" on-select="$$value$$.push($item.value)" on-remove="$$value$$.splice($$value$$.indexOf($item.value), 1)" class="{{form.options.uiClass}}"> <ui-select-match allow-clear="{{allowClear($$value$$)}}" placeholder="{{form.placeholder || form.schema.placeholder || (\'placeholders.select\' | translate)}}">{{$item.label}}&nbsp;<small>{{($item.isTag===true ? form.options.taggingLabel : \'\')}}</small> </ui-select-match> <ui-select-choices refresh-delay="form.options.refreshDelay" refresh="fetchResult(form.schema, form.options, $select.search)" repeat="item in form.schema.items | propsFilter:{label: $select.search, description: (form.options.searchDescriptions===true ? $select.search : \'NOTSEARCHINGFORTHIS\')}"> <div ng-if="item.isTag" ng-bind-html="\'<div>\' + (item.label | highlight: $select.search) + \' \' + form.options.taggingLabel + \'</div><div class=&quot;divider&quot;></div>\'"> </div><div ng-if="!item.isTag" ng-bind-html="item.label + item.isTag | highlight: $select.search"></div><div ng-if="item.description"><span ng-bind-html="\'<small>\' + (\'\'+item.description | highlight: (form.options.searchDescriptions===true ? $select.search : \'NOTSEARCHINGFORTHIS\')) + \'</small>\'"></span> </div></ui-select-choices> </ui-select> <ui-select ng-controller="UiSelectController" multiple="" ng-disabled="form.readonly" ng-if="(form.options.tagging||false) && (form.options.groupBy || false)" tagging="form.options.tagging||false" tagging-label="form.options.taggingLabel" tagging-tokens="form.options.taggingTokens" sortable-options="{{form.sortableOptions}}" ng-model="form.select_models" theme="bootstrap" on-select="$$value$$.push($item.value)" on-remove="$$value$$.splice($$value$$.indexOf($item.value), 1)" class="{{form.options.uiClass}}"> <ui-select-match allow-clear="{{allowClear($$value$$)}}" placeholder="{{form.placeholder || form.schema.placeholder || (\'placeholders.select\' | translate)}}">{{$item.label}}&nbsp;<small>{{($item.isTag===true ? form.options.taggingLabel : \'\')}}</small> </ui-select-match> <ui-select-choices group-by="form.options.groupBy" refresh-delay="form.options.refreshDelay" refresh="fetchResult(form.schema, form.options, $select.search)" repeat="item in form.schema.items | propsFilter:{label: $select.search, description: (form.options.searchDescriptions===true ? $select.search : \'NOTSEARCHINGFORTHIS\')}"> <div ng-if="item.isTag" ng-bind-html="\'<div>\' + (item.label | highlight: $select.search) + \' \' + form.options.taggingLabel + \'</div><div class=&quot;divider&quot;></div>\'"> </div><div ng-if="!item.isTag" ng-bind-html="item.label + item.isTag | highlight: $select.search"></div><div ng-if="item.description"><span ng-bind-html="\'<small>\' + (\'\'+item.description | highlight: (form.options.searchDescriptions===true ? $select.search : \'NOTSEARCHINGFORTHIS\')) + \'</small>\'"></span> </div></ui-select-choices> </ui-select><input toggle-model="" type="hidden" ng-model="insideModel" sf-changed="form" schema-validate="form"> <span ng-if="form.feedback !==false" class="form-control-feedback" ng-class="evalInScope(form.feedback) ||{\'glyphicon\': true, \'glyphicon-ok\': hasSuccess(), \'glyphicon-remove\': hasError()}"></span> <div class="help-block" ng-show="(hasError() && errorMessage(schemaError())) || form.description" ng-bind-html="(hasError() && errorMessage(schemaError())) || form.description"></div></div></div>'),
        e.put("directives/decorators/bootstrap/uiselect/single.html", '<div class="form-group {{form.htmlClass}}" ng-class="{\'has-error\': hasError(), \'has-success\': hasSuccess(), \'has-feedback\': form.feedback !==false}" ng-init="select_models=(form.schema.items | where :{value: $$value$$})"><label class="control-label" ng-show="showTitle()">{{form.title}}</label> <div class="form-group" ng-init="select_model.selected=select_models[0]"> <ui-select ng-model="form.select_model.selected" ng-controller="UiSelectController" ng-if="!(form.options.tagging||false)" theme="bootstrap" ng-disabled="form.readonly" on-select="$$value$$=$item.value" class="{{form.options.uiClass}}"> <ui-select-match allow-clear="{{allowClear($$value$$)}}" placeholder="{{form.placeholder || form.schema.placeholder || (\'placeholders.select\' | translate)}}">{{form.select_model.selected.label}}</ui-select-match> <ui-select-choices refresh="fetchResult(form.schema, form.options, $select.search)" refresh-delay="form.options.refreshDelay" group-by="form.options.groupBy" repeat="item in form.schema.items | propsFilter:{label: $select.search, description: (form.options.searchDescriptions===true ? $select.search : \'NOTSEARCHINGFORTHIS\')}"> <div ng-bind-html="item.label | highlight: $select.search"></div><div ng-if="item.description"><span ng-bind-html="\'<small>\' + (\'\'+item.description | highlight: (form.options.searchDescriptions===true ? $select.search : \'NOTSEARCHINGFORTHIS\'))+ \'</small>\'"></span> </div></ui-select-choices> </ui-select> <ui-select ng-controller="UiSelectController" ng-model="select_model.selected" ng-if="(form.options.tagging||false) && !(form.options.groupBy || false)" tagging="form.options.tagging||false" tagging-label="form.options.taggingLabel" tagging-tokens="form.options.taggingTokens" theme="bootstrap" ng-disabled="form.readonly" on-select="$$value$$=$item.value" class="{{form.options.uiClass}}"> <ui-select-match allow-clear="{{allowClear($$value$$)}}" placeholder="{{form.placeholder || form.schema.placeholder || (\'placeholders.select\' | translate)}}">{{select_model.selected.label}}&nbsp;<small>{{(select_model.selected.isTag===true ? form.options.taggingLabel : \'\')}}</small> </ui-select-match> <ui-select-choices refresh="form.options.refreshMethod(form.schema, $select.search)" refresh-delay="form.options.refreshDelay" repeat="item in form.schema.items | propsFilter:{label: $select.search, description: (form.options.searchDescription===true ? $select.search : \'NOTSEARCHINGFORTHIS\')}"> <div ng-if="item.isTag" ng-bind-html="\'<div>\' + (item.label | highlight: $select.search) + \' \' + form.options.taggingLabel + \'</div><div class=&quot;divider&quot;></div>\'"> </div><div ng-if="!item.isTag" ng-bind-html="item.label + item.isTag| highlight: $select.search"></div><div ng-if="item.description"><span ng-bind-html="\'<small>\' + (\'\'+item.description | highlight: (form.options.searchDescriptions===true ? $select.search : \'NOTSEARCHINGFORTHIS\')) + \'</small>\'"></span> </div></ui-select-choices> </ui-select> <ui-select ng-controller="UiSelectController" ng-model="select_model.selected" ng-if="(form.options.tagging||false) && (form.options.groupBy || false)" tagging="form.options.tagging||false" tagging-label="form.options.taggingLabel" tagging-tokens="form.options.taggingTokens" theme="bootstrap" ng-disabled="form.readonly" on-select="$$value$$=$item.value" class="{{form.options.uiClass}}"> <ui-select-match allow-clear="{{allowClear($$value$$)}}" placeholder="{{form.placeholder || form.schema.placeholder || (\'placeholders.select\' | translate)}}">{{select_model.selected.label}}&nbsp;<small>{{(select_model.selected.isTag===true ? form.options.taggingLabel : \'\')}}</small> </ui-select-match> <ui-select-choices group-by="form.options.groupBy" refresh="form.options.refreshMethod(form.schema, $select.search)" refresh-delay="form.options.refreshDelay" repeat="item in form.schema.items | propsFilter:{label: $select.search, description: (form.options.searchDescription===true ? $select.search : \'NOTSEARCHINGFORTHIS\')}"> <div ng-if="item.isTag" ng-bind-html="\'<div>\' + (item.label | highlight: $select.search) + \' \' + form.options.taggingLabel + \'</div><div class=&quot;divider&quot;></div>\'"> </div><div ng-if="!item.isTag" ng-bind-html="item.label + item.isTag| highlight: $select.search"></div><div ng-if="item.description"><span ng-bind-html="\'<small>\' + (\'\'+item.description | highlight: (form.options.searchDescriptions===true ? $select.search : \'NOTSEARCHINGFORTHIS\')) + \'</small>\'"></span> </div></ui-select-choices> </ui-select><input type="hidden" toggle-single-model="" sf-changed="form" ng-model="insideModel" schema-validate="form"> <span ng-if="form.feedback !==false" class="form-control-feedback" ng-class="evalInScope(form.feedback) ||{\'glyphicon\': true, \'glyphicon-ok\': hasSuccess(), \'glyphicon-remove\': hasError()}"></span> <div class="help-block" ng-show="(hasError() && errorMessage(schemaError())) || form.description" ng-bind-html="(hasError() && errorMessage(schemaError())) || form.description"></div></div></div>')
}]), angular.module("schemaForm").config(["schemaFormProvider", "schemaFormDecoratorsProvider", "sfPathProvider", function (e, t, s) {
    var l = function (t, l, o) {
        if ("string" === l.type && "uiselect" == l.format) {
            var i = e.stdFormObj(t, l, o);
            return i.key = o.path, i.type = "uiselect", o.lookup[s.stringify(o.path)] = i, i
        }
    };
    e.defaults.string.unshift(l);
    l = function (t, l, o) {
        if ("number" === l.type && "uiselect" == l.format) {
            var i = e.stdFormObj(t, l, o);
            return i.key = o.path, i.type = "uiselect", o.lookup[s.stringify(o.path)] = i, i
        }
    };
    e.defaults.number.unshift(l);
    e.defaults.array.unshift(function (t, l, o) {
        if ("array" === l.type && "uiselect" == l.format) {
            var i = e.stdFormObj(t, l, o);
            return i.key = o.path, i.type = "uimultiselect", o.lookup[s.stringify(o.path)] = i, i
        }
    }), t.addMapping("bootstrapDecorator", "uiselect", "directives/decorators/bootstrap/uiselect/single.html"), t.createDirective("uiselect", "directives/decorators/bootstrap/uiselect/single.html"), t.addMapping("bootstrapDecorator", "uimultiselect", "directives/decorators/bootstrap/uiselect/multi.html"), t.createDirective("uimultiselect", "directives/decorators/bootstrap/uiselect/multi.html")
}]).directive("toggleSingleModel", function () {
    return {
        require: "ngModel",
        restrict: "A",
        scope: {},
        replace: !0,
        controller: ["$scope", function (e) {
            e.$parent.$watch("select_model.selected", function () {
                void 0 != e.$parent.select_model.selected && (e.$parent.insideModel = e.$parent.select_model.selected.value, e.$parent.ngModel.$setViewValue(e.$parent.select_model.selected.value))
            })
        }]
    }
}).directive("toggleModel", function () {
    return {
        require: "ngModel",
        restrict: "A",
        scope: {},
        replace: !0,
        controller: ["$scope", "sfSelect", function (e, t) {
            var s = t(e.$parent.form.key, e.$parent.model);
            angular.isUndefined(s) && (s = [], t(e.$parent.form.key, e.$parent.model, s)), e.$parent.$watch("form.select_models", function () {
                0 == e.$parent.form.select_models.length ? (e.$parent.insideModel = e.$parent.$$value$$, void 0 != e.$parent.ngModel.$viewValue && e.$parent.ngModel.$setViewValue(e.$parent.form.select_models)) : (e.$parent.insideModel = e.$parent.form.select_models, e.$parent.ngModel.$setViewValue(e.$parent.form.select_models))
            }, !0)
        }]
    }
}).filter("whereMulti", function () {
    return function (e, t, s) {
        var l = [];
        return angular.isArray(s) ? s.forEach(function (s) {
            for (var o = 0; o < e.length; o++)
                if (s == e[o][t]) {
                    l.push(e[o]);
                    break
                }
        }) : l = e, l
    }
}).filter("propsFilter", function () {
    return function (e, t) {
        var s = [];
        return angular.isArray(e) ? e.forEach(function (e) {
            for (var l = !1, o = Object.keys(t), i = 0; i < o.length; i++) {
                var r = o[i];
                if (e.hasOwnProperty(r)) {
                    var a = t[r].toLowerCase();
                    if (0 === e[r].toString().toLowerCase().indexOf(a) || -1 !== e[r].toString().toLowerCase().indexOf(" " + a)) {
                        l = !0;
                        break
                    }
                }
            }
            l && s.push(e)
        }) : s = e, s
    }
}).controller("UiSelectController", ["$scope", "$http", function (e, t) {
    e.allowClear = function (e) {
        return "object" != typeof e && ("" !== e && void 0 !== e && null !== e)
    }, e.fetchResult = function (e, s, l) {
        if (s)
            if (s.callback) e.items = s.callback(e, s, l), console.log("items", e.items);
            else {
                if (s.http_post) return t.post(s.http_post.url, s.http_post.parameter).then(function (t) {
                    e.items = t.data, console.log("items", e.items)
                }, function (e, t) {
                    alert("Loading select items failed (URL: '" + String(s.http_post.url) + "' Parameter: " + String(s.http_post.parameter) + "\nError: " + t)
                });
                if (s.http_get) return t.get(s.http_get.url, s.http_get.parameter).then(function (t) {
                    e.items = t.data, console.log("items", e.items)
                }, function (e, t) {
                    alert("Loading select items failed (URL: '" + String(s.http_get.url) + "\nError: " + t)
                });
                if (s.async) return s.async.call(e, s, l).then(function (t) {
                    e.items = t.data, console.log("items", e.items)
                }, function (e, t) {
                    alert("Loading select items failed(Options: '" + String(s) + "\nError: " + t)
                })
            }
    }
}]);