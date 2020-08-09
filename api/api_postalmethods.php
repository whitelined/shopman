<?php

namespace Api;

use \Meerkat\Core\CommonDataInterface as CDI;
use Lib\PostalCarriers;
use Lib\PostalMethods;

class Api_PostalMethods extends CDI{
	private $pm;

	public function __construct(PostalMethods $pm){
		$this->pm=$pm;
		$this->ReceiveData();
	}

	protected function Get(){
		$this->Parameter(PostalMethods::id)->Parameter(PostalMethods::name)
			->Parameter(PostalCarriers::id)->ParameterNotEmpty();
		$this->Filter(PostalMethods::id)->Filter(PostalMethods::name)
			->Filter(PostalCarriers::id);
		$this->Sort(PostalMethods::id)->Sort(PostalMethods::name)
			->Sort(PostalCarriers::id);
		$this->Limit();
		
		$d=$this->pm->Get($this->parameters,$this->filters,$this->sorts,
			$this->limit,$this->offset);
		$this->ReturnData($d,count($d),$this->pm->CountWhere($this->filters));
	}

	protected function Update(){
		$this->Set(PostalMethods::name,true);
		$this->Filter(PostalMethods::id,true);
		$v=$this->pm->Update($this->sets,$this->filters);
		$this->Return(true,$v);
	}

	protected function Delete(){
		$this->Filter(PostalMethods::id,true);
		$this->Return(true,$this->pm->Delete($this->filters));
	}

	protected function Insert(){
		$this->Value(PostalMethods::name,true)->Value(PostalCarriers::id,true)->ValidateValues();
		$this->Return(true,$this->pm->Insert($this->inserts,$this->values));
	}
}
