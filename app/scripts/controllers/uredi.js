'use strict';

angular.module('webApp')
    .constant('UrediCtrl.config', {
        content: [],
        contentSelected : null,
        favorites: [],
        favoriteSelected : false,
        uploading: true,
        uploadError: false,
        contentUpdated: false
    })
    .controller('UrediCtrl', ['$scope', '$rootScope', '$timeout', '$http', '$sce', 'UrediCtrl.config', 'Content', function ($scope, $rootScope, $timeout, $http, $sce, ctrlCfg, Content) {
        var processContent = function(content) {
            if (!content) {
                return $scope.contentSelected = null;
            }

            $scope.contentSelected = content;

            if (!content.color) {
                $scope.contentSelected.color = 'white';
            }

            if (content.audio) {
                $scope.contentSelected.audio = angular.isObject(content.audio)
                    ? content.audio
                    : $sce.trustAsResourceUrl(content.audio)
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

            if (favorite.content) {
                angular.forEach(favorite.content, function(val) {
                    //@todo build content list
                    //console.log([ "data", val]);
                });
            }
        };

        // tree scope
        var treeScope = function() {
            return angular.element(document.getElementById("content-structure")).scope();
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
        $scope.contentHandler = function(branch) {
            processContent(branch);
            $scope.favoriteSelected = false;
            //$scope.favoritesCtl.select_branch(null);
        };

        $scope.contentSelectRoot = function() {
            $scope.favoriteSelected = false;
            //$scope.favoritesCtl.select_branch(null);
            $scope.contentSelected = null;
            //$scope.contentCtl.select_branch(null);
        };

        $scope.favoritesHandler = function(branch) {
            processFavorite(branch);
            $scope.contentSelected = false;
            $scope.contentCtl.select_branch(null);
        };

        $scope.favoritesSelectRoot = function() {
            $scope.contentSelected = false;
            //$scope.contentCtl.select_branch(null);
            $scope.favoriteSelected = null;
            //$scope.favoritesCtl.select_branch(null);
        };

        // file processing
        $scope.fileUpload = function(element) {
            var file = element.files[0],
                reader = new FileReader();

            reader.onload = function(e) {
                $scope.$apply(function() {
                    $scope.contentSelected[angular.element(element).attr('name')] = $sce.trustAsResourceUrl(e.target.result);
                    $scope.contentUpdated = true;
                });
            };

            reader.readAsDataURL(file);
        };

        $scope.fileRemove = function(type) {
            $scope.contentSelected[type] = null;
            $scope.contentUpdated = true;
        };

        // content saving
        $scope.save = function() {
            $scope.uploading = true;
            $scope.uploadError = false;

            Content.set($rootScope.credentials, function (response){
                $scope.uploadError = $scope.uploading = $scope.contentUpdated = false;

                if (!response) {
                    $scope.uploading = false;
                    $scope.uploadError = true;
                    $scope.contentUpdated = true;
                }
            });
        };

        // content removing
        $scope.remove = function() {
            var parent = $scope.contentCtl.remove_selected_branch();
            $scope.contentCtl.select_branch(parent);
            processContent(parent);
            $scope.contentUpdated = true;
        };

        // add new branch
        $scope.addBranch = function() {
            var contentSelected = $scope.contentCtl.get_selected_branch();
            var created = $scope.contentCtl.add_branch(contentSelected, {
                label: 'beseda',
            });
            $scope.contentUpdated = true;
        };

        // enable upload button when content gets updated
        $scope.updated = function() {
            $scope.contentUpdated = true;
        }
    }])
;
