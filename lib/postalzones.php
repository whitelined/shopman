<?php

namespace Lib;

class PostalZones extends TypicalDataInterface{
	public const schema='shopman';
	public const table='postal_zones';
	public const id=['name'=>'postal_zone_id','type'=>'integer','table'=>self::table];
	public const name=['name'=>'postal_zone_name','type'=>'text','table'=>self::table];
	public const carrierid=['name'=>PostalCarriers::id['name'],'type'=>PostalCarriers::id['type'],'table'=>self::table];

	public function __construct(\PDO $db){
		$this->Init($db,[self::id,PostalCarriers::id,self::name],
			self::id,self::table,self::schema);
	}

	public function CreateTable(){
		$this->sql->StartCreateTable()
			->CreateColumn(self::id,'serial')
			->CreateColumn(self::carrierid,'int')
			->AppendForeignKey(self::carrierid,PostalCarriers::table,PostalCarriers::schema)
			->CreateColumn(self::name,'text')
			->AddUniqueConstraint([PostalCarriers::id,self::name])
			->AddPrimaryKey(self::id)
			->EndTable()
			->GetStatement()
			->execute();
	}
}