<?php

namespace Api;

use Lib\PostalCarriers;
use \Meerkat\Core\CommonDataInterface as CDI;
use \Meerkat\Core\ColumnDefinition;
use Lib\PostalZones;

class Api_PostalZones extends CDI{
	private $pz;

	public function __construct(PostalZones $pz){
		$this->pz=$pz;
		$this->ReceiveData();
	}

	protected function Get(){
		$this->Parameter(PostalZones::id)->Parameter(PostalZones::name)
			->Parameter(PostalCarriers::id)->ParameterNotEmpty();
		$this->Filter(PostalZones::id)->Filter(PostalZones::name)
			->Filter(PostalCarriers::id);
		$this->Sort(PostalZones::id)->Sort(PostalZones::name)
			->Sort(PostalCarriers::id);
		$this->Limit();
		
		$d=$this->pz->Get($this->parameters,$this->filters,$this->sorts,
			$this->limit,$this->offset);
		$this->ReturnData($d,count($d),$this->pz->CountWhere($this->filters));
	}

	protected function Update(){
		$this->Set(PostalZones::name,true);
		$this->Filter(PostalZones::id,true);
		$v=$this->pz->Update($this->sets,$this->filters);
		$this->Return(true,$v);
	}

	protected function Delete(){
		$this->Filter(PostalZones::id,true);
		$this->Return(true,$this->pz->Delete($this->filters));
	}

	protected function Insert(){
		$this->Value(PostalZones::name,true)->Value(PostalCarriers::id,true)->ValidateValues();
		$this->Return(true,$this->pz->Insert($this->inserts,$this->values));
	}
}
