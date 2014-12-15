'use strict';

angular.module('webApp').directive('onLongPress', ['$timeout', function($timeout) {
    return {
        restrict : 'A',
        link : function($scope, $elm, $attrs) {
            $elm.bind('mousedown touchstart', function(ev) {
                $scope.longPress = true;
                $timeout(function() {
                    if ($scope.longPress === true) {
                        $scope.$apply(function() {
                            $scope.$eval($attrs.onLongPress);
                        });
                    }
                }, 1000);
            });
            $elm.bind('mouseup touchend', function(ev) {
                $scope.longPress = false;
            });
        }
    };
}]);