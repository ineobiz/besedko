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
		promise, data
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
		getStruct: function(level) {
		    if (typeof data.structure[level] === 'undefined') {
		        return null; 
		    }

		    var content = this,
		        struct = []
		    ;

            angular.forEach(data.structure[level], function(cId) {
                var cStruct = content.getContent(cId);
                if (cStruct) {
                    cStruct.id = cId;
                    this.push(cStruct);
                }
            }, struct);

			return struct;
		},
		getParent: function(level) {
		    if (level == 'root') {
		        return false;
		    }

		    for (var parent in data.structure) {
		        for (var i = 0, len = data.structure[parent].length; i < len; i++) {
		            if (data.structure[parent][i] == level) {
	                    return parent;
		            }
		        }
		    }
		    
		    return false;
		},
	    getContent: function(id) {
	        return typeof data.library[id] !== 'undefined'
    			? data.library[id]
	    		: {}
			;
	    }
	};
}]);