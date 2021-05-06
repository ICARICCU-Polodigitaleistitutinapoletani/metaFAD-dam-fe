(function() {
  'use strict';

  angular
    .module('damDownloadFileMdl')
    .directive('damDownloadFile', damDownloadFile);

  /** @ngInject */
    function damDownloadFile() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/damDownloadFile/damDownloadFile.html',
            scope: {
                "doc":"=doc",
                "settedFileTypes":"=fileTypes"
            },
            controller: damDownloadFileController,
            controllerAs: 'damDownloadFile',
            bindToController: true
        };
        return directive;
    };
    
    /** @ngInject */
    function damDownloadFileController(){
        var vm=this;
        var render = function(){
        };
        vm.config = CONFIG;
        vm.bytestreamSelected = null;
        vm.fileTypes = vm.settedFileTypes;
        vm.selectBytestreamToDownload =  function(bytestream,type){
            vm.fileTypes = vm.settedFileTypes;
            vm.bytestreamSelected = bytestream;
            
        };
        render();
    };
    
})();