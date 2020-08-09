<?php

namespace Lib;
use \Meerkat\Core\CommonDataInterface as CDI;

class Regions extends TypicalDataInterface{
	public const schema='shopman';
	public const table='regions';
	public const id=['name'=>'region_id','type'=>'integer','table'=>self::table];
	public const name=['name'=>'name','type'=>'text','table'=>self::table];

	public function __construct(\PDO $db){
		$this->Init($db,[self::id,self::name],self::id,
			self::table,self::schema);
	}

	public function CreateTable(){
		$this->sql->StartCreateTable(self::table,self::schema)
			->CreateColumn(self::id,'serial')
			->CreateColumn(self::name,'text')
			->AddPrimaryKey(self::id)
			->AddUniqueConstraint(self::name)
			->EndTable()
			->GetStatement()
			->execute();
	}
}