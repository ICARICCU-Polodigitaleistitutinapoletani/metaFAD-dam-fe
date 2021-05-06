(function() {
  'use strict';

  angular
    .module('imgMiddleResponsiveMdl')
    .directive('imgMiddleResponsive', imgMiddleResponsive);

  /** @ngInject */
    function imgMiddleResponsive() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/imgMiddleResponsive/imgMiddleResponsive.html',
            scope: {
                imgUrl:"@",
                defaultUrl:"@",
                options:"=",
                clickAction:"&"
            },
            controller: imgMiddleResponsiveController,
            controllerAs: 'imgMiddleResponsive',
            bindToController: true
        };
        return directive;
    }

    /** @ngInject */
    function imgMiddleResponsiveController($scope,$element) {
        // inizializzo una variabile che referenzia il modulo
        var vm = this;
        var render = function(){
        }
        vm.container = {};
        vm.container.maxWidth = vm.options && vm.options.container ? vm.options.container.maxWidth : "100%";
        vm.container.maxHeight = vm.options && vm.options.container ? vm.options.container.maxHeight : "100%";
        var emptyEvent = function(){};
        vm.click = vm.clickAction || emptyEvent;
        var img = $element.find("img")[0];
        $(img).bind("error",function(){
            $(img).attr("src",vm.defaultUrl);
        });
        /*
        Codice che lavora all'inverso. Carica l'immagine di default e switcha su quella giusta al termina del caricamento della stessa.
        vm.imgUrl = vm.defaultUrl;
        var checkImg = function(){
            var tmpImg = new Image() ;
            tmpImg.src = vm.loadUrl;
            tmpImg.onload = function() {
                vm.imgUrl = vm.loadUrl;
            };
        };
        $scope.$watch("imgMiddleResponsive.loadUrl",function(newVal,oldVal){
            if(newVal && newVal !== oldVal)
                checkImg();
        });
        checkImg();*/
        render();
    }
})();
