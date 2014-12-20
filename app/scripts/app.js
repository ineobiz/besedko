'use strict';

/**
 * @ngdoc overview
 * @name webApp
 * @description
 * # webApp
 *
 * Main module of the application.
 */
var webApp = angular
    .module('webApp', [
        'ngRoute',
        'ui.tree',
        'mediaPlayer',
        'ngImgCrop'
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
            .when('/logout', {
                controller : 'LoginCtrl',
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
    .run(['CONFIG', '$rootScope', '$location', 'Authentication', 'Content', function(config, $rootScope, $location, Authentication, Content) {
        var path = function() {
            return $location.path();
        };

        $rootScope.$watch(path, function(newVal, oldVal) {
            $rootScope.activetab = newVal;
        });

        $rootScope.fullScreen = false;

        $rootScope.$on('ui::toggleFullscreen', function(event) {
            $rootScope.fullScreen = !$rootScope.fullScreen;
        });

        $rootScope.$on('content::load', function(event, scope, sync) {
            var credentials = Authentication.GetCredentials();

            var setupScope = function(data) {
                if (!angular.isObject(data)) {
                    data = JSON.parse(data);
                }

                Content.saveLocalStructure(data, credentials).then(function() {
                    scope.content = Content.fetchRemotes(data.content, credentials);
                    scope.favorites = Content.fetchRemotes(data.favorites, credentials);

                    $rootScope.$broadcast('content::loaded', data);
                });
            };

            Content.isLocalStructure(credentials).then(
                function() {
                    if (sync) {
                        Content.get(credentials).then(setupScope);
                    } else {
                        Content.getLocalStructure(credentials).then(setupScope);
                    }
                },
                function() {
                    Content.get(credentials).then(setupScope);
                }
            );
        });

        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            $rootScope.title = current.$$route.title;
        });
        
        Authentication.CheckCredentials();

        $rootScope.logout = function() {
            Authentication.ClearCredentials();
            Content.resetPromise();
            $location.path('/');
        };
    }])
;