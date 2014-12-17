'use strict';

angular.module('WorktimeControlApp.controllers', ['mgcrea.ngStrap'])
  .controller('loginCtrl', ['$scope', '$http', 'toaster' , '$timeout', 'Authentication', function($scope, $http, toaster, $timeout, Authentication) {
    var $window = $(window);
    $scope.authenticated = Authentication.isAuthenticated();
    $window.keydown(function (event) {
      if (event.which === 13) {
        signIn();
      }
    });

    $scope.signIn = function() {
      Authentication.signIn($scope.login, $scope.password);
    };
  }])

  .controller('mainCtrl', ['$scope', '$http', '$location', 'toaster', 'Authentication', '$timeout', function($scope, $http, $location, toaster, Authentication, $timeout) {
    $scope.loginFlag = false;
    $scope.page = null;
    $scope.authenticated = Authentication.isAuthenticated();
    $scope.userName = Authentication.getUsername();
    $scope.$on('$routeChangeSuccess', function() {
      $scope.page = $location.path();
    });

    $scope.signOut = function() {
      $scope.authenticated = Authentication.signOut();
      toaster.pop('info', 'Information', 'Row successfully updated.');
    };

    if($scope.authenticated) {
      $timeout( function() {
        toaster.pop('success', 'Hello, ' + Authentication.getUsername() + ' ! ',  'Welcome to the Worktime Control app.');
      });
    };
  }])

  .controller('worktimeCtrl', ['$scope', '$http', '$timeout', '$modal', 'toaster', function($scope, $http, $timeout, $modal, toaster) { 
    var init = function () {
      toaster.pop('success', 'Hello, ' + username + ' ! ',  'Welcome to the Simple chat.');   
    };

    var username = {};
    $scope.table = {};
    $scope.curRowCount = 0;
    $scope.searchCols = {};
    $scope.tableCount = undefined;
    $scope.tablesDetails = {};
    $scope.pagingData = {
      tableName: undefined,
      totalPages: 0,
      selectedPage: 1,
      pageSize: 3
    };
    $scope.filterCriteria = {
      orderBy: 'id',
      orderAsc: true
    };
    
    $scope.user = JSON.parse(sessionStorage['user'] || '{}');
    if($scope.user && $scope.user.id && $scope.user.id > 0) {
      username = $scope.user.login;
    }

    $scope.sort = function(column) {
      $scope.filterCriteria.orderBy = column;
      $scope.filterCriteria.orderAsc = !$scope.filterCriteria.orderAsc;
      $scope.selectTable($scope.pagingData.tableName, $scope.pagingData.selectedPage);
    };

    var getTables = function() {
      $.get("/tables", function(data) {
        $timeout(function() {
          $scope.tables = data.data;
          $scope.tableCount = data.data.length;
          setToDefaultFilter();
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

    var setToDefaultFilter = function() {
      $scope.filterCriteria.orderBy = 'id';
      $scope.filterCriteria.orderAsc = true;
    };

    $scope.selectTable = function(obj, page) {
      try {
        var offset = page * $scope.pagingData.pageSize - $scope.pagingData.pageSize;
        var params = {};
        $scope.loading = true;
        $scope.pagingData.tableName = obj;
        $scope.pagingData.selectedPage = page;
        clearTable();
        params = {
          tableName: $scope.pagingData.tableName,
          searchCols: $scope.searchCols
        };
        $http.post("/rowsCount", params)
          .then(function(data) {
            $timeout(function() {
              $scope.curRowCount = data.data.data[0].count;
              $scope.pagingData.totalPages = Math.ceil($scope.curRowCount / $scope.pagingData.pageSize)
            });
        });
        if(obj) {
          var order = undefined;
          if($scope.filterCriteria.orderAsc) {
            order = "asc";
          }
          else {
            order = "desc";
          }
          params = {
            tableName: $scope.pagingData.tableName,
            pageSize: $scope.pagingData.pageSize,
            offset: offset,
            orderBy: $scope.filterCriteria.orderBy,
            orderAsc: order,
            searchCols: $scope.searchCols
          };
          $http.post("/rows/", params) 
            .then(function(data) {
              $timeout(function() {
                if(data.data.data[0].column_name) {
                  var buf = []
                  for(var i = 0; i<data.data.data.length; i++) {
                    buf.push(data.data.data[i].column_name);
                  }
                  $scope.table.cols = buf;
                }
                else {
                  $scope.table.cols = Object.keys(data.data.data[0]);
                  for(var i = 0; i < data.data.data.length; i++) {
                    $scope.table.rows.push(data.data.data[i]);
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
  }]);
