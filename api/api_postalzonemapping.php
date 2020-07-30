<?php

namespace Api;

use \Meerkat\Core\CommonDataInterface as CDI;
use \Meerkat\Core\ColumnDefinition;
use \Lib\PostalZoneMapping;
use \Lib\Countries;
use Lib\PostalCarriers;
use Lib\PostalZones;

class Api_PostalZoneMapping extends CDI{
	private $pzm;

	public function __construct(PostalZoneMapping $pzm){
		$this->pzm=$pzm;
		$cid=(new ColumnDefinition(Countries::id,true,true))->Type(self::TYPE_INT)->Filterable(['=','!=','IN'],['get']);
		$pzid=(new ColumnDefinition(PostalZones::id,true,true))->Type(self::TYPE_INT)->Filterable(['=','!=','IN'],['get']);
		$pcid=(new ColumnDefinition(PostalCarriers::id,true,true))->Type(self::TYPE_INT)->Filterable(['=','!=','IN'],['get']);
		$name=(new ColumnDefinition(Countries::name,true,true))->Type(self::TYPE_STRING)->Filterable(['LIKE','=','!='],['get']);
		$c2=(new ColumnDefinition(Countries::code2,true,true))->Type(self::TYPE_STRING)->Filterable(['LIKE','=','!='],['get']);
		$c3=(new ColumnDefinition(Countries::code3,true,true))->Type(self::TYPE_STRING)->Filterable(['LIKE','=','!='],['get']);
		$r=(new ColumnDefinition(Countries::region,true,true))->Type(self::TYPE_INT)->Filterable(['='],['get']);
		$this->AddColumnDefinition($cid);
		$this->AddColumnDefinition($pzid);
		$this->AddColumnDefinition($pcid);
		$this->AddColumnDefinition($name);
		$this->AddColumnDefinition($c2);
		$this->AddColumnDefinition($c3);
		$this->AddColumnDefinition($r);
		$this->ReceiveData();
	}

	protected function Get(){
		$d=$this->pzm->Get($this->columns,$this->filters,$this->order,
			$this->limit,$this->offset);
		$this->ReturnData($d,count($d),$this->pzm->Count());
	}

	protected function Update(){
		$v=$this->pzm->Update($this->sets,$this->filters);
		$this->Return(true,$v);
	}

	protected function Delete(){
		$this->Return(true,$this->pzm->Delete($this->filters));
	}

	protected function Insert(){
		$this->Return(true,$this->pzm->Insert($this->columns,$this->values));
	}
}
