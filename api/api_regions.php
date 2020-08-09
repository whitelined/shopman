<?php

namespace Api;

use \Meerkat\Core\CommonDataInterface;
use \Lib\Regions;

class Api_Regions extends CommonDataInterface{
	private $regions;

	public function __construct(Regions $regions){
		$this->regions=$regions;
		$this->ReceiveData();
	}

	protected function Get(){
		$this->Parameter(Regions::id)->Parameter(Regions::name)->ParameterNotEmpty();
		$this->Filter(Regions::id)->Filter(Regions::name);
		$this->Sort(Regions::id)->Sort(Regions::name);
		$this->Limit();
		$d=$this->regions->Get($this->parameters,$this->filters,$this->sorts);
		$this->ReturnData($d,count($d),$this->regions->Count());
	}

	protected function Update(){
		$this->Set(Regions::name,true);
		$this->Filter(Regions::id,true);
		$this->Return(true,$this->regions->Update($this->sets,$this->filters));
	}

	protected function Delete(){
		$this->Filter(Regions::id,true);
		$this->Return(true,$this->regions->Delete($this->filters));
	}

	protected function Insert(){
		$this->Return(true,$this->regions->Insert($this->columns,$this->values));
	}
}
