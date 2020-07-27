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
		$id=(new ColumnDefinition(PostalCarriers::id,true,true,false,false))->Type(self::TYPE_INT)->Filterable(['=','!=','IN'],['get','delete','update']);
		$name=(new ColumnDefinition(PostalCarriers::name,true,true,true,true))->Type(self::TYPE_STRING)->Filterable(['ILIKE','=','!='],['get']);
		$description=(new ColumnDefinition(PostalCarriers::description,true,true,true,true))->Type(self::TYPE_STRING)->Filterable(['ILIKE','=','!='],['get']);
		$zones=(new ColumnDefinition(PostalZones::name,true,false,false,false))->Type(self::TYPE_STRING);
		$this->AddColumnDefinition($id);
		$this->AddColumnDefinition($name);
		$this->AddColumnDefinition($description);
		$this->AddColumnDefinition($zones);
		$this->ReceiveData();
	}

	protected function Get(){
		$d=$this->pc->Get($this->columns,$this->filters,$this->order,
			$this->limit,$this->offset);
		$this->ReturnData($d,count($d),$this->pc->CountWhere($this->filters));
	}

	protected function Update(){
		$v=$this->pc->Update($this->sets,$this->filters);
		$this->Return(true,$v);
	}

	protected function Delete(){
		$this->Return(true,$this->pc->Delete($this->filters));
	}

	protected function Insert(){
		$this->Return(true,$this->pc->Insert($this->columns,$this->values));
	}
}
