'use strict';

angular.module('webApp').controller('LoginCtrl',
    ['$scope', '$rootScope', '$location', 'Authentication',
    function($scope, $rootScope, $location, Authentication) {
        $scope.login = function() {
            $scope.dataLoading = true;

            Authentication
                .Login($scope.email, $scope.password)
                .success(function(data) {
                    Authentication.SetCredentials($scope.email, $scope.password);
                    $scope.dataLoading = $scope.error = false;
                    // @todo load user data
                    $location.path('/');
                }).error(function(data) {
                    $scope.error = "Napačni dostopni podatki.";
                    $scope.dataLoading = false;
                })
            ;
        };
        
        $scope.logout = function() {
            Authentication.ClearCredentials();
            // @todo load default data
        };
     }]
);
