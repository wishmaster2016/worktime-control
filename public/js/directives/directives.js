'use strict';

angular.module('WorktimeControlApp.directives', [])
  .directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text('Version; ' + version);
    };
  }]);