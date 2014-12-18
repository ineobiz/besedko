'use strict';

/* global Storage */

/**
 * @ngdoc service
 * @name webApp.Authentication
 * @description Authentication factory
 */
angular.module('webApp').factory('Authentication', ['CONFIG', '$http', '$rootScope', function (config, $http, $rootScope) {
    var service = {};
    var remote = config.remote || '';

    service.Login = function(email, password) {
        return $http.post(remote + '/process', null, {
            headers: { 'Auth-Credentials' : email + ':' + password }
        });
    };

    service.CheckCredentials = function() {
        var email, password;

        if (
            Storage !== void(0) &&
            (email = localStorage.getItem('email')) &&
            (password = localStorage.getItem('password'))
        ) {
            service.SetCredentials(email, password);
        }
    };

    service.SetCredentials = function(email, password) {
        $rootScope.credentials = {
            email : email,
            password : password
        };

        if (Storage !== void(0)) {
            localStorage.setItem('email', email);
            localStorage.setItem('password', password);
        }
    };

    service.GetCredentials = function() {
        return $rootScope.credentials;
    };

    service.ClearCredentials = function() {
        $rootScope.credentials = false;

        if (Storage !== void(0)) {
            localStorage.removeItem('email');
            localStorage.removeItem('password');
        }
    };

    return service;
}]);