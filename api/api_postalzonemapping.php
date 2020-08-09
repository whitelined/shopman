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
		$this->AddTransformData(Countries::region,['filter'],[$this,'TransformId']);
		$this->AddTransformData(PostalZones::id,['filter'],[$this,'TransformId']);
		$this->ReceiveData();
	}

	protected function TransformId($data){
		if($data==-1)
			return null;
		return $data;
	}

	protected function Get(){
		$this->Parameter(Countries::id)->Parameter(PostalZoneMapping::zoneid)->Parameter(PostalZoneMapping::carrierid)
			->Parameter(Countries::name)->Parameter(Countries::code2)->Parameter(Countries::code3)
			->Parameter(Countries::region);
		
		$this->Filter(Countries::id)->Filter(PostalZoneMapping::zoneid)->Filter(PostalZoneMapping::carrierid)
			->Filter(Countries::name)->Filter(Countries::code2)->Filter(Countries::code3)
			->Filter(Countries::region);

		$this->Sort(Countries::id)->Sort(PostalZoneMapping::zoneid)->Sort(PostalZoneMapping::carrierid)
			->Sort(Countries::name)->Sort(Countries::code2)->Sort(Countries::code3)
			->Sort(Countries::region);
		$this->Limit();

		$d=$this->pzm->Get($this->parameters,$this->filters,$this->sorts,
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
		$this->Value(PostalZoneMapping::countryid,true)
			->Value(PostalZoneMapping::zoneid,true)
			->Value(PostalZoneMapping::carrierid,true)
			->ValidateValues();
		$this->Return(true,$this->pzm->Insert($this->inserts,$this->values));
	}
}
