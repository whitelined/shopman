<?php

namespace Lib;

class PostalCarriers extends TypicalDataInterface{
	public const schema='shopman';
	public const table='postal_carriers';
	public const id=['name'=>'postal_carrier_id','type'=>'integer','table'=>self::table];
	public const name=['name'=>'postal_carrier_name','type'=>'text','table'=>self::table];
	public const description=['name'=>'description','type'=>'text','table'=>self::table];

	public function __construct(\PDO $db){
		$this->Init($db,[self::id,self::name,self::description],
			self::id,self::table,self::schema);
	}

	public function Get(array $parameters,array $filters,array $order,int $limit=-1,int $offset=-1):array{
		$p=PostalZones::name['name'];
		if(isset($parameters[PostalZones::name['name']])){
			$this->sql->Start()
				->AddTemplate('toJson','array_to_json(array_agg({$C0}))','column')
				->StartSub()
				->Select()
				->Template('toJson',PostalZones::name)
				->From(PostalZones::table,PostalZones::schema)
				->Where()
				->Explicit()
				->Compare(PostalZones::carrierid,'=',self::id)
				->Explicit(false)
				->EndSub()
				->Push('sub');
			unset($parameters[PostalZones::name['name']]);
		}
		else{
			$this->sql->Push('sub');
		}
		$st=$this->sql
			->Select()
			->Column($parameters)
			->Column($this->sql->Define($this->sql->Pop('sub')),PostalZones::name)
			->From()
			->WhereAnd($filters)
			->Order($order)
			->Limit($limit,$offset)
			->GetStatement();
		$st->execute();
		return $st->fetchAll(\PDO::FETCH_ASSOC);
	}

	public function CreateTable(){
		$this->sql->StartCreateTable()
			->CreateColumn(self::id,'serial')
			->CreateColumn(self::name,'text')
			->CreateColumn(self::description,'text')
			->AddUniqueConstraint(self::name)
			->AddPrimaryKey(self::id)
			->EndTable()
			->GetStatement()
			->execute();
	}
}