<?php

namespace Lib;
use \Meerkat\Core\CommonDataInterface as CDI;

class Regions extends TypicalDataInterface{
	public const schema='shopman';
	public const table='regions';
	public const id='region_id';
	public const name='name';

	public function __construct(\PDO $db){
		$this->Init($db,[self::id=>'int',self::name=>'text'],self::id,
			self::table,self::schema);
	}

	public function CreateTable(){
		$this->sql->StartCreateTable(self::table,self::schema)
			->AddColumn(self::id,'serial')
			->AddColumn(self::name,'text')
			->AddPrimaryKey(self::id)
			->AddUniqueConstraint(self::name)
			->EndTable()
			->GetStatement()
			->execute();
	}
}