'use strict';

angular.module('webApp').directive('povej', ['CONFIG', '$rootScope', 'Content', function (config, $rootScope, Content) {
    return {
        restrict: 'E',
        templateUrl: 'views/directives/povej.html',
        link: function(scope, element, attrs) {
            var favoriteFind = function() {
                    var isFavorite = false;
                    if (scope.favorites.length) {
                        var favWords = [];

                        angular.forEach(scope.playlist, function(key) {
                            favWords.push(key.label);
                        });

                        angular.forEach(scope.favorites, function(key) {
                            if (angular.equals(key.words, favWords)) {
                                isFavorite = true;
                            };
                        });
                    }
                    return isFavorite;
                },
                favoriteAdd = function() {
                    if (scope.favorites.length < 6) {
                        console.log([ "add selected favorite"]);
                        var words = [];

                        angular.forEach(scope.playlist, function(key) {
                            words.push(key.label);
                        });

                        scope.favorites.push({
                            label : scope.playlist[0].label,
                            color : scope.playlist[0].color,
                            words : words
                        });

                        favoriteCheck();
                    }
                },
                favoriteRemove = function() {
                    //scope.isFavorite = findFavorite();
                    console.log([ "remove selected favorite"]);
                },
                favoriteCheck = function() {
                    scope.isFavorite = favoriteFind();
                }
            ;

            // @todo move $rootScope.credentials to service
            Content.get($rootScope.credentials).then(function(data) {
                scope.content = data;
            });

            scope.favorites = [],
            scope.playlist = [],
            scope.parent = [],
            scope.isFavorite = false,
            scope.currentPage = 0,
            scope.pageSize = 8;

            scope.numberOfPages = function(){
                return Math.ceil(scope.content.length/scope.pageSize);
            };

            scope.select = function(selected, parent) {
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

                    favoriteCheck();
                }
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
                favoriteCheck();
            };

            scope.plsRemove = function(index) {
                scope.playlist.splice(index, 1);
                scope.player.stop();
                favoriteCheck();
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
                favoriteFind()
                    ? favoriteRemove()
                    : favoriteAdd()
                ;
            };

            scope.selectFavorite = function(selected) {
                console.log([ "selected favorite", selected]);
                console.log([ "replace current playlist"]);
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
