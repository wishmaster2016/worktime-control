'use strict';

angular.module('WorktimeControlApp', ['ngRoute', 'ngAnimate', 'WorktimeControlApp.filters', 'WorktimeControlApp.services', 'WorktimeControlApp.directives', 'WorktimeControlApp.controllers', 'toaster'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {templateUrl: 'partials/login.html', controller: 'loginCtrl'})
    .when('/worktime', {templateUrl: 'partials/login.html',controller: 'loginCtrl'})
    .otherwise({redirectTo: '/'});

  var user = JSON.parse(sessionStorage['user'] || '{}')
    if(user && user.id > 0)
      $routeProvider
        .when('/', {templateUrl: 'partials/worktime.html', controller: 'worktimeCtrl'})
        .when('/worktime', {templateUrl: 'partials/worktime.html', controller: 'worktimeCtrl'});
}]);