(function() {
    'use strict';

    angular
        .module('damFeedbackMdl')
        .provider('damFeedbackConfig', function () {
        var userAgent = [
            {"os":"Windows","theme":"windows10"},
            {"os":"Mac;","theme":"mac"},
            {"os":"iPad;","theme":"ios"},
            {"os":"iPhone;","theme":"ios"},
            {"os":"Android","theme":"android"}
        ];
        var checkDefaultTheme = function(){
            var theme = "mac";
            for(var i=0;i<userAgent.length;i++){
                if(navigator.userAgent.indexOf(userAgent[i].os) > -1){
                    theme = userAgent[i].theme;
                    return theme;
                }
            }
            return theme;
        };
        this.defaultTheme = checkDefaultTheme();
        this.defaultAnimation = "fade";
        this.$get = function () {
            return this;
        };
    })
    .directive('damFeedback', damFeedback);

    /** @ngInject */
    function damFeedback($document,$compile) {
        var directive = {
            restrict: 'E',
            //templateUrl: 'app/components/damFeedback/damFeedback.html',
            link:function(scope,elem,attrs){
                var template = '<div class="damFeedback" ng-class="damFeedback.theme">' +
                                    '<div class="box-feedback">' +
                                        '<div class="box-left">' +
                                            '<i class="fa fa-exclamation-triangle"></i>' +
                                        '</div>' +
                                        '<div class="box-content">' +
                                            '<div class="box-header">' +
                                                '<div class="title">' +
                                                    '{{damFeedback.feedback.title}}' +
                                                '</div>' +
                                                '<div class="button-close" ng-if="damFeedback.feedback.close" ng-click="damFeedback.close()">' +
                                                    '<i class="fa fa-times"></i>' +
                                                '</div>' +
                                            '</div>' +
                                            '<div class="box-body">' +
                                                '<div class="box-header-body">{{damFeedback.feedback.title}}</div>' +
                                                '{{damFeedback.feedback.msg}}' +
                                            '</div>' +
                                            '<div class="buttons-feedback">' +
                                                '<div class="box-btnAction" ng-if="damFeedback.feedback.btnAction">' +
                                                    '<div ng-repeat="button in damFeedback.feedback.btnAction" class="button-feedback" style="{{button.btnStyle}}" ng-click="damFeedback.action($index)">' +
                                                        '<i ng-if="button.icon" class="fa {{button.icon}}"></i>' +
                                                        '{{button.text}}' +
                                                    '</div>' +
                                                '</div>' +
                                                '<div class="button-feedback button-close" ng-if="damFeedback.feedback.close" ng-click="damFeedback.close()">' +
                                                    'Chiudi' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>';
                
                var initFeedback = function(){
                    var tpl = (scope.damFeedback.feedback && scope.damFeedback.feedback.template) ? scope.damFeedback.feedback.template : template;
                    elem.html(tpl).show();
                    $compile(elem.contents())(scope);
                    initDraggable();
                };
                var initDraggable = function(){
                    var startX, startY, x = 0, y = 0,
                        start, stop, drag, container;

                    var width  = elem[0].offsetWidth,
                        height = elem[0].offsetHeight;

                    if (scope.dragOptions) {
                        start  = scope.dragOptions.start;
                        drag   = scope.dragOptions.drag;
                        stop   = scope.dragOptions.stop;
                        var id = scope.dragOptions.container;
                        if (id) {
                            container = document.getElementById(id).getBoundingClientRect();
                        }
                    }
                    
                    var box = elem.find(".damFeedback");
                    var header = elem.find(".box-content .box-header");
                    header.on('mousedown', function(e) {
                        e.preventDefault();
                        startX = e.clientX - box[0].offsetLeft;
                        startY = e.clientY - box[0].offsetTop;
                        $document.on('mousemove', mousemove);
                        $document.on('mouseup', mouseup);
                        if (start) start(e);
                    });

                    function mousemove(e) {
                        y = e.clientY - startY;
                        x = e.clientX - startX;
                        setPosition();
                        if (drag) drag(e);
                    }

                    function mouseup(e) {
                        $document.unbind('mousemove', mousemove);
                        $document.unbind('mouseup', mouseup);
                        if (stop) stop(e);
                    }

                    function setPosition() {
                        if (container) {
                            if (x < container.left) {
                                x = container.left;
                            } else if (x > container.right - width) {
                                x = container.right - width;
                            }
                            if (y < container.top) {
                                y = container.top;
                            } else if (y > container.bottom - height) {
                                y = container.bottom - height;
                            }
                        }

                        box.css({
                            top: y + 'px',
                            left:  x + 'px'
                        });
                    }
                };
                initFeedback();
            },
            scope: {
                feedback:"="
            },
            replace:true,
            controller: damFeedbackController,
            controllerAs: 'damFeedback',
            bindToController: true
        };
        return directive;
    }

    /** @ngInject */
    function damFeedbackController($scope,$element,damFeedbackConfig,$timeout) {
        // inizializzo una variabile che referenzia il modulo
        var vm = this;
        var animation = vm.feedback && vm.feedback.animation ? "animation-" + vm.feedback.animation : "animation-fade";
        vm.close = function(){
            if(vm.feedback.fnClose){
                var params = vm.feedback.fnClose.params;
                vm.feedback.fnClose.func.apply(this,params);  
            }
            vm.feedback = null;
        };
        vm.action = function(index){
            var params = vm.feedback.btnAction[index].params;
            vm.feedback.btnAction[index].func.apply(this,params);
        };
        var animation = damFeedbackConfig.defaultAnimation;
        var setAnimation = function(){
            animation = vm.feedback && vm.feedback.animation ? "animation-" + vm.feedback.animation : "animation-" + animation;
            $element.find(".damFeedback").addClass("damFeedback-show " + animation);
            $timeout(function(){
                $element.find(".damFeedback").addClass(animation + "-show");
            },50);
        };
        var removeAnimation = function(){
            $element.find(".damFeedback").removeClass(animation + "-show");
            $timeout(function(){
                $element.find(".damFeedback").removeClass("damFeedback-show " + animation);
                animation = damFeedbackConfig.defaultAnimation;
            },350);
        };
        $scope.$watch("damFeedback.feedback",function(newVal,oldVal){
            if(newVal !== oldVal){
                if(newVal){
                    vm.theme = vm.feedback && vm.feedback.theme ? vm.feedback.theme : damFeedbackConfig.defaultTheme;
                    setAnimation();
                }
                else{
                    removeAnimation();
                }
            }
        }),true;
    }
})();
