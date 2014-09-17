'use strict';

/**
 * @ngdoc service
 * @name webApp.content
 * @description
 * # content
 * Factory in the webApp.
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
		// @todo
		set: function() {
		},
		// @todo
	    clear: function() {
	    },
	};
}]);