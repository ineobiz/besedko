'use strict';

var webApp = angular
    .module('webApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'angularBootstrapNavTree'
    ])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                controller : 'MainCtrl',
                templateUrl : 'views/main.html',
                title: 'info'
            })
            .when('/povej', {
                controller : 'PovejCtrl',
                template : '<povej>',
                title: 'webapp'
            })
            .when('/mobile', {
                controller : 'MobileCtrl',
                templateUrl : 'views/mobile.html',
                title: 'mobilna aplikacija'
            })
            .when('/login', {
                controller : 'LoginCtrl',
                templateUrl : 'views/login.html',
                title: 'prijavi se'
            })
            .when('/uredi', {
                controller: 'UrediCtrl',
                templateUrl: 'views/uredi.html',
                title: 'urejevalnik'
            })
            .otherwise({
                redirectTo : '/'
            })
        ;
        // @todo check cordova routing, apps
        $locationProvider.html5Mode(true);
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

        $rootScope.$on('event::toggleFullscreen', function(event) {
            $rootScope.fullScreen = !$rootScope.fullScreen;
        });
        
        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            $rootScope.title = current.$$route.title;
        });
    }])
;