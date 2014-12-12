'use strict';

/**
 * @ngdoc service
 * @name webApp.Content
 * @description Content factory
 */
angular.module('webApp').factory('Content', ['CONFIG', '$http', 'md5', function (config, $http, md5) {
	var url = 'data/sample.json',
	    content = [],
	    favorites = [],
	    files = [],
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
	            if (angular.isObject(node[key]) || angular.isString(node[key])) {
	                node[key] = true;
	            } else {
	                delete node[key];
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

	    callback(root);
	}

	// process favorites
    function processFavorites(root) {
        var i, l;

        function favoriteCleanup(node, callback) {
            for(var key in node) {
                if (['uid','label','color','image', 'content'].indexOf(key) == -1) {
                    delete node[key];
                }
            }

            ['image'].forEach(function(key) {
                if (angular.isObject(node[key]) || angular.isString(node[key])) {
                    node[key] = true;
                } else {
                    delete node[key];
                }
            });

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

    // iterate content
    function contentIterator(root, f) {
        var rootBranch, i, len, ref, results;

        var callback = function(branch, level) {
            var child, i, len, ref, results;
            f(branch, level);
            if (branch.children != null) {
                ref = branch.children;
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                    child = ref[i];
                    results.push(callback(child, level + 1));
                }
                return results;
            }
        };

        ref = root;
        results = [];

        for (i = 0, len = ref.length; i < len; i++) {
            rootBranch = ref[i];
            results.push(callback(rootBranch, 1));
        }

        return results;
    }

	return {
		get: function(credentials) {
			if (!promise) {
			    if (angular.isObject(credentials)) {
			        promise = $http.get('/process', {
                            headers: {
                                'Auth-Credentials': credentials.email + ':' + credentials.password
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
                        content = response.data.content || [];
                        favorites = response.data.favorites || [];

                        return {
                            content : content,
                            favorites : favorites
                        };

	                });
			    }
			}
			return promise;
		},
		set: function(credentials, uploadIds, response) {
		    var
		        cnt = [],
		        fav = [],
		        fls = { image: {}, audio: {} }
	        ;

	        processContent(angular.copy(content), function(processed) {
	            cnt = processed;
	        });

	        fav = processFavorites(angular.copy(favorites));

	        contentIterator(content, function(c) {
	            var
	                img = null,
	                aud = null
                ;

                if (uploadIds.image.indexOf(c.uid) !== -1) {
                    img = angular.isObject(c.image)
                        ? c.image.toString()
                        : c.image
                    ;
                    fls.image[c.uid] = img;
                }

                if (uploadIds.audio.indexOf(c.uid) !== -1) {
                    aud = angular.isObject(c.audio)
                        ? c.audio.toString()
                        : c.audio
                    ;
                    fls.audio[c.uid] = aud;
                }
            });

            angular.forEach(favorites, function(f) {
                var img = null;

                if (uploadIds.image.indexOf(f.uid) !== -1) {
                    img = angular.isObject(f.image)
                        ? f.image.toString()
                        : f.image
                    ;
                    fls.image[f.uid] = img;
                }
            });

	        $http
	            .put('/process', {content: cnt, favorites: fav, files : fls}, {
	                headers: {
	                    'Content-Type': 'application/json',
	                    'Auth-Credentials': credentials.email + ':' + credentials.password
                    }
                })
                .success(function (data) { return response(true); })
                .error(function (data) { return response(false); })
	        ;
		},
		iterate : function(callback) {
		    contentIterator(content, callback);
		},
		resetPromise: function(data) {
		    promise = null;
		},
		getFile: function(file, credentials) {
		    return $http.get(
	            '/data/' + md5.createHash(credentials.email + credentials.password) + '/' + file
	        );
		}
	};
}]);