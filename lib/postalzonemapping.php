<?php
namespace Lib;

use \Meerkat\Core\CommonDataInterface as CDI;

class PostalZoneMapping extends TypicalDataInterface{
	public const schema='shopman';	 
	public const table='postal_zone_mapping';

	public const zoneid=['name'=>PostalZones::id['name'],'type'=>PostalZones::id['type'],'table'=>self::table];
	public const countryid=['name'=>Countries::id['name'],'type'=>Countries::id['type'],'table'=>self::table];
	public const carrierid=['name'=>PostalCarriers::id['name'],'type'=>PostalCarriers::id['type'],'table'=>self::table];

	
	public function __construct(\PDO $db){
		$this->Init($db,[self::zoneid,self::countryid,self::carrierid],
			null,self::table,self::schema);
	}

	public function CreateTable(){
		$this->sql->StartCreateTable()
			->CreateColumn(PostalZones::id,'integer')
			->AppendForeignKey(PostalZones::id,PostalZones::table,PostalZones::schema)
			->CreateColumn(PostalCarriers::id,'integer')
			->AppendForeignKey(PostalCarriers::id,PostalCarriers::table,PostalCarriers::schema)
			->CreateColumn(Countries::id,'integer')
			->AppendForeignKey(Countries::id,Countries::table,Countries::schema)
			->AddUniqueConstraint([Countries::id,PostalCarriers::id])
			->EndTable()
			->GetStatement()
			->execute();
	}

	public function Get(array $parameters,array $filters,array $order,int $limit=-1,int $offset=-1):array{
		$pcid=$filters[self::carrierid['name']];
		unset($filters[self::carrierid['name']]);
		$st=$this->sql->Start()
			->Coalesce(Countries::region,Countries::region,-1)
			->Coalesce(self::zoneid,self::zoneid,-1)
			->Explicit()
			->Select()
			->Column($parameters)
			->From(Countries::table,Countries::schema)
			->LeftJoin(self::table,self::schema)
			->On(Countries::id,'=',self::countryid)
			->And()
			->Compare(self::carrierid,$pcid[1],$pcid[2])
			->Where()
			->WhereAnd($filters)
			->Order($order)
			->Limit($limit,$offset)
			->GetStatement();
		$st->execute();
		return $st->fetchAll(\PDO::FETCH_ASSOC);
	}

	public function Insert(array $parameters,array $values){
		$rowCount=0;
		$st=$this->sql->Start()
			->Insert()
			->InsertColumns($parameters)
			->Values($values)
			->OnConflict([self::countryid,self::carrierid])
			->DoUpdate()
			->SetExcluded(PostalZones::id,PostalZones::id)
			->GetStatement();
		$res=$this->pdoh->ExecuteStatementCatch($st,[23505],$rowCount);
		if($rowCount==0)
			return CDI::QUERY_INSERT_FAIL_DUPLICATE;
		return CDI::QUERY_OK;
	}
}