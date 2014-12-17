'use strict';

angular.module('WorktimeControlApp.controllers', ['mgcrea.ngStrap'])
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

  .controller('worktimeCtrl', ['$scope', '$http', '$timeout', '$modal', 'toaster', function($scope, $http, $timeout, $modal, toaster) { 
    var init = function () {
      setUsername();
      isLogined = true;
      toaster.pop('success', 'Hello, ' + username + ' ! ',  'Welcome to the Simple chat.');   
    };
    var username = {};
    $scope.table = {};
    $scope.curRowCount = 0;
/*    $scope.totalPages = 0;
    $scope.selectedPage = 1;
    $scope.pageSize = 3;*/
    
    $scope.tableCount = undefined;
    $scope.tablesDetails = {};

    $scope.pagingData = {
      tableName: undefined,
      totalPages: 0,
      selectedPage: 1,
      pageSize: 3
    };

    $scope.filterCriteria = {
      pageNumber: 1,
      sortDir: 'asc'
    };
    
    $scope.user = JSON.parse(sessionStorage['user'] || '{}');
    if($scope.user && $scope.user.id && $scope.user.id > 0) {
      username = $scope.user.login;
    }

    var getTables = function() {
      $.get("/tables", function(data) {
        $timeout(function() {
          $scope.tables = data.data;
          $scope.tableCount = data.data.length;
        });
      });    
    }

    getTables();

    var clearTable = function() {
      $scope.table = {
        cols: [ ],
        rows: [ ],
        newRow: { },
        updRow: { }
      };
    };

    $scope.selectTable = function(obj, page) {
      try {
        var offset = page * $scope.pagingData.pageSize - $scope.pagingData.pageSize;
        $scope.deleteId = undefined;
        $scope.updateId = undefined;
        $scope.loading = true;
        $scope.pagingData.tableName = obj;
        $scope.pagingData.selectedPage = page;
        clearTable();
        $.get("/rowsCount/"+$scope.pagingData.tableName, function(data) {
          $timeout(function() {
            $scope.curRowCount = data.data[0].count;
            $scope.pagingData.totalPages = Math.ceil($scope.curRowCount/$scope.pagingData.pageSize)
          });
        });
        if(obj) {
          $.get("/rows/"+$scope.pagingData.tableName+"/"+$scope.pagingData.pageSize+"/"+offset, function(data) {
            $timeout(function() {
              /*console.log($scope.tables);*/
              if(data.data[0].column_name) {
                var buf = []
                for(var i = 0; i<data.data.length; i++) {
                  buf.push(data.data[i].column_name);
                }
                $scope.table.cols = buf;
              }
              else {
                $scope.table.cols = Object.keys(data.data[0]);
                for(var i = 0; i < data.data.length; i++) {
                  $scope.table.rows.push(data.data[i]);
                }
              }
              for(var i in $scope.table.cols) {
                var tmp = $scope.table.cols[i];
                $scope.table.updRow[tmp] = {};
                $scope.table.newRow[tmp] = {};
              }
            });
          });
        }
      }
      catch(e) {
        $scope.loading = false;
        showError(e.message);
      };
    };

    $scope.showModalAddRow = function() {
      for(var i = 0; i < $scope.table.cols.length; i++) {
        $scope.table.newRow[$scope.table.cols[i]].val = "";
      }
      $modal({
        scope: $scope,
        template: 'partials/modal/addRow.html',
        show: true
      });
    };

    $scope.addRow = function() {
      $scope.loading = true;
      var newRow = $scope.table.newRow;
      var columns = Object.keys(newRow);
      var addString = "";
      for (var i = 0; i < columns.length; i++) {
        if(i == 0) {
          addString += "('" + newRow[columns[i]].val + "', ";
        }
        else if(i == columns.length - 1) {
          addString += "'" + newRow[columns[i]].val + "')";
        }
        else {
          addString +="'" + newRow[columns[i]].val + "', ";
        }
      }
      var params = {
        name : $scope.pagingData.tableName,
        addStr : addString
      };
      $http.post("/addRow", params)
        .then(function(data) {
          if(data.data.success) {
            toaster.pop('info', 'Information', 'Row successfully added.');
            refreshTable();
          }
          else {
            toaster.pop('error', 'Error', 'Can`t add row.');
            refreshTable();
          }
        },
        function() {
          toaster.pop('error', 'Error', 'Please try again later.');
          refreshTable();
      });
    };

    $scope.clearAddForm = function() {
      angular.forEach($scope.table.updRow, function(value, key) {
        $scope.table.updRow[key].val = '';
      });
    };

    $scope.showModalUpdateRow = function(id, row) {
      $scope.updateId = id;
      var b = angular.copy(row);
      for(var key in b) {
        $scope.table.updRow[key].val = b[key];
      }
      $modal({
        scope: $scope,
        template: 'partials/modal/updateRow.html',
        show: true
      });
    };

    $scope.updateRow = function(id) {
      var upd = id;
      if(!upd) {
        upd = $scope.updateId;
      }
      $scope.loading = true;
      var newRow = $scope.table.updRow;
      var columns = Object.keys(newRow);
      var updString = "";
      for (var i = 0; i < columns.length; i++) {
        if(i == columns.length - 1) {
          updString += columns[i] + "='" + newRow[columns[i]].val + "' ";
        }
        else {
          updString += columns[i] + "='" + newRow[columns[i]].val + "', ";
        }
      }
      var params = {
        id : upd,
        name : $scope.pagingData.tableName,
        updStr : updString
      };
      $http.post("/updateRow", params)
        .then(function(data) {
          if(data.data.success) {
            toaster.pop('info', 'Information', 'Row successfully updated.');
            refreshTable();
          }
          else {
            toaster.pop('error', 'Error', 'Can`t update row.');
            refreshTable();
          }
        },
        function() {
          toaster.pop('error', 'Error', 'Please try again later.');
          refreshTable();
      });
    };

    $scope.clearUpdateForm = function() {
      angular.forEach($scope.table.updRow, function(value, key) {
        $scope.table.updRow[key].val = '';
      });
    };

    $scope.showModalDeleteRow = function(id) {
      $scope.deleteId = id;
      $modal({
        scope: $scope,
        template: 'partials/modal/deleteRow.html',
        show: true
      });
    };

    $scope.deleteRow = function(id) {
      var del = id;
      if(!del) {
        del = $scope.deleteId;
      }
      $scope.loading = true;
      var params = {
        id : del,
        name : $scope.pagingData.tableName,
      };
      $http.post("/deleteRow", params)
        .then(function(data) {
          if(data.data.success) {
            toaster.pop('info', 'Information', 'Row successfully deleted.');
            refreshTable();
          }
          else {
            toaster.pop('error', 'Error', 'Can`t delete row.');
            refreshTable();
          }
        },
        function() {
          toaster.pop('error', 'Error', 'Please try again later.');
          refreshTable();
      });
    };

    var refreshTable = function() {
      $scope.selectTable($scope.pagingData.tableName, 1);
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