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

	function setData(req) {
	    data = req;
	}

	function processTree(root, callback) {
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

	    for (i = 0, l = root.length; i < l; i++) {
	        (function(node) {
	            treeCleanup(node, function() {
	                if (node.children.length) {
	                    processTree(node.children, processNode);
	                }
	                processTree(node, processNode);
	            });
	        }(root[i]));
	    }

	    callback(root);
	}

	function treeCleanup(node, callback) {
	    for(var key in node) {
	        if (['label','color','image','audio','children'].indexOf(key) == -1) {
	            delete node[key];
	        }
	    }
	    callback(node);
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
                            data = response.data.content || {};
                            return data;
                        });
			    } else {
	                promise = $http.get(url).then(function(response) {
	                    data = response.data;
	                    return data;
	                });
			    }
			}
			return promise;
		},
		set: function(credentials, response) {
		    processTree(angular.copy(data), function(processed){
	            $http
	                .put('/process', processed, {
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