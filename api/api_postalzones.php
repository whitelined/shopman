<?php

namespace Api;

use \Meerkat\Core\CommonDataInterface as CDI;
use \Meerkat\Core\ColumnDefinition;
use Lib\PostalZones;

class Api_PostalZones extends CDI{
	private $pz;

	public function __construct(PostalZones $pz){
		$this->pz=$pz;
		$id=(new ColumnDefinition(PostalZones::id,true,true,false,false))->Type(self::TYPE_INT)->Filterable(['=','!=','IN'],['get','delete','update']);
		$name=(new ColumnDefinition(PostalZones::name,true,true,true,true))->Type(self::TYPE_STRING)->Filterable(['ILIKE','=','!='],['get']);
		$this->AddColumnDefinition($id);
		$this->AddColumnDefinition($name);
		$this->ReceiveData();
	}

	protected function Get(){
		$d=$this->pz->Get($this->columns,$this->filters,$this->order,
			$this->limit,$this->offset);
		$this->ReturnData($d,count($d),$this->pz->CountWhere($this->filters));
	}

	protected function Update(){
		$v=$this->pz->Update($this->sets,$this->filters);
		$this->Return(true,$v);
	}

	protected function Delete(){
		$this->Return(true,$this->pz->Delete($this->filters));
	}

	protected function Insert(){
		$this->Return(true,$this->pz->Insert($this->columns,$this->values));
	}
}
