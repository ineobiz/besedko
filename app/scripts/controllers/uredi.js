'use strict';

angular.module('webApp').controller('UrediCtrl', ['$scope', '$timeout', '$sce', 'content', function ($scope, $timeout, $sce, content) {
    $scope.content = $scope.tree = [];
    $scope.selected = null;

    content.get().then(function(data) {
        $scope.content = data;
    });

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

    $scope.treeHandler = function(branch) {
        processContent(branch);
    };

    $scope.selectRoot = function() {
        $scope.tree.select_branch(null);
        $scope.selected = null;
    };

    $scope.save = function() {
        console.log([ "save", ]);
    };

    $scope.remove = function() {
        var parent = $scope.tree.remove_selected_branch();
        $scope.tree.select_branch(parent);
        processContent(parent);
    };

    $scope.addBranch = function() {
        var selected = $scope.tree.get_selected_branch();
        var created = $scope.tree.add_branch(selected, {
            label: 'Naziv',
        });
        $scope.tree.select_branch(created);
        $scope.selected = created;
    };

    $scope.fileUpload = function(element) {
        var
            file = element.files[0],
            reader = new FileReader()
        ;

        reader.onload = function(e) {
            $scope.$apply(function() {
                $scope.selected[angular.element(element).attr('name')] = $sce.trustAsResourceUrl(e.target.result);
            });
        };

        reader.readAsDataURL(file);
   };
}]);
