'use strict';

angular.module('webApp').controller('UrediCtrl', ['$scope', '$timeout', '$sce', 'Content', function ($scope, $timeout, $sce, content) {
    $scope.content = $scope.treeCtl = [];
    $scope.selected = null;
    content.get().then(function(data) {
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
            });
        };

        reader.readAsDataURL(file);
    };

    $scope.fileRemove = function(type) {
        $scope.selected[type] = null;
    };

    // @todo
    $scope.save = function() {
        //console.log([ "save", ]);
    };

    $scope.remove = function() {
        var parent = $scope.treeCtl.remove_selected_branch();
        $scope.treeCtl.select_branch(parent);
        processContent(parent);
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
    };
}]);
