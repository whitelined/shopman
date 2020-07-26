<?php

namespace Lib;

use \Meerkat\Core\CommonDataInterface as CDI;

class Countries extends TypicalDataInterface{
	public const schema='shopman';
	public const table='countries';
	public const id='country_id';
	public const name='country_name';
	public const code2='code_2';
	public const code3='code_3';
	public const region='region_id';
	
	public function __construct(\PDO $db){
		$this->Init($db,[self::id=>'integer',self::name=>'text',self::code2=>'text',
			self::code3=>'text',self::region=>'integer'],self::id,self::table,
			self::schema);
	}

	public function Get(array $columns,array $where,array $order,int $limit=-1,int $offset=-1):array{
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
			->AddColumn(self::id,'serial')
			->AddColumn(self::name,'text')
			->AddColumn(self::code2,'text')
			->AddColumn(self::code3,'text')
			->AddColumn(self::region,'integer')
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
