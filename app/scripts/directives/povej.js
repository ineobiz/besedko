'use strict';

angular.module('webApp').directive('povej', ['CONFIG', function (config) {
    return {
        restrict: 'E',
        templateUrl: 'views/directives/povej.html',
        link: function(scope, element, attrs) {
            scope.toggleFS = function() {
                scope.$emit('event:toggleFullscreen');
            };
            scope.canToggleFS = config.canToggleFS; 
        }
    };
}]);
