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
  