'use strict';

/**
 * @ngdoc function
 * @name webApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the webApp
 */
angular.module('webApp').controller('LoginCtrl',
    ['$scope', '$rootScope', '$location', 'Authentication', 'Content', function($scope, $rootScope, $location, Authentication, Content) {
        $scope.login = function() {
            $scope.dataLoading = true;

            Authentication
                .Login($scope.email, $scope.password)
                .success(function() {
                    Authentication
                            .SetCredentials($scope.email, $scope.password);
                    $scope.dataLoading = $scope.error = false;
                    Content.resetPromise();
                    $location.path('/');
                }).error(function() {
                    $scope.error = 'Napačni dostopni podatki.';
                    $scope.dataLoading = false;
                })
            ;
        };

        $scope.logout = function() {
            Authentication.ClearCredentials();
            Content.resetPromise();
        };
    }]
);