'use strict';

angular.module('webApp').constant('CONFIG', {
    povej : {
        buttons : {
            favorite   : true,
            volume     : false,
            keyboard   : false,
            fullscreen : true
        }
    }
});

// disable cordova file plugin
angular.module('webApp').factory('$cordovaFile', [function(){}]);