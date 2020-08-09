<?php

namespace Lib;

use \Meerkat\Core\CommonDataInterface as CDI;

class Countries extends TypicalDataInterface{
	public const schema='shopman';
	public const table='countries';
	public const id=['name'=>'country_id','type'=>'integer','table'=>self::table];
	public const name=['name'=>'country_name','type'=>'text','table'=>self::table];
	public const code2=['name'=>'code_2','type'=>'text','table'=>self::table];
	public const code3=['name'=>'code_3','type'=>'text','table'=>self::table];
	public const region=['name'=>'region_id','type'=>'integer','table'=>self::table];
	
	public function __construct(\PDO $db){
		$this->Init($db,[self::id,self::name,self::code2,
			self::code3,self::region,self::id],self::id,self::table,
			self::schema);
	}

	public function Get(array $parameters,array $filters,array $order,int $limit=-1,int $offset=-1):array{
		if(($p=array_search(self::region,$columns))!==false){
			$columns[$p]="COALESCE (".self::region.",-1) as ".self::region;
		}
		$st=$this->sql
			->Start()
			->Select($columns)
			->From()
			->WhereAnd($where)
			->Order($order)
			->Limit($limit,$offset)
			->GetStatement($this->db);
		$st->execute();
		$r=$st->fetchAll(\PDO::FETCH_ASSOC);
		return $r;
	}

	public function CreateTable(){
		$this->sql->StartCreateTable()
			->CreateColumn(self::id,'serial')
			->CreateColumn(self::name,'text')
			->CreateColumn(self::code2,'text')
			->CreateColumn(self::code3,'text')
			->CreateColumn(self::region,'integer')
			->AppendForeignKey(Regions::id,Regions::table,Regions::schema)
			->AddPrimaryKey(self::id)
			->AddUniqueConstraint(self::name)
			->AddUniqueConstraint(self::code2)
			->AddUniqueConstraint(self::code3)
			->EndTable()
			->GetStatement()
			->execute();
	}
}
