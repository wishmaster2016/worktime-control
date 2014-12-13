'use strict';

angular.module('WorktimeControlApp.controllers', [])
  .controller('loginCtrl', ['$scope', '$http', 'toaster' , '$timeout', function($scope, $http, toaster, $timeout) {
      var $window = $(window);
      var $usernameInput = $('.usernameInput');
      var username;
      var $currentInput = $usernameInput.focus();
      var countOfUsers = parseInt($scope.badge);

      $scope.logout = function() {
        toaster.pop('info', 'Information', 'You are successfully logged off.');
        setTimeout(function () {
          $scope.loading = true;
          delete sessionStorage['user'];
          $scope.user = null;
          location.reload();
          $scope.loading = false;
        }, 2500);     
      }

      function setUsername () {
        username = cleanInput($usernameInput.val());
        //sharedProperties.setProperty(username);
      }

      function cleanInput (input) {
        return $('<div/>').text(input).text();
      }

      $window.keydown(function (event) {
        if (event.which === 13) {
          signIn();
        }
      });

      $scope.user = sessionStorage['user'];
      $scope.output = "chat";
      $scope.signIn = function() {
        $scope.$parent.loading = true;
        var params = {
          login : $scope.login, 
          password : $scope.password,
        };
        $http.post("/login", params)
          .then(function(data) {
            if(data.data.success) {
              sessionStorage['user'] = JSON.stringify(data.data.data);
              username = cleanInput($usernameInput.val());
              //sharedProperties.setProperty(username);              
              location.reload();
            }
            else
              toaster.pop('error', 'Error', 'Entered username and / or password is incorrect. Please try again later.');
            $scope.$parent.loading = false;
          },
          function() {
            toaster.pop('error', 'Error', 'Please try again later.');
            $scope.$parent.loading = false;
          }
        );
      }
  }])

  .controller('mainCtrl', ['$scope', '$http', '$location', 'toaster' , function($scope, $http, $location , toaster) {
    var countOfUsers = 0;
    $scope.loginFlag = false;
    $scope.page = null;
    $scope.$on('$routeChangeSuccess', function() {
    $scope.page = $location.path();
    });
    $scope.logout = function() {
      toaster.pop('info', 'Information', 'You are successfully logged off.');
      setTimeout(function () {
        $scope.loading = true;
        delete sessionStorage['user'];
        $scope.user = null;
        location.reload();
        $scope.loading = false;
      }, 2500);     
    }
  }])

  .controller('worktimeCtrl', ['$scope', '$http', '$timeout', 'toaster', function($scope, $http, $timeout, toaster) { 
    var init = function () {
      setUsername();
      isLogined = true;
      toaster.pop('success', 'Hello, ' + username + ' ! ',  'Welcome to the Simple chat.');   
    };

    var username = {};
    $scope.table = {};
    
    $scope.user = JSON.parse(sessionStorage['user'] || '{}');
    if($scope.user && $scope.user.id && $scope.user.id > 0) {
      username = $scope.user.login;
    }

    $scope.getTables = function() {
      $.get("/tables", function(data) {
        $timeout(function() {
          $scope.tables = data.data;
        });
      });    
    }

    var clearTable = function() {
      $scope.table = {
        cols: [ ],
        rows: [ ],
        newRow: { },
        updRow: { }
      };
    };

    $scope.selectTable = function(obj) {
    try {
      $scope.deleteId = undefined;
      $scope.updateId = undefined;
      $scope.loading = true;
      $scope.tableName = obj;
      clearTable();
      if(obj) {
        $.get("/rows/"+$scope.tableName, function(data) {
         $timeout(function() {
            console.log($scope.tables);
/*          $scope.tables = data.data;*/
            $scope.table.cols = Object.keys(data.data[0]);
            for(var i=0; i<data.data.length; i++) {
              $scope.table.rows.push(data.data[i]);
            }
          });/*, function(ret) {
            $scope.loading = false;
            $timeout(angular.noop);
          }, function(err) {
            throw err;
          }

        );*/
      });
    }}
    catch(e) {
      $scope.loading = false;
      showError(e.message);
    };
  };

      $scope.changePWD = function() {
        $scope.$parent.loading = true;
        var params = {
          id : $scope.user.id, 
          password : document.getElementById("oldPassword").value,
          email : $scope.user.email,
          newPassword : document.getElementById("newPassword").value,
        };
        if(document.getElementById("newPassword").value != document.getElementById("newPasswordConfirm").value) {
          toaster.pop('warning', 'Error', 'Password repeat is typed incorrectly.');
          $scope.$parent.loading = false;
          return;
        }
        if(document.getElementById("newPassword").value.length < 6) {
          toaster.pop('warning', 'Error', 'Password must be at least 6 characters.');
          $scope.$parent.loading = false;
          return;
        }
        $http.post("/saveprofilepw", params)
          .then(function(data) {
            if(data.data.success) {
              sessionStorage['user'] = JSON.stringify(data.data.data);
              toaster.pop('info', 'Information', 'User password successfully changed.');
            }
            else
              toaster.pop('error', 'Error', 'Entered password is incorrect. Please try again later.');
            $scope.$parent.loading = false;
          },
          function() {
            toaster.pop('error', 'Error', 'Please try again later.');
            $scope.$parent.loading = false;
          });
      }
  }]);