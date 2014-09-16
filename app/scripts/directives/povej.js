'use strict';

angular.module('webApp').directive('povej', ['CONFIG', 'Content', function (config, content) {
    return {
        restrict: 'E',
        templateUrl: 'views/directives/povej.html',
        link: function(scope, element, attrs) {
            content.get().then(function(data) {
                scope.content = data;
                scope.parent = false;
            });

            scope.select = function(selected) {
                if (
                    angular.isObject(selected.children)
                    && selected.children.length
                ) {
                    scope.content = selected.children;
                    // @todo
                    scope.parent = false;
                }

                //@todo add to playlist
                //@todo check/mark favorites
                if (selected.audio) {
                    console.log([ "add content audio '" + cnt.audio + "' to playlist", cnt.audio]);
                }
            };

            scope.getStructure = function(level) {
                //@todo transition
                //@todo multipage / left,right
                scope.content = content.getStruct(level);
                scope.parent  = content.getParent(level);
            };

            // @todo select favorite

            scope.toggleFS = function() {
                scope.$emit('event::toggleFullscreen');
            };

            scope.canToggleFS = config.canToggleFS;
        }
    };
}]);
