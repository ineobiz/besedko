'use strict';

/**
 * @ngdoc function
 * @name webApp.controller:UrediCtrl
 * @description
 * # UrediCtrl
 * Controller of the webApp
 */
angular.module('webApp')
    .constant('UrediCtrl.config', {
        content: [],
        contentSelected : null,
        favorites: [],
        favoriteSelected : false,
        uploading: true,
        uploadIds: {image: [], audio: []},
        uploadError: false,
        contentUpdated: false
    })
    .controller('UrediCtrl', ['$scope', '$rootScope', '$timeout', '$http', '$sce', 'UrediCtrl.config', 'Content', function ($scope, $rootScope, $timeout, $http, $sce, ctrlCfg, Content) {
        var processContent = function(content) {
            if (!content) {
                return $scope.contentSelected = null;
            }

            $scope.contentSelected = content;

            if (!content.uid) {
                content.uid = "" + Math.random();
            }

            if (!content.color) {
                $scope.contentSelected.color = 'white';
            }

            if (content.audio) {
                // @todo move to service?
                if (content.audio === true) {
                    Content
                        .getFile(content.uid + '.audio', $scope.credentials)
                        .then(function(response) {
                            $scope.contentSelected.audio = $sce.trustAsResourceUrl(response.data);
                        })
                    ;
                } else {
                    $scope.contentSelected.audio = angular.isObject(content.audio)
                        ? content.audio
                        : $sce.trustAsResourceUrl(content.audio)
                    ;
                }
            }

            // @todo move to service?
            if (content.image && content.image === true) {
                Content
                    .getFile(content.uid + '.png', $scope.credentials)
                    .then(function(url) {
                        $scope.contentSelected.image = url;
                    })
                ;
            }
        };

        var processFavorite = function(favorite) {
            if (!favorite) {
                return $scope.favoriteSelected = null;
            }

            $scope.favoriteSelected = favorite;

            if (!favorite.color) {
                $scope.favoriteSelected.color = 'white';
            }

            if (!favorite.uid) {
                favorite.uid = "" + Math.random();
            }

            if (favorite.content.length) {
                var found = [];

                $scope.favoriteSelected.words = [];
                
                Content.iterate(function(b) {
                    if (favorite.content.indexOf(b.uid) !== -1) {
                        return found[b.uid] = b.label;
                    }
                });
                
                angular.forEach(favorite.content, function(val) {
                    $scope.favoriteSelected.words.push({label: found[val]});
                });
            }

            // @todo move to service?
            if (favorite.image && favorite.image === true) {
                Content
                    .getFile(favorite.uid + '.png', $scope.credentials)
                    .then(function(url) {
                        $scope.favoriteSelected.image = url;
                    })
                ;
            }
        };

        // content tree scope
        var treeScope = function() {
            return angular.element(document.getElementById("content-structure")).scope();
        };

        // content tree options
        $scope.contentOptions = {
            accept : function(sourceNodeScope, destNodesScope, destIndex) {
                return !angular.isArray(sourceNodeScope.$modelValue.content);
            }
        };

        // favorites tree options
        $scope.favoritesOptions = {
            // only favorites
            accept : function(sourceNodeScope, destNodesScope, destIndex) {
                return angular.isArray(sourceNodeScope.$modelValue.content);
            }
        };

        // config
        angular.extend($scope, ctrlCfg);

        // @todo move to service
        $scope.credentials = $rootScope.credentials;

        // content, favorites
        Content.get($scope.credentials).then(function(data) {
            $scope.uploading = false;
            $scope.content = data.content;
            $scope.favorites = data.favorites;
        });

        // expand all levels
        $scope.expandAll = function() {
            var scope = treeScope();
            scope.expandAll();
        };

        // collapse all levels
        $scope.collapseAll = function() {
            var scope = treeScope();
            scope.collapseAll();
        };

        // select content root
        $scope.contentSelectRoot = function() {
            $scope.favoriteSelected = false;
            $scope.contentSelected = null;
        };

        // select content
        $scope.contentHandler = function(branch) {
            processContent(branch);
            $scope.favoriteSelected = false;
        };

        // select favorites root
        $scope.favoritesSelectRoot = function() {
            $scope.contentSelected = false;
            $scope.favoriteSelected = null;
        };

        // select favorite
        $scope.favoritesHandler = function(branch) {
            processFavorite(branch);
            $scope.contentSelected = false;
        };

        // file processing
        $scope.fileUpload = function(element, type) {
            var file = element.files[0],
                reader = new FileReader(),
                elType = type == 'favorite'
                    ? 'favoriteSelected'
                    : 'contentSelected'
            ;

            reader.onload = function(e) {
                $scope.$apply(function() {
                    if (angular.element(element).attr('name') == 'image') {
                        // @todo use better crop/resize resolution
                        $scope[elType].cropImage = '';
                        $scope[elType].image = null;
                        $scope[elType].crop = e.target.result;
                    } else {
                        $scope[elType][angular.element(element).attr('name')] = $sce.trustAsResourceUrl(e.target.result);
                        $scope.uploadIds.audio.push($scope[elType].uid);
                        $scope.contentUpdated = true;
                    }
                });
            };

            reader.readAsDataURL(file);
        };

        // remove file
        $scope.fileRemove = function(file, type) {
            var elType = type == 'favorite'
                ? 'favoriteSelected'
                : 'contentSelected'
            ;

            $scope[elType][file] = null;

            if (file == 'image') {
                $scope[elType].cropImage = null;
            }

            $scope.uploadIds[file].push($scope[elType].uid);
            $scope.contentUpdated = true;
        };

        // image crop
        $scope.saveCrop = function(file, type) {
            var elType = type == 'favorite'
                ? 'favoriteSelected'
                : 'contentSelected'
            ;
            var image = $scope[elType].cropImage;

            $scope[elType].crop = null;
            $scope[elType][file] = image;

            $scope.uploadIds.image.push($scope[elType].uid);
            $scope.contentUpdated = true;
        };

        // content saving
        $scope.save = function() {
            $scope.uploading = true;
            $scope.uploadError = false;

            Content.set($rootScope.credentials, $scope.uploadIds, function (response){
                $scope.uploadError = $scope.uploading = $scope.contentUpdated = false;

                if (!response) {
                    $scope.uploading = false;
                    $scope.uploadError = true;
                    $scope.contentUpdated = true;
                } else {
                    $scope.uploadIds.audio = [];
                    $scope.uploadIds.image = [];
                }
            });
        };

        // add new root branch
        $scope.addRootBranch = function() {
            $scope.content.push({
                uid : "" + Math.random(),
                label : "beseda" + '.' + ($scope.content.length + 1)
            });

            $scope.contentUpdated = true;
        };

        // add branch to selected content
        $scope.addBranch = function(scope) {
            var nodeData = scope.$modelValue;
            if (!angular.isArray(nodeData.children)) {
                nodeData.children = [];
            }
            scope.expand();
            nodeData.children.push({
                uid : "" + Math.random(),
                label : nodeData.label + '.'
                        + (nodeData.children.length + 1),
                children : []
            });
            $scope.contentUpdated = true;
        };

        // remove selected content branch
        $scope.removeBranch = function(scope) {
            scope.remove();
            $scope.contentUpdated = true;
            $scope.favoriteSelected = false;
            $scope.contentSelected = null;
        };

        // remove selected favorite
        $scope.removeFavorite = function(scope) {
            scope.remove();
            $scope.contentUpdated = true;
            $scope.favoriteSelected = null;
            $scope.contentSelected = false;
        };

        // enable upload button when content gets updated
        $scope.updated = function() {
            $scope.contentUpdated = true;
        }
    }])
;
