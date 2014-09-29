'use strict';

angular.module('webApp').directive('povej', ['CONFIG', '$rootScope', 'Content', function (config, $rootScope, Content) {
    var favorites = {
        check : function(scope) {
            var found = this.find(scope);
            return scope.isFavorite = found === +found && found === (found|0)
                ? true
                : false
            ;
        },
        find : function(scope) {
            var foundIndex = false;
            if (scope.favorites.length) {
                var favWords = [];

                angular.forEach(scope.playlist, function(val) {
                    favWords.push(val.label);
                });

                angular.forEach(scope.favorites, function(val, key) {
                    if (angular.equals(val.words, favWords)) {
                        foundIndex = key;
                    };
                });
            }
            return foundIndex;
        },
        add : function(scope) {
            if (scope.favorites.length < 6) {
                var words = [];

                angular.forEach(scope.playlist, function(val) {
                    words.push(val.label);
                });

                scope.favorites.push({
                    label : scope.favorites.length,
                    color : scope.playlist[0].color,
                    words : words
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
        }
    };

    // @todo
    var imageBrowser = {
        select : function(scope, selected, parent) {
            if (
                angular.isObject(selected.children)
                && selected.children.length
            ) {
                scope.content = selected.children;
                scope.parent.push(parent);
            }

            if (
                selected.audio
                && scope.playlist.length < 5
            ) {
                scope.playlist.push({
                    label : selected.label,
                    color : selected.color,
                    src   : selected.audio
                });

                favorites.check(scope);
            }
        }
    };

    return {
        restrict: 'E',
        templateUrl: 'views/directives/povej.html',
        link: function(scope, element, attrs) {
            // @todo move $rootScope.credentials to service
            Content.get($rootScope.credentials).then(function(data) {
                scope.content = data;
            });

            scope.favorites = [], scope.playlist = [], scope.parent = [],
            scope.isFavorite = false,
            scope.currentPage = 0, scope.pageSize = 8;

            scope.numberOfPages = function(){
                return Math.ceil(scope.content.length/scope.pageSize);
            };

            scope.select = function(selected, parent) {
                imageBrowser.select(scope, selected, parent);
            };

            scope.play = function() {
                scope.player.playPause();
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
                scope.content = parent.pop();
            };

            scope.player.on('ended', function() {
                if (scope.player.currentTrack == scope.player.tracks) {
                    // @todo find proper way to restart playlist?
                    var label = scope.playlist[0].label;
                    scope.playlist[0].label = scope.playlist[0].label.slice(0, -1);
                    scope.$apply();
                    scope.playlist[0].label = label;
                    scope.player.stop();
                }
            });

            scope.favorite = function() {
                favorites.check(scope)
                    ? favorites.remove(scope)
                    : favorites.add(scope)
                ;
            };

            scope.selectFavorite = function(selected) {
                //console.log([ "replace current playlist", selected.words]);
            };

            scope.toggleFS = function() {
                scope.$emit('event::toggleFullscreen');
            };

            scope.canToggleFS = config.canToggleFS;
        }
    };
}]);

angular.module('webApp').filter('startFrom', function() {
    return function(input, start) {
        start = +start;
        return input.slice(start);
    }
});
