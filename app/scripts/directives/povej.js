'use strict';

angular.module('webApp').directive('povej', ['CONFIG', '$rootScope', 'Content', function (config, $rootScope, Content) {
    return {
        restrict: 'E',
        templateUrl: 'views/directives/povej.html',
        link: function(scope, element, attrs) {
            // @todo move $rootScope.credentials to service
            Content.get($rootScope.credentials).then(function(data) {
                scope.content = data;
                scope.parent = [];
                scope.playlist = [];
            });

            scope.currentPage = 0;
            scope.pageSize = 8;

            scope.numberOfPages = function(){
                return Math.ceil(scope.content.length/scope.pageSize);
            };

            scope.select = function(selected, parent) {
                if (
                    angular.isObject(selected.children)
                    && selected.children.length
                ) {
                    scope.content = selected.children;
                    scope.parent.push(parent);
                }

                if (
                    //angular.isObject(selected.audio)
                    selected.audio
                    && scope.playlist.length < 5
                ) {
/*
                    $scope.selected.audio = angular.isObject(content.audio)
                        ? content.audio
                        : $sce.trustAsResourceUrl(content.audio)
                    ;
*/
                    //@todo audio, audio player
                    scope.playlist.push({
                        label : selected.label,
                        color : selected.color
                    });
                }

                //@todo check/mark favorites
            };

            scope.plsClear = function() {
                scope.playlist = [];
            };

            scope.plsRemove = function(index) {
                scope.playlist.splice(index, 1);
            };

            scope.selectParent = function(parent) {
                scope.content = parent.pop();
            };

            // @todo select favorite

            scope.toggleFS = function() {
                scope.$emit('event::toggleFullscreen');
            };

            scope.canToggleFS = config.canToggleFS;
        }
    };
}]);

angular.module('webApp').filter('startFrom', function() {
    return function(input, start) {
        start = +start;
        return input.slice(start);
    }
});
