<?php

// fallback for pre-5.4
if (!function_exists('getallheaders')) {
	function getallheaders() {
		$headers = '';
		foreach ($_SERVER as $name => $value){
			if (substr($name, 0, 5) == 'HTTP_'){
				$headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
			}
		}
		return $headers;
	}
}

class Processor {
	private $method, $headers, $time, $request, $json;

	/**
	 * Constructor
	 *
	 * @param string $method
	 * @param array $headers
	 * @param string $request
	 */
	public function __construct($method, $headers, $request) {
		$this->time    = time();
		$this->method  = $method;
		$this->headers = $headers;
		$this->request = $request;
	}

	/**
	 * Process incoming request
	 */
	public function processRequest() {
		// check credentials on empty POST request (login)
		if (
				$this->method == 'POST'
				&& $this->getRequest() == false
		) {
			header($this->checkCredentials()
				? "HTTP/1.1 200 OK"
				: "HTTP/1.1 403 Unauthorized"
			);
			return;
		}

		// return content on valid empty GET request
		if (
				$this->method == 'GET'
				&& $this->getRequest() == false
				&& ($file = $this->checkCredentials())
		) {
			header('Content-Type: application/json');
			echo file_get_contents($file);
			return ;
		}

		// store content on valid non-empty PUT request
		if (
				$this->method == 'PUT'
				&& $this->getRequest() !== false
				&& $this->checkCredentials()
		) {
			$this->storeContent();
			return;
		}

		// @todo register

	}
	/**
	 * Check credentials
	 *
	 * @return false|string
	 */
	public function checkCredentials() {
		if (!$header = $this->getAuthHeader()) {
			return false;
		}

		return $this->getUserFile($header[0], $header[1], true);
	}

	/**
	 * Decode incoming JSON.
	 *
	 * @return array|false
	 */
	public function getRequest() {
		if (isset($this->json)) {
			return $this->json;
		}

		$this->json = json_decode($this->request, true);

		if (json_last_error() !== JSON_ERROR_NONE) {
			$this->json = false;
		}

		return $this->json;
	}

	/**
	 * Store content to filesystem
	 *
	 * @return boolean
	 */
	public function storeContent() {
		$auth = $this->getAuthHeader();
		$file = $this->getUserFile($auth[0], $auth[1]);
		$folder  = $this->getUserFolder($auth[0], $auth[1]);
		$request = $this->getRequest();
		$mFiles  = array_flip(array_merge(
			array_keys($request['files']['image']),
			array_keys($request['files']['audio'])
		));

		$data = [
			'email'     => $auth[0],
			'timestamp' => $this->time,
			'content'   => $this->processContent($request['content'], $mFiles),
			'favorites' => $this->processFavorites($request['favorites'], $mFiles)
		];

		return file_put_contents($file, json_encode($data)) && $this->processFiles($request['files'], $folder)
			? true
			: false
		;
	}

	/**
	 * Recursion for processing valid content data
	 *
	 * @param array $content content branch
	 * @param array $files   modified files
	 * @return false|array
	 */
	private function processContent($content, $files) {
		if (!is_array($content)) {
			return false;
		}

		$response = [];

	    foreach ($content as $child) {
			$data = [];

			foreach(['uid', 'ts', 'label', 'color', 'image', 'audio'] as $prop) {
				if (isset($child[$prop])) {
					$data[$prop] = $child[$prop];
				}
			}

	    	if (!empty($child['children'])) {
                $data['children'] = $this->processContent($child['children'], $files);
	    	} else {
	    		unset($data['children']);
	    	}

            if (!isset($child['ts']) || isset($files[$child['uid']])) {
                $data['ts'] = $this->time;
            }

			$response[] = $data;
	    }

	    return $response;
	}

	/**
	 * Loop for processing valid favorites data
	 *
	 * @param array $favorites favorites
	 * @return false|array
	 */
	private function processFavorites($favorites) {
		if (!is_array($favorites)) {
			return false;
		}

		$response = [];

	    foreach ($favorites as $child) {
			$data = [];

			foreach(['uid', 'ts', 'label', 'color', 'image', 'content'] as $prop) {
				if (isset($child[$prop])) {
					$data[$prop] = $child[$prop];
				}
			}

			if (!isset($child['ts']) || isset($files[$child['uid']])) {
			    $data['ts'] = $this->time;
			}

	    	$response[] = $data;
	    }

	    return $response;
	}

    /**
     * Loop for processing base64 encoded files
     *
     * @param array $files
     *            files
     * @param string $folder
     *            folder
     * @return bool
     */
    private function processFiles($files, $folder) {
        if (!is_array($files)) {
            return false;
        }

        foreach ($files as $type => $data) {
            foreach ($data as $id => $base64) {
                $isImage  = $type == 'image' ? true : false;
                $filename = sprintf("%s/%s.%s", $folder, $id, $isImage ? 'png' : $type);

                if (!empty($base64)) {
                    $cnt = $isImage
                        ? base64_decode(explode(',', $base64)[1])
                        : $base64
                    ;
                    file_put_contents($filename, $cnt);
                } else {
                    @unlink($filename);
                }
            }
        }

        return true;
    }

	// @todo
	public function register() {
	}

	/**
	 * Parse authentication data from header
	 *
	 * @return false|array email, password if found, false if not found/invalid
	 */
	private function getAuthHeader() {
		if (isset($this->headers['Auth-Credentials'])) {
			$auth = explode(":", $this->headers['Auth-Credentials'], 2);

			return count($auth) == 2
				? $auth
				: false
			;
		}

		return false;
	}

	/**
	 * Generate filename based on email,password
	 *
	 * @param string $email email
	 * @param string $pass  password
	 * @return string|false
	 */
	private function getUserFile($email, $pass, $check = false) {
		// @todo use secure, instead of filesystem friendly filename
		$fileName = sprintf(
			"%s/data/user-generated/%s_%s.json",
			dirname(__DIR__),
			md5($email),
			//normalize $email,
			md5($pass)
			//password_hash($pass, PASSWORD_DEFAULT)
		);

		if ($check && !is_file($fileName)) {
			return false;
		}

		return $fileName;
	}

	/**
	 * Get private folder based on email,password
	 *
	 * @param string $email email
	 * @param string $pass  password
	 * @return string
	 */
	private function getUserFolder($email, $pass) {
		return sprintf(
			"%s/data/user-generated/%s_%s",
			dirname(__DIR__),
			md5($email),
			md5($pass)
		);
	}
}

$processor = new Processor(
	$_SERVER['REQUEST_METHOD'],
	getallheaders(),
	file_get_contents('php://input')
);

$processor->processRequest();