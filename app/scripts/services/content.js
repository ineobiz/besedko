'use strict';

/**
 * @ngdoc service
 * @name webApp.Content
 * @description Content factory
 */
angular.module('webApp').factory('Content', ['CONFIG', '$http', function (config, $http) {
	var url = '/data/content.json',
    	data = [],
		promise
	;

	return {
		get: function() {
			if (!promise) {
				promise = $http.get(url).then(function(response) {
					data = response.data;
					return data;
				});
			}
			return promise;
		},
		set: function(credentials) {
		    console.log([ "set Content", data]);
	        return $http.put('/process', data, {
	            headers: {
	                'Content-Type': 'application/json',
	                'Auth-Credentials': credentials.email + ":" + credentials.password
	            }
	        });
		}
	};
}]);