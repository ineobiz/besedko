'use strict';

angular.module('webApp').directive('overlay', ['CONFIG', '$timeout', 'Authentication', 'Content', function (config, $timeout, Authentication, Content) {
    return {
        restrict: 'E',
        templateUrl: function(elem,attrs) {
            return 'views/directives/overlay.html';
        },
        link: function(scope, element, attrs) {
            // defaults
            var defaultSection = 'settings';
            scope.isOverlayVisible = false;
            scope.section = defaultSection;
            scope.kbdText = null;
            scope.imgData = null;

            // switch section
            scope.actSection = function(section) {
                scope.isOverlayVisible = true;
                scope.section = section;
            };

            // reset, switch off overlay
            scope.closeBtn = function() {
                scope.isOverlayVisible = null;
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

            // open keyboard
            scope.$on('event::openKeyboard', function(event) {
                scope.actSection('keyboard');
            });

            // show big image on long press
            scope.$on('event::showBigImage', function(event, index) {
                scope.imgData = scope.playlist[index];
                scope.player.playPause();
                scope.player.play(index, true);
                scope.actSection('bigimage');
            });

            // close big image when player stops
            scope.$watch('player.ended', function (val) {
                if (val === true && scope.imgData) {
                    scope.imgData = null;
                    $timeout(function() {
                        scope.closeBtn();
                    }, 1000);
                }
            });
        }
    };
}]);
