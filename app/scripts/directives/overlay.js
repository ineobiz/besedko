'use strict';

angular.module('webApp').directive('overlay', ['CONFIG', '$timeout', '$cordovaNetwork', 'Authentication', 'Content', function (config, $timeout, $cordovaNetwork, Authentication, Content) {
    var reloadContent = function(scope, sync) {
        scope.playlist = [];
        Content.resetPromise();
        scope.syncDisabled = true;
        scope.$emit('content::load', scope, sync);
    };

    return {
        restrict: 'E',
        templateUrl: function(elem,attrs) {
            return 'views/directives/overlay.html';
        },
        link: function(scope, element, attrs) {
            // defaults
            var defaultSection = 'settings';
            scope.isOverlayVisible = false;
            scope.syncDisabled = false;
            scope.isOnline = false;
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

                var authenticated = function() {
                    Authentication.SetCredentials(scope.email, scope.password);
                    scope.loginCheck = scope.error = false;
                    scope.email = scope.password = '';
                    scope.section = 'settings';
                    reloadContent(scope);
                };

                Content.isLocalStructure({
                    email: scope.email,
                    password: scope.password
                }).then(
                    authenticated,
                    function() {
                        Authentication
                            .Login(scope.email, scope.password)
                            .success(authenticated)
                            .error(function() {
                                //@todo error indicator
                                scope.loginCheck = false;
                            })
                        ;
                    }
                );
            };

            // sync data
            scope.buttonSync = function() {
                reloadContent(scope, true);
            };

            // logout
            scope.buttonLogout = function() {
                Authentication.ClearCredentials();
                reloadContent(scope);
            };

            // open keyboard
            scope.$on('ui::openKeyboard', function(event) {
                scope.actSection('keyboard');
/*
                // @todo keyboard popup
                $timeout(function() {
                    angular.element(document.querySelector('#kbdText'))[0].focus();
                });
*/
            });

            // show big image on long press
            scope.$on('ui::showBigImage', function(event, index) {
                scope.imgData = scope.playlist[index];
                scope.player.playPause();
                scope.player.play(index, true);
                scope.actSection('bigimage');
            });

            // content loaded
            scope.$on('content::loaded', function(event, data) {
                //@todo goto first page
/*
                scope.navLevel = 0;
                scope.currentPage = 0;
*/
                scope.syncDisabled = false;
            });

            // network check
            scope.$on('ui::networkCheck', function() {
                scope.isOnline = $cordovaNetwork.isOnline()
                    ? true
                    : false
                ;
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
