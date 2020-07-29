<?php

namespace Lib;

class PostalZones extends TypicalDataInterface{
	public const schema='shopman';
	public const table='postal_zones';
	public const id='postal_zone_id';
	public const name='postal_zone_name';

	public function __construct(\PDO $db){
		$this->Init($db,[
				self::id=>'integer',
				PostalCarriers::id=>'integer',
				self::name=>'text'],
			self::id,self::table,self::schema);
	}

	public function CreateTable(){
		$this->sql->StartCreateTable()
			->CreateColumn(self::id,'serial')
			->CreateColumn(PostalCarriers::id,'int')
			->AppendForeignKey(PostalCarriers::id,PostalCarriers::table,PostalCarriers::schema)
			->CreateColumn(self::name,'text')
			->AddUniqueConstraint([PostalCarriers::id,self::name])
			->AddPrimaryKey(self::id)
			->EndTable()
			->GetStatement()
			->execute();
	}
}