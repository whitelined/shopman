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
use Meerkat\Config as CG;

/**
 * Add routes, process requests
 *
 */
class WebApp{
	private $routed=false;
	private $contentType=false;

	public function __construct(){
		$this->contentType=$_SERVER['CONTENT_TYPE']??null;
		$this->method=mb_strtolower(trim($_SERVER['REQUEST_METHOD']));
		$this->url=trim(trim($_SERVER['REQUEST_URI']),'/');
		//The default route is Index
		if($this->url==''||$this->url=='/')
			$this->url='Index';
	}

	public function Get(string $route,callable $run){
		if($this->routed)
			return;
		if($this->method=='get'&&$this->url==$route	){
			$this->routed=true;
			$this->Run($run);
		}
	}

	public function Post(string $route,callable $run){
		if($this->routed)
			return;
		if($this->method=='post'&&$this->url==$route){
			$this->routed=true;
			$this->Run($run);
		}
	}

	public function GetEqual(string $route,callable $run){
		if($this->routed)
			return;
		if($this->method=='GET'&&$currentUrlPartrl==$route){
			$this->Run($run);
		}
	}

	public function PostEqual(string $name,callable $run){
		if($this->routed)
			return;
		if($this->method=='POST'&&$currentUrlPartrl==$name){
			$this->Run($run);
		}
	}

	public function GetMatch(string $name){

	}

	private function Match($name){
		$ss=\preg_split('//u',$name,0,PREG_SPLIT_NO_EMPTY);
		$currentUrlPart=$this->url;
		$matchConstant='';
		$matchFilter='';
		$identifiers=[];
		$filterName=null;
		$hasMatchName=false;
		$args=[];
		$stateConstant=true;//state: in constant
		$stateMatcher=false;//state: in match syntax
		foreach($ss as $k=>$v){
			if($stateConstant){
				if($v=='{'){
					if($matchConstant==''||\mb_strpos($currentUrlPart,$matchConstant)==0){
						$currentUrlPartrl=\mb_substr($currentUrlPartrl,0,mb_strlen($matchConstant));
						$stateConstant=false;
						$stateMatcher=true;
						continue;
					}
					else{
						return false;
					}
				}
				else{
					$matchConstant.=$v;
				}
			}
			if($stateMatcher){
				if($v=='|'){
					if(\mb_strlen($matchIdentifier)<1)
						throw new \Exception("Blank match identifier");
					$identifiers[]=$matchIdentifier;
					$matchIdentifier='';
				}
				else if($v==':'){
					if(mb_strlen($matchIdentifier)<1)
						throw new \Exception("Filter name missing");
					$filterName=$matchFilter;
					$matchFilter='';
				}
				else if($v=='}'){

				}
				else{
					$matchFilter.=$v;
				}
			}
		}
	}

	private function Run(callable $run){
		$this->routed=true;
		try{
			$run();
		}
		catch(\Exception $e){

		}
	}
}
