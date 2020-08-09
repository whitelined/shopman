<?php

namespace Lib;

class PostalMethods extends TypicalDataInterface{
	public const schema='shopman';
	public const table='postal_methods';
	public const id=['name'=>'postal_method_id','type'=>'integer','table'=>self::table];
	public const name=['name'=>'postal_method_name','type'=>'text','table'=>self::table];
	public const carrierid=['name'=>PostalCarriers::id['name'],'type'=>PostalCarriers::id['type'],'table'=>self::table];

	public function __construct(\PDO $db){
		$this->Init($db,[self::id,PostalCarriers::id,self::name],
			self::id,self::table,self::schema);
	}

	public function CreateTable(){
		$this->sql->StartCreateTable()
			->CreateColumn(self::id,'serial')
			->CreateColumn(self::carrierid)
			->AppendForeignKey(self::carrierid,PostalCarriers::table,PostalCarriers::schema)
			->OnDelete('CASCADE')
			->CreateColumn(self::name)
			->AddUniqueConstraint([PostalCarriers::id,self::name])
			->AddPrimaryKey(self::id)
			->EndTable()
			->GetStatement()
			->execute();
	}
}