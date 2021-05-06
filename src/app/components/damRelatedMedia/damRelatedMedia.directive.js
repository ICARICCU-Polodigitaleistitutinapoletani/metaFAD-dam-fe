(function() {
    'use strict';

    angular
        .module('damRelatedMediaMdl')
        .directive('damRelatedMedia', damRelatedMedia);

    /** @ngInject */
    function damRelatedMedia() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/damRelatedMedia/damRelatedMedia.html',
            scope: {
                templateoptions:"=",
                setDraggable:"=setDraggable",
                actionEdit:"=actionEdit"
            },
            controller: damRelatedMediaController,
            controllerAs: 'damRelatedMedia',
            bindToController: true
        };
        return directive;
    }

    /** @ngInject */
    function damRelatedMediaController($rootScope,$scope,DamRelatedMediaService,refreshAngularCircle,getAllByKey) {
        // inizializzo una variabile che referenzia il modulo
        var vm = this;
        vm.docs = [];
        vm.getDefaultUrl = function(type){
            var defImg = "";
            switch(type) {
                case "IMAGE":
                    defImg = "img/default_document.png"
                    break;
                case "PDF":
                    defImg = "img/default_pdf.png"
                    break;
                case "VIDEO":
                    defImg = "img/default_video.png"
                    break;
                case "AUDIO":
                    defImg = "img/default_audio.png"
                    break;
                case "CONTAINER":
                    defImg = "img/default_document.png"
                    break;
                default:
                    "img/default_document.png"
            };
            return defImg;
        };
        vm.goToRouter = function(state,params){
            $scope.$emit('callRouter',state,params);
        };
        vm.actionEditFunc = function(state,idEle){
            var params = {
                id:idEle
            };
            _.forOwn(vm.actionEdit.params,function(value,key){
                params[key] = value;
            });
            vm.goToRouter(state,params);
        };
        vm.draggable = {
            options:{
                revert:true,
                cursorAt: { top: -5, left: -5 },
                connectToFancytree: true,
                cursor: "move",
                appendTo: "body",
                helper: function( event ) {
                    var template = createHelper(vm.multiDragList);
                    return $(
                        template
                    );
                }
            }
        };
        $scope.jqyouiDraggable = {
            onStop:function(){
                clearSelected()
                refreshAngularCircle($scope);
            }
        };
        var syncObjList = $scope.$on("damRelatedMediaSetObjList",function(event,obj){
            vm.docs = obj;
            var mediaCont = _.filter(vm.docs,{"type":"CONTAINER"});
            if(!mediaCont)
                return;
            // _.forEach(mediaCont,function(value){
            //     value.thumbnail =  value.thumbnail + "?timestamp=" + new Date().getTime(); 
            // });
        });
        var removeObjList = $rootScope.$on("damRelatedMediaRemoveObjList",function(event,obj,objs){
            vm.docs = objs;
        });
        vm.removeItemSelected = function(media){
            DamRelatedMediaService.removeObjList(media,true);
        };
        vm.lastSelectedItem;
        vm.multiDragList = [];
        var clearSelected = function(){
            vm.multiDragList = [];
            var match = getAllByKey(vm.docs, "draggable",true);
            if(match.length>0){
                _(match).forEach(function(value,key){
                    delete value.draggable; 
                });
            }  
            DamRelatedMediaService.setObjMoveList(vm.multiDragList);
        };
        var selectOnlyOne = function(item,draggable){
            clearSelected();
            if(!draggable){
                vm.multiDragList.push(_.clone(item));
                vm.lastSelectedItem = item;
                item.draggable = true;
            }
        };
        var toggleSelected = function(item){
            var exist = _.findIndex(vm.multiDragList,{"id":item.id});
            if(exist!==-1){
                vm.multiDragList.splice(exist,1);
                delete item.draggable;
            }
            else {
                vm.multiDragList.push(_.clone(item));
                vm.lastSelectedItem = item;
                item.draggable = true;
            }
        };
        var selectGroupItems = function(start,end){
            clearSelected();
            for(var i=start; i<end; i++){
                vm.multiDragList.push(_.clone(vm.docs[i]));
                vm.docs[i].draggable=true;
            }
        };
        var detectMouseDown = false;
        vm.detectMediaMouseDown = function(e,doc) {
            if (e.ctrlKey || e.metaKey || e.shiftKey) {
                return;
            }
            var selected = DamRelatedMediaService.getObjMoveList();
            if (!selected || !selected[0]) {
                detectMouseDown = true;
                selectOnlyOne(doc, doc.draggable);
                DamRelatedMediaService.setObjMoveList(vm.multiDragList);
                refreshAngularCircle($scope);
            }
        };
        vm.detectMultiDragClick = function(e,doc){
            if (detectMouseDown) {
                detectMouseDown = false;
                return;
            }
            if(e.ctrlKey||e.metaKey){
                toggleSelected(doc);
            }
            else if(e.shiftKey){
                var from = _.findIndex(vm.docs,function(o) { return o.id == vm.lastSelectedItem.id; });
                if(from === -1)
                    from=0;
                var to = _.findIndex(vm.docs,function(o) { return o.id == doc.id; });
                if(from>to){
                    to = [from, from = to][0];
                }
                selectGroupItems(from,to+1);
                vm.lastSelectedItem = doc;
            }
            else{
                selectOnlyOne(doc,doc.draggable);
            }
            DamRelatedMediaService.setObjMoveList(vm.multiDragList);
        };
        var createHelper = function(ar){
            var ele = '<div class="container-multi-drag"><div class="box-num-ele">' + ar.length + '</div>';
            if(ar.length===0){
                ele+='<div class="box-info">Seleziona gli elementi che vuoi copiare/spostare</div>';
            }
            _.forEach(ar,function(value){
                ele+='<div class="box-multi-drag">' +
                    '<img src="' + value.thumbnail + '"/>' +
                    '</div>';
            });
            ele+='</div>';
            return ele;
        };
        $scope.$on("$stateChangeStart",function(){
            syncObjList(); 
            removeObjList();
        });
    }
})();
