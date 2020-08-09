<?php

abstract class CommonDataInterface{
	private $transforms=[];
	/**
	 * Adds a callback that transform data 
	 *
	 * @param array $definition Definition, where, if matches, callback is called.
	 * @param array $where Where to transform data, array values one or more of 'set','insert' or'filter'
	 * @param callable $callback Function that takes value as parameter, and returns transformed value.
	 * @return void
	 */
	protected function AddTransformData(array $definition,array $where,$callback){
		$this->transforms[]=[$definition,$where,$callback];
	}
}


class Api_PostalZoneMapping extends CommonDataInterface{
	private $pzm;

	public function __construct($pzm){
		$this->pzm=$pzm;
		$this->AddTransformData(['blah'],['filter'],[$this,'TransformId']);
		$this->AddTransformData(['blah2'],['filter'],[$this,'TransformId']);
	}

	private function TransformId($data){
		if($data==-1)
			return null;
		return $data;
	}
}

$p=new Api_PostalZoneMapping('not relevant for test');