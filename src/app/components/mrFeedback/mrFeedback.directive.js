(function () {
    'use strict';

    angular
        .module('mrFeedbackMdl')
        .provider('mrFeedbackConfig', function () {
            this.defaultTheme = "web";
            this.defaultAnimation = "fade";

            this.$get = function () {
                return this;
            };
        })
        .provider('$uiMrFeedback', function () {
            this.$get = ['$compile', '$log', '$timeout', '$document', '$rootScope', function ($compile, $log, $timeout, $document, $rootScope) {
                var providedScope = $rootScope;
                var mrFeedbackScope = providedScope.$new();
                var index = 0;

                // TEMP
                this.changeTheme = function(theme) {
                    console.log(mrFeedbackScope);
                    this.currentFeedbackOpened.theme = theme;
                };

                this._doOpen = function (options) {
                    if (!this.currentFeedbackOpened) {
                        if (!options)
                            return $log.error("mrFeedback: An object with title and msg field is mandatory to create the box");
                        var container = (options.appendTo && $(options.appendTo).length > 0) ? options.appendTo : "body";
                        $(container).append("<mr-feedback-content-" + index + " class='mrFeedbackContent'></mr-feedback-content>");
                        mrFeedbackScope["instancesFeedback_" + index] = options;
                        var instance = mrFeedbackScope["instancesFeedback_" + index];
                        instance.remove = function () {
                            this.delete = true;
                            this.currentFeedbackOpened = undefined;
                        };
                        var template = '<mr-feedback feedback="instancesFeedback_' + index + '"></mr-feedback>';
                        var ele = $("mr-feedback-content-" + index).append(template);
                        $compile(ele)(mrFeedbackScope);
                        this.currentFeedbackOpened = instance;
                        index++;
                        return instance;
                    }
                    return;
                };

                this.open = function (options) {
                    options.type = options.type ? options.type : 'default';
                    options.modal = options.modal === undefined ? true : options.modal;
                    return this._doOpen(options);
                }

                this.info = function (options) {
                    options.type = 'info';
                    options.modal = options.modal === undefined ? true : options.modal;
                    options.close = options.close === undefined ? true : options.close;
                    options.title = options.title ? options.title : 'Info';
                    return this._doOpen(options);
                }
                this.success = function (options) {
                    options.type = 'success';
                    options.modal = options.modal === undefined ? true : options.modal;
                    options.close = options.close === undefined ? true : options.close;
                    options.title = options.title ? options.title : 'Success';
                    return this._doOpen(options);
                }
                this.warning = function (options) {
                    options.type = 'warning';
                    options.modal = options.modal === undefined ? true : options.modal;
                    options.close = options.close === undefined ? true : options.close;
                    options.title = options.title ? options.title : 'Warning';
                    return this._doOpen(options);
                }
                this.error = function (options) {
                    options.type = 'error';
                    options.modal = options.modal === undefined ? true : options.modal;
                    options.close = options.close === undefined ? true : options.close;
                    options.title = options.title ? options.title : 'Error';
                    return this._doOpen(options);
                }
                return this;
            }];
        })
        .directive('mrFeedback', mrFeedback);

    /** @ngInject */
    function mrFeedback($document, $compile) {
        var directive = {
            restrict: 'E',
            link: function (scope, elem, attrs) {
                var template =  '<div ng-if="mrFeedback.feedback.modal" class="mrFeedbackLayout"></div>' +
                                '<div class="mrFeedback" ng-class="mrFeedback.getTheme()" data-type="{{mrFeedback.feedback.type}}">' +
                                    '<div class="box-feedback">' +
                                        '<div class="box-content">' +
                                            '<div class="box-header">' +
                                                '<i class="mrFeedback-icon fa fa-4x" ng-class="mrFeedback.getIcon()" data-type="{{mrFeedback.feedback.iconType}}"'+
                                                    'ng-if="mrFeedback.getIcon() && mrFeedback.feedback.hideIcon !== true"></i>' +
                                                '<h2 class="title">' +
                                                    '{{mrFeedback.feedback.title}}' +
                                                '</h2>' +
                                            '</div>' +
                                            '<div class="box-body">' +
                                                '[BODY_PLACEHOLDER]'+
                                            '</div>'+
                                            '<div class="buttons-feedback" ng-if="mrFeedback.feedback.close || (mrFeedback.feedback.btnAction && mrFeedback.feedback.btnAction.length > 0)">' +
                                                '[BUTTONS_PLACEHOLDER]'+
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>';
                var defaultBodyTemplate = '{{mrFeedback.feedback.msg}}';
                var defaultButtonsTemplate = '<div class="box-btnAction" ng-if="mrFeedback.feedback.btnAction">' +
                                                '<div ng-repeat="button in mrFeedback.feedback.btnAction" class="button-feedback"'+
                                                    ' data-type="{{button.type}}" style="{{button.btnStyle}}" ng-click="mrFeedback.action($index)">' +
                                                    '<i ng-if="button.icon" class="fa {{button.icon}}"></i>' +
                                                    '{{button.text}}' +
                                                '</div>' +
                                            '</div>' +
                                            '<div class="button-feedback button-close" data-type="grey" ng-if="mrFeedback.feedback.close" ng-click="mrFeedback.close()">' +
                                                '{{mrFeedback.feedback.closeText || mrFeedback.defaultCloseText}}' +
                                            '</div>';
                var initFeedback = function () {
                    var tpl = template;
                    var bodyTpl = scope.mrFeedback.feedback && scope.mrFeedback.feedback.templateBody ? scope.mrFeedback.feedback.templateBody : defaultBodyTemplate;
                    tpl = tpl.replace('[BODY_PLACEHOLDER]', bodyTpl);
                    var buttonsTpl = scope.mrFeedback.feedback && scope.mrFeedback.feedback.templateButtons ? scope.mrFeedback.feedback.templateButtons : defaultButtonsTemplate;
                    tpl = tpl.replace('[BUTTONS_PLACEHOLDER]', buttonsTpl);
                    elem.html(tpl).show();
                    $compile(elem.contents())(scope);
                    initDraggable();
                };
                var initDraggable = function () {
                    var startX, startY, x = 0, y = 0,
                        start, stop, drag, container;

                    var width = elem[0].offsetWidth,
                        height = elem[0].offsetHeight;

                    if (scope.dragOptions) {
                        start = scope.dragOptions.start;
                        drag = scope.dragOptions.drag;
                        stop = scope.dragOptions.stop;
                        var id = scope.dragOptions.container;
                        if (id) {
                            container = document.getElementById(id).getBoundingClientRect();
                        }
                    }

                    var box = elem.find(".mrFeedback");
                    var header = elem.find(".box-content .box-header");
                    header.on('mousedown', function (e) {
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
                            left: x + 'px'
                        });
                    }
                };
                initFeedback();
            },
            scope: {
                feedback: "="
            },
            replace: true,
            controller: mrFeedbackController,
            controllerAs: 'mrFeedback',
            bindToController: true
        };
        return directive;
    }

    /** @ngInject */
    function mrFeedbackController($scope, $element, $uiMrFeedback, mrFeedbackConfig, $timeout) {
        var vm = this;
        vm.getTheme = function() {
            return vm.feedback.theme;
        };
        var animation = vm.feedback && vm.feedback.animation ? "animation-" + vm.feedback.animation : "animation-fade";
        vm.close = function () {
            if (vm.feedback.fnClose) {
                var params = vm.feedback.fnClose.params;
                vm.feedback.fnClose.func.apply(this, params);
            }
            $uiMrFeedback.currentFeedbackOpened = undefined;
            removeAnimation();
        };
        vm.action = function (index) {
            var params = vm.feedback.btnAction[index].params;
            vm.feedback.btnAction[index].func.apply(this, params);
            if (vm.feedback.autoClose)
                removeAnimation();
        };
        vm.defaultCloseText = mrFeedbackConfig.defaultCloseText || 'Close';
        var animation = mrFeedbackConfig.defaultAnimation;
        var setAnimation = function () {
            animation = vm.feedback && vm.feedback.animation ? "animation-" + vm.feedback.animation : "animation-" + animation;
            $element.find(".mrFeedback").addClass("mrFeedback-show " + animation);
            $timeout(function () {
                $element.find(".mrFeedback").addClass(animation + "-show");
            }, 50);
        };
        var setModal = function () {
            animation = "animation-none";
            $element.find(".mrFeedback").addClass("mrFeedback-show " + animation);
            $timeout(function () {
                $element.find(".mrFeedback").addClass(animation + "-show");
                centerBox();
            }, 50);
        };
        var removeAnimation = function () {
            $element.find(".mrFeedback").removeClass(animation + "-show");
            $timeout(function () {
                $element.find(".mrFeedback").removeClass("mrFeedback-show " + animation);
                animation = mrFeedbackConfig.defaultAnimation;
                $element.parent()[0].remove();
                $uiMrFeedback.currentFeedbackOpened = undefined;
            }, 350);
        };
        var centerBox = function () {
            var box = $element.find(".mrFeedback");
            var boxHeight = angular.element(box).height();
            var boxTop = (window.innerHeight - boxHeight) / 2;
            angular.element(box).css("top", boxTop + "px");
        };

        vm.getIcon = function () {
            return vm.feedback.icon ? vm.feedback.icon : vm.getTypeIcon();
        }
        vm.getTypeIcon = function () {
            switch (vm.feedback.type) {
                case 'info':
                    return 'fa-info-circle';
                case 'success':
                    return 'fa-check';
                case 'warning':
                    return 'fa-exclamation-triangle';
                case 'error':
                    return 'fa-exclamation-circle';
                default:
                    return '';
            }
        };

        $scope.$watch("mrFeedback.feedback", function (newVal, oldVal) {
            //if(newVal !== oldVal){
            if (newVal) {
                vm.theme = mrFeedbackConfig.defaultTheme;
                if (vm.feedback.modal)
                    setModal();
                else
                    setAnimation();
            }
            else {
                removeAnimation();
            }
            //}
        });
        $scope.$watch("mrFeedback.feedback.delete", function (newVal, oldVal) {
            //if(newVal !== oldVal){
            if (newVal && newVal === true) {
                removeAnimation();
            }
            //}
        });
    }
})();
