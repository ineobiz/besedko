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
		$data = [
			'email'     => $auth[0],
			'timestamp' => $this->time,
			'content'   => $this->processContent($this->getRequest())
		];

		return file_put_contents($file, json_encode($data))
			? true
			: false
		;
	}

	/**
	 * Recursion for processing valid content data
	 *
	 * @param array $content content branch
	 * @return false|array
	 */
	private function processContent($content) {
		if (!is_array($content)) {
			return false;
		}

		$response = $data = [];

	    foreach ($content as $child) {
			foreach(['label', 'color', 'image', 'audio'] as $prop) {
				if (isset($child[$prop])) {
					$data[$prop] = $child[$prop];
				}
			}

	    	if (!empty($child['children'])) {
	    		$data['children'] = $this->processContent($child['children']);
	    	} else {
	    		unset($data['children']);
	    	}

	    	$response[] = $data;
	    }

	    return $response;
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
}

$processor = new Processor(
	$_SERVER['REQUEST_METHOD'],
	getallheaders(),
	file_get_contents('php://input')
);

$processor->processRequest();