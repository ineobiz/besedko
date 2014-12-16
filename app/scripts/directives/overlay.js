'use strict';

angular.module('webApp').directive('overlay', ['CONFIG', '$timeout', '$sce', 'Authentication', 'Content', function (config, $timeout, $sce, Authentication, Content) {
    var fetchRemotes = function (scope, content) {
        angular.forEach(content, function(c) {
            if (c.hasOwnProperty('image') && c.image === true) {
                Content
                    .getFile(c.uid + '.image', scope.credentials)
                    .then(function(response) {
                        c.image = $sce.trustAsResourceUrl(response.data);
                    })
                ;
            }
            if (c.hasOwnProperty('audio') && c.audio === true) {
                Content
                    .getFile(c.uid + '.audio', scope.credentials)
                    .then(function(response) {
                        c.audio = $sce.trustAsResourceUrl(response.data);
                    })
                ;
            }
        });

        return content;
    };

    // @todo move to povej directive, call via event
    var reloadContent = function(scope) {
        scope.playlist = [];
        Content.resetPromise();
        Content.get(scope.credentials).then(function(data) {
            scope.content = fetchRemotes(scope, data.content);
            scope.favorites = fetchRemotes(scope, data.favorites);
        });
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
                        reloadContent(scope);
                    }).error(function() {
                        //scope.error = 'Napačni dostopni podatki.';
                        scope.loginCheck = false;
                    })
                ;
            };

            // sync data
            scope.buttonSync = function() {
                reloadContent(scope);
            };

            // logout
            scope.buttonLogout = function() {
                Authentication.ClearCredentials();
                reloadContent(scope);
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
