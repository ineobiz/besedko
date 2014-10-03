'use strict';

/**
 * @ngdoc service
 * @name webApp.Content
 * @description Content factory
 */
angular.module('webApp').factory('Content', ['CONFIG', '$http', function (config, $http) {
	var url = '/data/sample.json',
	    content = [],
	    favorites = [],
		promise
	;

	// process content
	function processContent(root, callback) {
	    var i, l;

	    function processNode(node) {
	        if (node.hasOwnProperty('children') && !node.children.length) {
	            delete node.children;
	        }

	        ['image', 'audio'].forEach(function(key) {
	            if (angular.isObject(node[key])) {
	                node[key] = node[key].toString();
	            }
	        });
	    }

	    function contentCleanup(node, callback) {
	        for(var key in node) {
	            if (['uid','label','color','image','audio','children'].indexOf(key) == -1) {
	                delete node[key];
	            }
	        }
	        callback(node);
	    }

	    for (i = 0, l = root.length; i < l; i++) {
	        (function(node) {
	            contentCleanup(node, function() {
	                if (angular.isArray(node.children) && node.children.length) {
	                    processContent(node.children, processNode);
	                }
	                processContent(node, processNode);
	            });
	        }(root[i]));
	    }

	    callback(root, processFavorites(angular.copy(favorites)));
	}

	// process favorites
    function processFavorites(root) {
        var i, l;

        function favoriteCleanup(node, callback) {
            for(var key in node) {
                if (['label','color','content'].indexOf(key) == -1) {
                    delete node[key];
                }
            }
            callback(node);
        }

        for (i = 0, l = root.length; i < l; i++) {
            (function(node) {
                favoriteCleanup(node, function() {
                    processFavorites(node, favoriteCleanup);
                });
            }(root[i]));
        }

        return root;
    }

	return {
		get: function(credentials) {
			if (!promise) {
			    if (angular.isObject(credentials)) {
			        promise = $http.get('/process', {
                            headers: {
                                'Auth-Credentials': credentials.email + ":" + credentials.password
                            }
                        }).then(function(response) {
                            content = response.data.content || [];
                            favorites = response.data.favorites || [];

                            return {
                                content : content,
                                favorites : favorites
                            };
                        });
			    } else {
	                promise = $http.get(url).then(function(response) {
	                    content = response.data;

                        return {
                            content : content,
                            favorites : []
                        };

	                });
			    }
			}
			return promise;
		},
		set: function(credentials, response) {
	        processContent(angular.copy(content), function(processed, favorites){
	            $http
	                .put('/process', {content: processed, favorites: favorites}, {
	                    headers: {
	                        'Content-Type': 'application/json',
	                        'Auth-Credentials': credentials.email + ":" + credentials.password
	                    }
	                })
	                .success(function (data) { return response(true); })
	                .error(function (data) { return response(false); })
	            ;
	        });
		},
		resetPromise: function(data) {
		    promise = null;
		}
	};
}]);