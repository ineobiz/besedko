'use strict';

angular.module('webApp').directive('povej', ['CONFIG', '$timeout', 'Authentication', 'Content', function (config, $timeout, Authentication, Content) {
    var favorites = {
        check : function(scope) {
            var found = this.find(scope);
            return scope.isFavorite = found === +found && found === (found||0)
                ? true
                : false
            ;
        },
        find : function(scope) {
            var foundIndex = false;
            if (scope.favorites.length) {
                var favContent = [];

                angular.forEach(scope.playlist, function(val) {
                    favContent.push(val.uid);
                });

                angular.forEach(scope.favorites, function(val, key) {
                    if (angular.equals(val.content, favContent)) {
                        foundIndex = key;
                    }
                });
            }
            return foundIndex;
        },
        add : function(scope) {
            if (scope.favorites.length <= 10) {
                var content = [];

                angular.forEach(scope.playlist, function(val) {
                    content.push(val.uid);
                });

                scope.favorites.push({
                    label : 'fav.' + (scope.favorites.length + 1),
                    color : scope.playlist[0].color,
                    content : content
                });

                scope.isFavorite = true;
            }
        },
        remove : function(scope) {
            if (scope.favorites.length) {
                var selected = this.find(scope);
                scope.favorites.splice(selected, 1);
                scope.isFavorite = false;
            }
        },
        toPlaylist : function(scope, selected) {
            // this whole process is wrong on so many levels..
            // @todo rewrite this and content servise
            if (angular.isObject(selected.content)) {
                var found = [], resolve = [];

                Content.iterate(function(b) {
                    if (selected.content.indexOf(b.uid) !== -1) {
                        resolve.push(b);
                        return found[b.uid] = b;
                    }
                });

                Content.fetchRemotes(
                    resolve,
                    Authentication.GetCredentials()
                );

                $timeout(function(){
                    angular.forEach(selected.content, function(val) {
                        scope.playlist.push(imageBrowser.getContent(found[val]));
                    });

                    scope.isFavorite = true;
                }, 100);

            }
        }
    };

    var imageBrowser = {
        select : function(scope, selected, parent) {
            if (
                angular.isObject(selected.children) &&
                selected.children.length
            ) {
                scope.content = Content.fetchRemotes(
                    selected.children,
                    Authentication.GetCredentials()
                );
                scope.parent.push(parent);
                scope.navLevel += 1;
                scope.currentPage = 0;
                scope.navPos[scope.navLevel] = scope.currentPage;
            }
            if (
                selected.audio &&
                scope.playlist.length < 5
            ) {
                scope.playlist.push(this.getContent(selected));
                favorites.check(scope);
            }
        },
        getContent : function(selected) {
            return {
                uid   : selected.uid,
                label : selected.label,
                color : selected.color,
                src   : selected.audio,
                image : selected.image
            };
        }
    };

    return {
        restrict: 'E',
        templateUrl: function(elem,attrs) {
            return 'views/directives/' + (attrs.templateUrl || 'povej') + '.html';
        },
        link: function(scope, element, attrs) {
            scope.$emit('content::load', scope);

            scope.buttons = config.povej.buttons;
            scope.favorites = [], scope.playlist = [], scope.parent = [], scope.navPos = {},
            scope.isFavorite = false,
            scope.currentPage = 0, scope.pageSize = 8, scope.navLevel = 0;

            scope.navPos[scope.navLevel] = scope.currentPage;

            scope.numberOfPages = function(){
                return Math.ceil(scope.content.length/scope.pageSize);
            };

            scope.select = function(selected, parent) {
                imageBrowser.select(scope, selected, parent);
            };

            scope.play = function() {
                if (scope.player.playing == true) {
                    scope.player.playPause();
                } else {
                    // @todo update to 0.5.9 when available
                    scope.player.$selective = false;
                    scope.player.play(0, false);
                }
            };

            scope.mute = function() {
                scope.player.toggleMute();
            };

            scope.plsClear = function() {
                scope.playlist = [];
                scope.player.stop();
                favorites.check(scope);
            };

            scope.plsRemove = function(index) {
                scope.playlist.splice(index, 1);
                scope.player.stop();
                favorites.check(scope);
            };

            scope.selectParent = function(parent) {
                delete scope.navPos[scope.navLevel];
                scope.navLevel -= 1;
                scope.currentPage = scope.navPos[scope.navLevel];
                scope.content = parent.pop();
            };

            scope.favorite = function() {
                favorites.check(scope)
                    ? favorites.remove(scope)
                    : favorites.add(scope)
                ;
            };

            scope.favoriteSelect = function(selected) {
                scope.playlist = [];

                if (!favorites.check(scope)) {
                    favorites.toPlaylist(scope, selected);
                }
            };

            scope.$watch('currentPage', function (val) {
                scope.navPos[scope.navLevel] = val;
            });

            scope.toggleFS = function() {
                scope.$emit('ui::toggleFullscreen');
            };

            scope.keyboard = function() {
                scope.$emit('ui::openKeyboard');
            };

            scope.bigImage = function(index) {
                scope.$emit('ui::showBigImage', index);
            };
        }
    };
}]);
