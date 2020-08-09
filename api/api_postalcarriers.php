<?php

namespace Api;

use \Meerkat\Core\CommonDataInterface as CDI;
use \Meerkat\Core\ColumnDefinition;
use Lib\PostalCarriers;
use Lib\PostalZones;

class Api_PostalCarriers extends CDI{
	private $pc;

	public function __construct(PostalCarriers $pc){
		$this->pc=$pc;
		$this->ReceiveData();
	}

	protected function Get(){
		$this->Parameter(PostalCarriers::id)->Parameter(PostalCarriers::name)
			->Parameter(PostalCarriers::description)->Parameter(PostalZones::name)
			->ParameterNotEmpty();

		$this->Filter(PostalCarriers::id)->Filter(PostalCarriers::name)
			->Filter(PostalCarriers::description)->Filter(PostalZones::id);

		$this->Sort(PostalCarriers::id)->Sort(PostalCarriers::name)
			->Sort(PostalCarriers::description)->Sort(PostalZones::id);
		$this->Limit();

		$d=$this->pc->Get($this->parameters,$this->filters,$this->sorts,
			$this->limit,$this->offset);
		$this->ReturnData($d,count($d),$this->pc->CountWhere($this->filters));
	}

	protected function Update(){
		$this->Set(PostalCarriers::name)->Set(PostalCarriers::description)->SetNotEmpty();
		$this->Filter(PostalCarriers::id,true)->FilterNotEmpty();
		$v=$this->pc->Update($this->sets,$this->filters);
		$this->Return(true,$v);
	}

	protected function Delete(){
		$this->Filter(PostalCarriers::id,true,['=','IN']);
		$this->Return(true,$this->pc->Delete($this->filters));
	}

	protected function Insert(){
		$this->Value(PostalCarriers::name,true)->Value(PostalCarriers::description,true)
			->ValidateValues();
		$this->Return(true,$this->pc->Insert($this->inserts,$this->values));
		return;
	}
}
