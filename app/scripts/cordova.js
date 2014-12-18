/**
 * Cordova build workarounds
 */
'use strict';

angular.module('ui.tree', []);
angular.module('ngImgCrop', []);

//cordova build app config, run
/*
webApp.config(['$compileProvider', function($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile):|data:(image|audio)\//);
}]);
webApp.run(['CONFIG', '$q', '$cordovaFile', function(config, $q, $cordovaFile) {
}]);
*/

/**
 * Cordova events
 *
 * Test events with:
 * document.dispatchEvent(new CustomEvent("menubutton", { "msg": "some message" }));
 */
document.addEventListener("deviceready", function() {
    angular.bootstrap(angular.element(document.body)[0], ['webApp']);
}, false);

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
        $rootScope.section = 'settings';
    });
}, false);