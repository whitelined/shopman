<?php

namespace Api;

use \Meerkat\Core\CommonDataInterface;
use \Meerkat\Core\ColumnDefinition;
use \Lib\Regions;

class Api_Regions extends CommonDataInterface{
	private $country;

	public function __construct(Regions $regions){
		$this->regions=$regions;
		$id=(new ColumnDefinition(Regions::id,true,true,false,false))->Type(self::TYPE_INT)->Filterable(['=','!=','IN'],['delete','update','get']);
		$name=(new ColumnDefinition(Regions::name,true,true,true,true))->Type(self::TYPE_STRING)->Filterable(['LIKE','=','!='],['get']);
		$this->AddColumnDefinition($id);
		$this->AddColumnDefinition($name);
		$this->ReceiveData();
	}

	protected function Get(){
		$d=$this->regions->Get($this->columns,$this->filters,$this->order);
		$this->ReturnData($d,count($d),$this->regions->Count());
	}

	protected function Update(){
		$this->Return(true,$this->regions->Update($this->sets,$this->filters));
	}

	protected function Delete(){
		$this->Return(true,$this->regions->Delete($this->filters));
	}

	protected function Insert(){
		$this->Return(true,$this->regions->Insert($this->columns,$this->values));
	}
}
