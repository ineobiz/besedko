'use strict';

angular.module('webApp').directive('onLongPress', ['$timeout', function($timeout) {
    return {
        restrict : 'A',
        link : function($scope, $elm, $attrs) {
            $elm.bind('mousedown touchstart', function(ev) {
                $scope.longPress = false;

                $timeout(function() {
                    $scope.longPress = true;

                    $scope.$apply(function() {
                        $scope.$eval($attrs.onLongPress);
                    });
                }, 1000);
            });

            $elm.bind('mouseup touchend', function(ev) {
                if ($scope.longPress === true) {
                    return;
                }

                if ($attrs.onPressEnd) {
                    $scope.$apply(function() {
                        $scope.$eval($attrs.onPressEnd);
                    });
                }
            });
        }
    };
}]);