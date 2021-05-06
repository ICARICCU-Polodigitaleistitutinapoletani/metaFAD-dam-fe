(function() {
  'use strict';

  angular
    .module('damCollectionManagerMdl')
    .service('DamCollectionManagerService', DamCollectionManagerService);

  /** @ngInject */
    function DamCollectionManagerService($rootScope,$timeout,$log) {
        var vm = this;
        var _trees = [];
        vm.refresh = function(){
            _trees = [];
        };
        vm.initTree = function(instance,treeConfig,treeSource,emit,fromType){
            _trees.push(
                {
                    instance:instance,
                    source:treeSource
                }
            );
            if(emit)
                $rootScope.$broadcast('damCollectionManagerInitTree',instance,treeConfig,treeSource,fromType);
        };
        vm.setTreeConfigPart = function(instance,configValue,emit){
            if(emit)
                $rootScope.$broadcast('damCollectionManagerSetTreeConfigPart',instance,configValue);
        };
        vm.setTreeConfig = function(instance,treeConfig,emit,fromType){
            var exist = _.findIndex(_trees,{"instance":instance});
            if(exist!==-1){
                treeConfig.source = _trees[exist].source;
            }
            if(emit)
                $rootScope.$broadcast('damCollectionManagerSetTreeConfig',instance,treeConfig,fromType);
        };
        vm.setTree = function(instance,tree,emit,fromType){
            var exist = _.findIndex(_trees,{"instance":instance});
            if(exist!==-1){
                _trees[exist].source = tree;
            }
            else{
                _trees.push(
                    {
                        instance:instance,
                        source:tree
                    }
                );  
            }
            if(emit)
                $rootScope.$broadcast('damCollectionManagerSetTree',instance,tree,fromType);
        };
        var createPathNode = function(node){
            var parentList = node.getParentList();
            var path = "";
            _.forEach(parentList,function(value){
                path+=value.title + "/";
            });
            path+=node.title;
            return path;
        };
        vm.setActiveNode = function(instance,node,emit){
            var exist = _.findIndex(_trees,{"instance":instance});
            if(exist!==-1){
                _trees[exist].activeNode = node;
                var activePath = createPathNode(node);
                _trees[exist].activePath = activePath;
            }  
            else{
                $log.info("Instance tree not exist");
            }
            if(emit)
                $rootScope.$broadcast('damCollectionManagerSetActiveNode',instance,node);
        };
        vm.refreshActiveNode = function(instance,emit){
            var exist = _.findIndex(_trees,{"instance":instance});
            if(exist!==-1){
                _trees[exist].activeNode = null;
                _trees[exist].activePath = null;
            }  
            else{
                $log.info("Instance tree not exist");
            }
            if(emit)
                $rootScope.$broadcast('damCollectionManagerRefreshActiveNode',instance);
        };
        vm.getActiveNode = function(instance){
            var exist = _.findIndex(_trees,{"instance":instance});
            if(exist!==-1){
                return _trees[exist].activeNode;
            }  
            else{
                $log.info("Instance tree not exist");
                return null;
            } 
        };
        vm.getActivePath = function(instance){
            var exist = _.findIndex(_trees,{"instance":instance});
            if(exist!==-1){
                return _trees[exist].activePath;
            }  
            else{
                $log.info("Instance tree not exist");
                return null;
            } 
        };
        vm.setExpandNode = function(instance,value,type,emit){
            var exist = _.findIndex(_trees,{"instance":instance});
            if(exist!==-1){
                _trees[exist].expandNode = value;
            }  
            else{
                $log.info("Instance tree not exist");
                return null;
            } 
            if(emit)
                $rootScope.$broadcast('damCollectionManagerSetExpandNode',instance,type);
        };
        vm.addExpandNode = function(instance,value,type,emit){
            var exist = _.findIndex(_trees,{"instance":instance});
            if(exist!==-1){
                if(!_trees[exist].expandNode)
                    _trees[exist].expandNode = [];
                _trees[exist].expandNode.push(value);
            }  
            else{
                $log.info("Instance tree not exist");
                return null;
            } 
            if(emit)
                $rootScope.$broadcast('damCollectionManagerAddExpandNode',instance,value,type);
        };
        vm.getExpandNode = function(instance){
            var exist = _.findIndex(_trees,{"instance":instance});
            if(exist!==-1){
                return _trees[exist].expandNode;
            }  
            else{
                $log.info("Instance tree not exist");
                return null;
            } 
        };
        vm.setSelectedNode = function(instance,value,type,emit){
            var exist = _.findIndex(_trees,{"instance":instance});
            if(exist!==-1){
                _trees[exist].selectedNode = value;
            }  
            else{
                $log.info("Instance tree not exist");
                return null;
            } 
            if(emit)
                $rootScope.$broadcast('damCollectionManagerSetSelectedNode',instance,type);
        };
        vm.addSelectedNode = function(instance,value,type,emit){
            var exist = _.findIndex(_trees,{"instance":instance});
            if(exist!==-1){
                if(!_trees[exist].selectedNode)
                    _trees[exist].selectedNode = [];
                _trees[exist].selectedNode.push(value);
            }  
            else{
                $log.info("Instance tree not exist");
                return null;
            } 
            if(emit)
                $rootScope.$broadcast('damCollectionManagerAddSelectedNode',instance,value,type);
        };
        vm.removeSelectedNode = function(instance,value,type,emit){
            var exist = _.findIndex(_trees,{"instance":instance});
            if(exist!==-1){
                var node = typeof value === 'object' ? _.findIndex(_trees[exist].selectedNode,value) : _.indexOf(_trees[exist].selectedNode,value);
                if(node!==-1){
                    _trees[exist].selectedNode.splice(node,1);
                }
                else{
                    $log.info("Node not exist");
                    return null;
                }
            }  
            else{
                $log.info("Instance tree not exist");
                return null;
            } 
            if(emit)
                $rootScope.$broadcast('damCollectionManagerRemoveSelectedNode',instance,value,type);
        };
        vm.getSelectedNode = function(instance){
            var exist = _.findIndex(_trees,{"instance":instance});
            if(exist!==-1){
                return _trees[exist].selectedNode;
            }  
            else{
                $log.info("Instance tree not exist");
                return null;
            } 
        };
        vm.removeNodeFromInstance = function(instance, nodeKey) {
            var existTree = _.findIndex(_trees,{"instance":instance});
            if (existTree !== -1) {
                var nodeIndex = _.findIndex(_trees[existTree].source, function(oItem) { return oItem.key === nodeKey; });
                if (nodeIndex > -1) {
                    _trees[existTree].source.splice(nodeIndex, 1);
                }
            }
        };
        vm.addTreeReferenceToInstance= function(instance, tree){
            var existTree = _.findIndex(_trees,{"instance":instance});
            if (existTree!==-1) {
                _trees[existTree].source = tree.source;
            }
        };
        vm.checkTitleAndRename = function(instance, titleName){
            var existTree = _.findIndex(_trees,{"instance":instance});
            if (existTree!==-1) {
                var activeNode = _trees[existTree].activeNode;
                var existNode = false;
                var nodesToCheck = activeNode && activeNode.children ? activeNode.children : _trees[existTree].source;
                var i = 0;
                while (!existNode && i < nodesToCheck.length) {
                    existNode = nodesToCheck[i].title === titleName;
                    i++;
                }
                if (existNode) {
                    return vm.checkTitleAndRename(instance, titleName + "_copy");
                }
            }
            return titleName;
        };
    }
})();
