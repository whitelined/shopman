<?php

namespace Lib;

class PostalZones extends TypicalDataInterface{
	public const schema='shopman';
	public const table='postal_zones';
	public const id='postal_zones_id';
	public const name='postal_zones_name';
	public const description='description';

	public function __construct(\PDO $db){
		$this->Init($db,[
				self::id=>'integer',
				PostalZones::id=>'integer',
				self::name=>'text',
				self::description=>'text'],
			self::id,self::table,self::schema);
	}

	public function CreateTable(){
		$this->sql->StartCreateTable()
			->CreateColumn(self::id,'serial')
			->CreateColumn(PostalCarriers::id,'int')
			->AppendForeignKey(PostalCarriers::id,PostalCarriers::table,PostalCarriers::schema)
			->CreateColumn(self::name,'text')
			->CreateColumn(self::description,'text')
			->AddUniqueConstraint(self::name)
			->AddPrimaryKey(self::id)
			->EndTable()
			->GetStatement()
			->execute();
	}
}