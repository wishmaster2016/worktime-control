'use strict';

angular.module('WorktimeControlApp.services', [])
  .service('Authentication', ['toaster', '$http', function(toaster, $http) {

    var authentication = { 
      authenticated: undefined,
      username: false
    };

    authentication.signIn = function(login, password) {
      var params = {
        login : login, 
        password : password,
      };
      $http.post("/login", params)
        .then(function(data) {
          if(data.data.success) {
            sessionStorage['user'] = JSON.stringify(data.data.data);
            authentication.authenticated = true;
            authentication.username = login;      
            location.reload();
          }
          else
            toaster.pop('error', 'Error', 'Entered username and / or password is incorrect. Please try again later.');
        },
        function() {
          toaster.pop('error', 'Error', 'Please try again later.');
        }
      );
    };

    authentication.signOut = function() {
      delete sessionStorage['user'];
      authentication.authenticated = false;
      authentication.username = false;
      location.reload();    
    };

    authentication.isAuthenticated = function() {
      if(authentication.authenticated === undefined) {
        if(sessionStorage['user']) {
          var user = JSON.parse(sessionStorage['user']);
          authentication.username = user.login;
          authentication.authenticated = true;
        }
      }
      return authentication.authenticated;
    };

    authentication.getUsername = function() {
      return authentication.username;
    };

    return authentication;
  }]);
