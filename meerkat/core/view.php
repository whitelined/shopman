<?php
/**
 * Part of Meerkat framework system.
 * Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 *
 * Licensed under MIT license. For all information regarding copyright and
 * license, refer to LICENSE.txt. Redistribution of this file must retain
 * copyright and license notes.
 *
 * View.
 *
 * @copyright Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 * @license https://opensource.org/licenses/MIT
 * @package Meerkat
 * @subpackage Core
 */

namespace Meerkat\Core;

/**
 * Provides HTML "view" services.
 */
class View{
	private $viewName;
	private $language;
	private $args=[];
	private $viewFileName;

	/**
	 * Constructor
	 * @param string $name Name of view to load.
	 * @param string $language Language to use (Not implemented yet).
	 */
	public function __construct(string $name,string $language='EN'){
		$this->viewName=$name;
		$this->language=$language;
		$this->viewFileName=\Config\local_views.mb_strtolower($name).'.php';
		if(!file_exists($this->viewFileName))
			throw new \Exception("Unable to locate view $name ({$this->viewFileName})");
	}

	public function __set(string $name, $value){
		$this->args[$name]=$value;
	}

	public function __get(string $name){
		if(!isset($this->args[$name]))
			throw new \Exception("Property/argument $name not set");
		return $this->args[$name];
	}

	/**
	 * Outputs HTML to client
	 */
	public function Display(){
		require($this->viewFileName);
	}

	/**
	 * Runs the template "name" from templates directoy. This is usually called
	 * within a view or another template
	 * @param string $name Teplate name.
	 */
	private function AddTemplate(string $name){
		$tfn=\Config\local_templates. mb_strtolower($name).'.php';
		if(!\file_exists($tfn))
			throw new \Exception("Unable to locate template $name ($tfn)");
		require($tfn);
	}

	protected function LinkResource($category,$name,$secure=true,
		$baseurl=null){
			return (($baseurl)?$baseurl:
				(($secure)?\Config\server_url_sslroot:
				\Config\server_url_root)).
				\Config\server_url_assets.
				$category.'/'.$name;
	}

	protected function CallObject(string $callobject,string $callfunction=null,
		$querystring=null,$secure=true,$baseurl=null){
		//Mmm, ternary
		return (($baseurl)?$baseurl:
			(($secure)?\Config\server_url_sslroot:
			\Config\server_url_root)).
			$callobject.(($callfunction)?"/{$callfunction}":'')
			.(($querystring)?'?'.http_build_query($querystring):'');
	}
}
