#!/usr/bin/php
<?php

/**
 * Content manipulation
 */
class Content {
	private
	    $contentId,
	    $file,
	    $folder
	;

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
	    
	    $structure['content']   = $this->syncContent($structure['content']);
	    $structure['favorites'] = $this->syncFavorites($structure['favorites']);
	    $structure['timestamp'] = time();
	    
	    // backup current
	    @copy($this->file, sprintf("%s.%s", $this->file, $structure['timestamp']));
	    
	    // write new structure
	    file_put_contents($this->file, json_encode($structure));
	    
	    return $this->responseMsg("Content structure synced.");
	}

	/**
	 * Boost volume on all available audio files
	 */
	public function volume() {
	    $structure = $this->getContentStructure();

	    $this->volumeBoost($structure['content']);

	    return $this->responseMsg("Audio volume boosing done.");
	}

	/**
	 * Iterate content and sync image/audio relations
	 *
	 * @param array $content content branch
	 * @return false|array
	 */
	private function syncContent($content) {
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
	    		$data['children'] = $this->syncContent($child['children']);
	    	} else {
	    		unset($data['children']);
	    	}

			$response[] = $data;
	    }

	    return $response;
	}

	/**
	 * Sync valid favorites data
	 *
	 * @param array $favorites favorites
	 * @return false|array
	 */
	private function syncFavorites($favorites) {
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
	 * Iterate content, boost audio volume on each file
	 *
	 * @param array $content content branch
	 * @return false|array
	 */
	private function volumeBoost($content) {
	    if (!is_array($content)) {
	        return;
	    }

	    $decFile = sprintf("%s/encoded.audio", $this->folder);
	    $mp3File = sprintf("%s/processed.mp3", $this->folder);

	    foreach ($content as $child) {
	        $audio = sprintf("%s/%s.audio", $this->folder, $child['uid']);

            if (is_file($audio)) {
                $rsp = [];

                // write decoded file
                file_put_contents($decFile, base64_decode(explode(',', file_get_contents($audio))[1]));

                // boost volume, transcode to mp3 format
                exec(sprintf(
                    "ffmpeg -v 0 -y -i %s -af 'volume=5' %s",
                    //"ffmpeg -y -i %s -af 'volume=5' %s",
                    $decFile,
                    $mp3File
                ), $rsp, $rspCode);

                if ($rspCode == true) {
                    $this->responseMsg(sprintf(
                        "Audio for '%s', cannot be processed.",
                        $child['label']
                    ));

                    continue;
                }

                // encode processed audio
                file_put_contents(
                    $audio,
                    'data:audio/mpeg;base64,'
                    . base64_encode(file_get_contents($mp3File))
                );
            }

            if (!empty($child['children'])) {
                $this->volumeBoost($child['children']);
            }
        }

        // remove temp files
        @unlink($decFile);
        @unlink($mp3File);
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

// CLI only
if (PHP_SAPI !== 'cli' || !empty($_SERVER['REMOTE_ADDR'])) {
    echo "CLI only." . PHP_EOL;
    exit(1);
}

// setup arguments
$arg = getopt('a:c:');
$act = ['vol', 'sync'];

// check action
if (
    !isset($arg['a'])
    || $arg['a'] == false
    || !in_array($arg['a'], $act)
) {
    echo sprintf(
        "Action not specified/supported. Call with -a [%s]",
        implode('|', $act)
    ) . PHP_EOL;
    exit(1);
}

// check content id
if (!isset($arg['c']) || $arg['c'] == false) {
    echo "Content id missing. Call with -c some_content_id." . PHP_EOL;
    exit(1);
}

$cnt = new Content($arg['c']);

switch ($arg['a']) {
    case 'sync' :
        $cnt->sync();
    break;

    case 'vol' :
        $cnt->volume();
    break;
}
