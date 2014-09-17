'use strict';

angular.module('webApp').directive('povej', ['CONFIG', 'Content', function (config, content) {
    return {
        restrict: 'E',
        templateUrl: 'views/directives/povej.html',
        link: function(scope, element, attrs) {
            content.get().then(function(data) {
                scope.content = data;
                scope.parent = [];
            });

            scope.select = function(selected, parent) {
                if (
                    angular.isObject(selected.children)
                    && selected.children.length
                ) {
                    scope.content = selected.children;
                    scope.parent.push(parent);
                }

                //@todo add to playlist
                //@todo check/mark favorites
                if (selected.audio) {
                    //console.log([ "add content audio '" + cnt.audio + "' to playlist", cnt.audio]);
                }
            };

            scope.selectParent = function(parent) {
                scope.content = parent.pop();
            };

            // @todo select favorite

            scope.toggleFS = function() {
                scope.$emit('event::toggleFullscreen');
            };

            scope.canToggleFS = config.canToggleFS;
            
            scope.currentPage = 0;
            scope.pageSize = 8;

            scope.numberOfPages=function(){
                return Math.ceil(scope.content.length/scope.pageSize);                
            }
            
        }
    };
}]);

angular.module('webApp').filter('startFrom', function() {
    return function(input, start) {
        start = +start;
        return input.slice(start);
    }
});
