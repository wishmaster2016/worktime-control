'use strict';

angular.module('WorktimeControlApp.directives', [])
  .directive('pagination', [ function() {
    return {
      restrict: 'E',
      scope: {
        pagingData: '=pagingData',
        onSelectPage: '=onSelectPage'
      },
      templateUrl: 'partials/directives/pagination.html',
      link: function($scope, elm, attrs) {
/*        console.log(scope.numPages);
        console.log(scope.tableName);
        console.log(scope.currentPage);*/
        $scope.pages = [];
        $scope.$watch(function () {
          return $scope.pagingData;
        },                       
        function(newVal, oldVal) {
          $scope.pagingData = newVal;
          $scope.pages = new Array(newVal.totalPages);
        }, true);
      }
    }
  }]);