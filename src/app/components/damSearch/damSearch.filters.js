(function() {
  'use strict';
  angular
    .module('damSearchMdl')
    .filter('fromKeyToLabel', function() {
        return function(key) {
            if(!key)
                return false;
            var objLabel = CONFIG.filtersLanguage;
            var label = objLabel && objLabel[key] ? objLabel[key] : key;
            return label;
        };
    });
})();