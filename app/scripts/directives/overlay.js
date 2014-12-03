'use strict';

angular.module('webApp').directive('overlay', ['CONFIG', '$rootScope', 'Authentication', 'Content', function (config, $rootScope, Authentication, Content) {
    return {
        restrict: 'E',
        templateUrl: function(elem,attrs) {
            return 'views/directives/overlay.html';
        },
        link: function(scope, element, attrs) {
            // defaults
            var defaultSection = 'settings';
            scope.section = defaultSection;
            scope.kbdText = null;

            // switch section
            scope.actSection = function(section) {
                scope.section = section;
            };

            // reset, switch off overlay
            scope.closeBtn = function() {
                $rootScope.isOverlayVisible = null;
                scope.section = defaultSection;
            };

            // login
            scope.login = function() {
                scope.loginCheck = true;

                Authentication
                    .Login(scope.email, scope.password)
                    .success(function() {
                        Authentication.SetCredentials(scope.email, scope.password);
                        scope.loginCheck = scope.error = false;
                        scope.email = scope.password = '';
                        scope.section = 'settings';
                    }).error(function() {
                        //scope.error = 'Napačni dostopni podatki.';
                        scope.loginCheck = false;
                    })
                ;
            };

            // logout
            scope.buttonLogout = function() {
                Authentication.ClearCredentials();
            };
        }
    };
}]);
