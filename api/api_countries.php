<?php

namespace Api;

use \Meerkat\Core\CommonDataInterface as CDI;
use \Meerkat\Core\ColumnDefinition;
use \Lib\Countries;

class Api_Countries extends CDI{
	private $country;

	public function __construct(Countries $country){
		$this->country=$country;
		$id=(new ColumnDefinition(Countries::id,true,true,false,false))->Type(self::TYPE_INT)->Filterable(['=','!=','IN'],['get','delete','update']);
		$name=(new ColumnDefinition(Countries::name,true,true,true,true))->Type(self::TYPE_STRING)->Filterable(['ILIKE','=','!='],['get']);
		$c2=(new ColumnDefinition(Countries::code2,true,true,true,true))->Type(self::TYPE_STRING)->Filterable(['ILIKE','=','!='],['get']);
		$c3=(new ColumnDefinition(Countries::code3,true,true,true,true))->Type(self::TYPE_STRING)->Filterable(['ILIKE','=','!='],['get']);
		$r=(new ColumnDefinition(Countries::region,true,true,true,true))->Type(self::TYPE_INT)->Filterable(['='],['get'])->AddDataTransformer(
			function($data){
				if($data==-1)
					return null;
				return $data;
			});
		$this->AddColumnDefinition($id);
		$this->AddColumnDefinition($name);
		$this->AddColumnDefinition($c2);
		$this->AddColumnDefinition($c3);
		$this->AddColumnDefinition($r);
		$this->ReceiveData();
	}

	protected function Get(){
		$d=$this->country->Get($this->columns,$this->filters,$this->order,
			$this->limit,$this->offset);
		$this->ReturnData($d,count($d),$this->country->Count());
	}

	protected function Update(){
		$v=$this->country->Update($this->sets,$this->filters);
		$this->Return(true,$v);
	}

	protected function Delete(){
		$this->Return(true,$this->country->Delete($this->filters));
	}

	protected function Insert(){
		$this->Return(true,$this->country->Insert($this->columns,$this->values));
	}
}
