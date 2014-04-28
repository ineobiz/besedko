'use strict';

var webApp = angular
  .module('webApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/povej', {
        templateUrl: 'views/povej.html',
        controller: 'PovejCtrl'
      })
      .when('/mobile', {
        templateUrl: 'views/mobile.html',
        controller: 'MobileCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(['$rootScope', '$location', function($rootScope, $location) {
      var path = function() { return $location.path(); };
      
      $rootScope.$watch(path, function(newVal, oldVal) {
          $rootScope.activetab = newVal;
      });
  }]);
