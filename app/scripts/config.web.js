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

// disable cordova plugins
angular
    .module('webApp')
    .factory('$cordovaFile', [function(){}])
    .factory('$cordovaNetwork', [function(){}])
;

// disable modules
angular.module('ngAnimate', []);
angular.module('hmTouchEvents', []);