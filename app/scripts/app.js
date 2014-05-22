'use strict';

var webApp = angular
    .module('webApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute'
    ])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                controller : 'MainCtrl',
                templateUrl : 'views/main.html'
            })
            .when('/povej', {
                controller : 'PovejCtrl',
                template : '<povej>'
            })
            .when('/mobile', {
                controller : 'MobileCtrl',
                templateUrl : 'views/mobile.html'
            })
            .when('/login', {
                controller : 'LoginCtrl',
                templateUrl : 'views/login.html'
            })
            .otherwise({
                redirectTo : '/'
            })
        ;
        // @todo check cordova routing, apps
        //$locationProvider.html5Mode(true);
    }])
    .run(['CONFIG', '$rootScope', '$location', function(config, $rootScope, $location) {
        var path = function() {
            return $location.path();
        };

        $rootScope.$watch(path, function(newVal, oldVal) {
            $rootScope.activetab = newVal;
        });

        // @todo persist via localstorage?
        $rootScope.fullScreen = config.startFS
            ? true
            : false
        ;

        $rootScope.$on('event:toggleFullscreen', function(event) {
            $rootScope.fullScreen = !$rootScope.fullScreen;
        });
    }])
;