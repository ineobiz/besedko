'use strict';

/**
 * @ngdoc service
 * @name webApp.Content
 * @description Content factory
 */
angular.module('webApp').factory('Content', ['CONFIG', '$http', '$sce', '$q', '$cordovaFile', 'md5', function (config, $http, $sce, $q, $cordovaFile, md5) {
    var url = 'data/sample.json',
        remote = config.remote || '',
        content = [],
        favorites = [],
        promise
    ;

    function localStructurePath(credentials, fullPath) {
        var loc =
            cordova.file.externalDataDirectory
            + md5.createHash(credentials.email + credentials.password)
        ;

        // strip everything before Android in 'file:///storage/sdcard0/Android/...'
        return fullPath ? loc : loc.substring(loc.indexOf('Android'), loc.length);
    }

    // fetch remote file
    function getRemoteFile(file, credentials, asText) {
        var
            q = $q.defer(),
            folderHash = md5.createHash(credentials.email + credentials.password),
            remoteFile = remote + '/data/' + folderHash + '/' + file
        ;

        if (typeof cordova == 'object') {
            var
                localFile  = cordova.file.externalDataDirectory + folderHash + '/' + file,
                localPath  = localFile.substring(localFile.indexOf('Android'), localFile.length)
            ;

            $cordovaFile.checkFile(localPath).then(
                function(fileEntry) {
                    q.resolve(asText ? $cordovaFile.readAsText(localPath) : fileEntry.toURL());
                },
                function() {
                    $cordovaFile
                        .downloadFile(remoteFile, localFile, true, {})
                        .then(function(fileEntry) {
                            q.resolve(asText ? $cordovaFile.readAsText(localPath) : fileEntry.toURL());
                        })
                    ;
                }
            );
        } else {
            if (asText) {
                return $http.get(remoteFile);
            } else {
                q.resolve(remoteFile);
            }
        }

        return q.promise;
    }

    // fetch changed remote files
    function getChangedFilesList(content, mTime) {
        var
            files = [],
            children = []
        ;

        angular.forEach(content, function(c) {
            if (c.hasOwnProperty('image') && c.image === true && (!mTime || c.ts > mTime)) {
                files.push(c.uid + '.png');
            }
            if (c.hasOwnProperty('audio') && c.audio === true && (!mTime || c.ts > mTime)) {
                files.push(c.uid + '.audio');
            }
            if (c.hasOwnProperty('children') && c.children.length) {
                children = children.concat(getChangedFilesList(c.children), mTime);
            }
        });

        return files.concat(children);
    }

	// process content
	function processContent(root, callback) {
	    var i, l;

	    function processNode(node) {
	        if (node.hasOwnProperty('children') && !node.children.length) {
	            delete node.children;
	        }

	        ['image', 'audio'].forEach(function(key) {
	            if (
                    angular.isObject(node[key])
                    || angular.isString(node[key])
                    || node[key] === true
                ) {
	                node[key] = true;
	            } else {
	                delete node[key];
	            }
	        });
	    }

	    function contentCleanup(node, callback) {
	        for(var key in node) {
	            if (['uid','ts','label','color','image','audio','children'].indexOf(key) == -1) {
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
                if (['uid','ts','label','color','image', 'content'].indexOf(key) == -1) {
                    delete node[key];
                }
            }

            ['image'].forEach(function(key) {
                if (
                    angular.isObject(node[key])
                    || angular.isString(node[key])
                    || node[key] === true
                ) {
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

    function fetchChangedFiles(structure, credentials, mTime) {
        var cnt = [], fav = [], all = [];

        if (structure.content.length) {
            cnt = getChangedFilesList(structure.content, mTime);
        }

        if (structure.favorites.length) {
            fav = getChangedFilesList(structure.favorites, mTime);
        }

        angular.forEach(cnt.concat(fav), function(file) {
            all.push($cordovaFile.removeFile(
                localStructurePath(credentials) + '/' + file)
            );

            if (file.indexOf("audio", file.length - "audio".length) !== -1) {
                all.push(getRemoteFile(file, credentials, true));
            } else {
                all.push(getRemoteFile(file, credentials));
            }
        });

        return $q.all(all);
    }

	return {
		get: function(credentials) {
			if (!promise) {
			    if (angular.isObject(credentials)) {
                    promise = $http
                        .get(remote + '/process', {
                            headers: {
                                'Auth-Credentials': credentials.email + ':' + credentials.password
                            }
                        })
                        .then(function(response) {
                            content   = response.data.content;
                            favorites = response.data.favorites;

                            return response.data;
                        })
                    ;
			    } else {
                    promise = $http
                        .get(url).then(function(response) {
                            content   = response.data.content;
                            favorites = response.data.favorites;

                            return response.data;
                        })
                    ;
			    }
			}
			return promise;
		},
		set: function(credentials, content, favorites, uploadIds, response) {
		    var
		        cnt = [], fav = [],
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
	            .put(remote + '/process', {content: cnt, favorites: fav, files : fls}, {
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
		getFile: function(file, credentials, asText) {
		    return getRemoteFile(file, credentials, asText);
		},
		fetchRemotes: function(content, credentials) {
	        angular.forEach(content, function(c) {
	            if (c.hasOwnProperty('image') && c.image === true) {
	                getRemoteFile(c.uid + '.png', credentials)
	                    .then(function(url) {
	                        c.image = url;
	                    })
	                ;
	            }

	            if (c.hasOwnProperty('audio') && c.audio === true) {
	                getRemoteFile(c.uid + '.audio', credentials, true)
	                    .then(function(response) {
	                        c.audio = $sce.trustAsResourceUrl(
                                typeof response == 'object'
                                    ? response.data
                                    : response
                            );
	                    })
	                ;
	            }
	        });

	        return content;
		},
		isLocalStructure: function(credentials) {
            if (
                typeof cordova !== 'object'
                || !angular.isObject(credentials)
            ) {
                var q = $q.defer();
                q.reject();
                return q.promise;
            }

            var localFile = localStructurePath(credentials) + '.json';

            return $cordovaFile.checkFile(localFile);
		},
        saveLocalStructure: function(data, credentials) {
            var q = $q.defer();

            if (
                typeof cordova !== 'object'
                || !angular.isObject(credentials)
                || data.email != credentials.email
            ) {
                q.resolve();
                return q.promise;
            }

            var localFile = localStructurePath(credentials) + '.json';

            $cordovaFile.readAsText(localFile).then(
                function(localData) {
                    localData = JSON.parse(localData);
                    if (localData.timestamp != data.timestamp) {
                        $cordovaFile.writeFile(localFile, data, {}).then(function(){
                            fetchChangedFiles(data, credentials, localData.timestamp)
                                .then(function() {
                                    q.resolve();
                                })
                            ;
                        });
                    } else {
                        q.resolve();
                    }
                },
                function() {
                    $cordovaFile.writeFile(localFile, data, {}).then(function() {
                        fetchChangedFiles(data, credentials).then(function() {
                            q.resolve();
                        });
                    });
                }
            );

            return q.promise;
        },
		getLocalStructure: function(credentials) {
		    if (
	            typeof cordova !== 'object'
                || !angular.isObject(credentials)
            ) {
                var q = $q.defer();
                q.reject();
                return q.promise;
		    }

		    var localFile = localStructurePath(credentials) + '.json';

		    return $cordovaFile.readAsText(localFile);
		}
	};
}]);