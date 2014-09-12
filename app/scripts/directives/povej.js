'use strict';

angular.module('webApp').directive('povej', ['CONFIG', 'content', function (config, content) {
    return {
        restrict: 'E',
        templateUrl: 'views/directives/povej.html',
        link: function(scope, element, attrs) {
            content.get().then(function(data) {
                scope.content = content.getStruct('root');
                scope.parent = false;
            });

            scope.select = function(cnt) {
                if (content.getStruct(cnt.id)) {
                    scope.getStructure(cnt.id);
                }

                //@todo add to playlist
                if (cnt.audio) {
                    console.log([ "add content audio '" + cnt.audio + "' to playlist", cnt.audio]);
                }
            };

            scope.getStructure = function(level) {
                //@todo transition
                //@todo multipage / left,right
                scope.content = content.getStruct(level);
                scope.parent  = content.getParent(level);
            };

            scope.toggleFS = function() {
                scope.$emit('event::toggleFullscreen');
            };

            scope.canToggleFS = config.canToggleFS;
        }
    };
}]);
