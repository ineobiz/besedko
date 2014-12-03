/**
 * Cordova build workarounds
 */
'use strict';

angular.module('ui.tree', []);
angular.module('ngImgCrop', []);

//cordova build app run
webApp.run(['CONFIG', '$rootScope', function(config, $rootScope) {
    $rootScope.isOverlayVisible = false;

    $rootScope.$on('event::openKeyboard', function(event) {
        $rootScope.isOverlayVisible = true;
        $rootScope.section = 'keyboard';
    });
}]);

/**
 * Cordova events
 *
 * Test events with:
 * document.dispatchEvent(new CustomEvent("menubutton", { "msg": "some message" }));
 */
document.addEventListener("backbutton", function(ev) {
    // disable back button
    // @todo previous/last/close overlay (section) with event
}, false);

document.addEventListener("menubutton", function(ev) {
    // this is bad way to solve problems, mkay?
    var $rootScope = angular.element(document).find('body').scope().$root;

    $rootScope.$apply(function () {
        $rootScope.isOverlayVisible = !$rootScope.isOverlayVisible;
        $rootScope.section = 'settings';
    });
}, false);

// dev -- document.dispatchEvent(new CustomEvent("opensection", { "msg": "some message" }))
document.addEventListener("opensection", function(ev) {
    var $rootScope = angular.element(document).find('body').scope().$root;

    $rootScope.$apply(function () {
        $rootScope.isOverlayVisible = true;
        $rootScope.section = 'bigimage';
    });
}, false);