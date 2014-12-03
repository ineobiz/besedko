/**
 * Cordova build workarounds
 */
'use strict';

angular.module('ui.tree', []);
angular.module('ngImgCrop', []);

//cordova build app run
webApp.run(['CONFIG', '$rootScope', function(config, $rootScope) {
    $rootScope.isOverlayVisible = false;
}]);

/**
 * Cordova events
 *
 * Test events with:
 * document.dispatchEvent(new CustomEvent("menubutton", { "msg": "some message" }));
 */
document.addEventListener("backbutton", function(ev) {
    // disable back button
    // @todo previous/last overlay section?
}, false);

document.addEventListener("menubutton", function(ev) {
    var $rootScope = angular.element(document).find('body').scope().$root;

    $rootScope.$apply(function () {
        $rootScope.isOverlayVisible = !$rootScope.isOverlayVisible;
    });
}, false);