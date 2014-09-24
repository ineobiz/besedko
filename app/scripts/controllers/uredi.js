'use strict';

angular.module('webApp').controller('UrediCtrl', ['$scope', '$rootScope', '$timeout', '$http', '$sce', 'Content', function ($scope, $rootScope, $timeout, $http, $sce, Content) {
    $scope.content = $scope.treeCtl = [];
    $scope.selected = null;
    $scope.uploading = true;
    $scope.uploadError = $scope.contentUpdated = false;
    
    // @todo move to service
    $scope.credentials = $rootScope.credentials;

    Content.get($scope.credentials).then(function(data) {
        $scope.uploading = false;
        $scope.content = data;
    });

    $scope.treeHandler = function(branch) {
        processContent(branch);
    };

    var processContent = function(content) {
        if (!content) {
            return $scope.selected = null;
        }

        $scope.selected = content;

        if (!content.color) {
            $scope.selected.color = 'white';
        }

        if (content.audio) {
            $scope.selected.audio = angular.isObject(content.audio)
                ? content.audio
                : $sce.trustAsResourceUrl(content.audio)
            ;
        }
    };

    $scope.fileUpload = function(element) {
        var file = element.files[0],
            reader = new FileReader();

        reader.onload = function(e) {
            $scope.$apply(function() {
                $scope.selected[angular.element(element).attr('name')] = $sce.trustAsResourceUrl(e.target.result);
                $scope.contentUpdated = true;
            });
        };

        reader.readAsDataURL(file);
    };

    $scope.fileRemove = function(type) {
        $scope.selected[type] = null;
        $scope.contentUpdated = true;
    };

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

    $scope.remove = function() {
        var parent = $scope.treeCtl.remove_selected_branch();
        $scope.treeCtl.select_branch(parent);
        processContent(parent);
        $scope.contentUpdated = true;
    };

    $scope.selectRoot = function() {
        $scope.treeCtl.select_branch(null);
        $scope.selected = null;
    };

    $scope.addBranch = function() {
        var selected = $scope.treeCtl.get_selected_branch();
        var created = $scope.treeCtl.add_branch(selected, {
            label: 'beseda',
        });
        $scope.contentUpdated = true;
    };

    $scope.updated = function() {
        $scope.contentUpdated = true;
    }
}]);
