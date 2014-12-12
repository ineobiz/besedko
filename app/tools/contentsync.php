#!/usr/bin/php
<?php

class ContentSync {
	private $contentId, $file, $folder;

	/**
	 * Constructor
	 *
	 * @param string $content
	 */
	public function __construct($content) {
		$this->contentId = $content;
	    $this->file      = $this->getContentFile();
	    $this->folder    = $this->getContentFolder();
	}

	/**
	 * Process content structure, check for valid files
	 */
	public function sync() {
	    $structure = $this->getContentStructure();
	    
	    $structure['content']   = $this->processContent($structure['content']);
	    $structure['favorites'] = $this->processFavorites($structure['favorites']);
	    $structure['timestamp'] = time();
	    
	    // backup current
	    @copy($this->file, sprintf("%s.%s", $this->file, $structure['timestamp']));
	    
	    // write new structure
	    file_put_contents($this->file, json_encode($structure));
	    
	    return $this->responseMsg("Content structure synced.");
	}

	/**
	 * Recursion for iterating content and updating image/audio relations
	 *
	 * @param array $content content branch
	 * @return false|array
	 */
	private function processContent($content) {
		if (!is_array($content)) {
			return false;
		}

		$response = [];

	    foreach ($content as $child) {
			$data = $child;

			foreach(['image', 'audio'] as $prop) {
			    if (is_file(sprintf("%s/%s.%s", $this->folder, $child['uid'], $prop))) {
			        $data[$prop] = true;
			    } else {
			        unset($data[$prop]);
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
        $prop = 'image';

	    foreach ($favorites as $child) {
	        $data = $child;
        
	        if (is_file(sprintf("%s/%s.%s", $this->folder, $child['uid'], $prop))) {
	            $data[$prop] = true;
	        } else {
	            unset($data[$prop]);
	        }

	    	$response[] = $data;
	    }

	    return $response;
	}

	/**
	 * Get content file location
	 *
	 * @return string|false
	 */
	private function getContentFile() {
		$file = sprintf(
			"%s/data/user-generated/%s.json",
			dirname(__DIR__),
	        $this->contentId
		);

		if (!is_file($file)) {
			$this->responseMsg("Content file not found.", true);
		}

		return $file;
	}

    /**
	 * Get content folder location
	 *
	 * @return string|false
	 */
	private function getContentFolder() {
	    $folder = sprintf(
			"%s/data/user-generated/%s",
			dirname(__DIR__),
			$this->contentId
		);

	    if (!is_dir($folder)) {
	        $this->responseMsg("Content folder not found.", true);
	    }

		return $folder;
	}
	
    /**
	 * Get content structure
	 *
	 * @return array|false
	 */
	private function getContentStructure() {
	    $struct = json_decode(file_get_contents($this->file), true);
    
	    if (json_last_error() !== JSON_ERROR_NONE) {
	        $this->responseMsg("Error parsing content structure.", true);
	    }

	    return $struct;
	}
	
	/**
	 * Response message
	 * 
	 * @param string $message message to output
	 * @param bool $isError should we exit
	 */
	private function responseMsg($message, $isError = false) {
	    echo $message . PHP_EOL;
	    if ($isError) {
    	    exit(1);
	    }
	}
}

if (PHP_SAPI !== 'cli' || !empty($_SERVER['REMOTE_ADDR'])) {
    echo "CLI only." . PHP_EOL;
    exit(1);
}

$arg = getopt('c:');

if (!isset($arg['c']) || $arg['c'] == false) {
    echo "Content id missing. Call with -c some_content_id." . PHP_EOL;
    exit(1);
}

$cSync = new ContentSync($arg['c']);
$cSync->sync();