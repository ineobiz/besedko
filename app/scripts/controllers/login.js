'use strict';

angular.module('webApp').controller('LoginCtrl',
    ['$scope', '$rootScope', '$location', 'Authentication', 'Content',
    function($scope, $rootScope, $location, Authentication, Content) {
        $scope.login = function() {
            $scope.dataLoading = true;

            Authentication
                .Login($scope.email, $scope.password)
                .success(function(data) {
                    Authentication.SetCredentials($scope.email, $scope.password);
                    $scope.dataLoading = $scope.error = false;
                    Content.resetPromise();
                    $location.path('/');
                }).error(function(data) {
                    $scope.error = "Napačni dostopni podatki.";
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
