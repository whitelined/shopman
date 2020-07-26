<?php
/**
 * Part of Meerkat framework system.
 * Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 *
 * Licensed under MIT license. For all information regarding copyright and
 * license, refer to LICENSE.txt. Redistribution of this file must retain
 * copyright and license notes.
 *
 * WebApp, main control process.
 *
 * @copyright Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 * @license https://opensource.org/licenses/MIT
 * @package Meerkat
 * @subpackage Core
 */

namespace Meerkat\Core;
/**
 * Class for creating and holding unique variables/objects to minimise globals
 */
class Manifest{
	private static $manifestObjects=[];
	private static $allowOverwrite=false;

	/**
	 * Add an item to the Manifest
	 * @param string   $name    Name of item in Manifest
	 * @param callable $creator Function that returns value of item to be stored in Manifest
	 */
	public static function AddManifestItem(string $name, callable $creator){
		if(!self::$allowOverwrite&&isset(self::$manifestObjects[$name]))
			throw new \Exception("Can\'t overwrite Manifest item $name.");
		self::$manifestObjects[$name]=['called'=>false,'value'=>null,
			'creator'=>$creator];
	}

	/**
	 * Returns item from Manifest, creating it if not been requested yet.
	 * @param string $name Name of item in Manifest
	 * @return mixed Returns value
	 */
	public static function GetManifestItem(string $name){
		if(!self::$manifestObjects[$name])
			throw new Exception("$name is not in Manifest.");
		if(!self::$manifestObjects[$name]['called']){
			self::$manifestObjects[$name]['value']=
				self::$manifestObjects[$name]['creator']();
			self::$manifestObjects[$name]['called']=true;
		}
		return self::$manifestObjects[$name]['value'];
	}

	/**
	 * Forces Manifest to overwrite or create item value
	 * @param string $name Name of item in Manifest
	 */
	public static function ForceManifestItemValue(string $name){
		if(!self::$manifestObjects[$name])
			throw new Exception("$name is not in Manifest.");
		self::$manifestObjects[$name]['value']=
			self::$manifestObjects[$name]['creator']();
		self::$manifestObjects[$name]['called']=true;
	}
}
