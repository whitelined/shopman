<?php

namespace Lib;

use \Meerkat\Core\CommonDataInterface as CDI;

class Postage{
	use TypicalDataInterface;
	public const schema='shopman';
	public const table='postage';
	public const id='postage_id';
	public const name='postage_name';
	public const description='description';
	
	private $db;
	private $pdoh;
	private $sql;
	private $columns=[self::id=>'integer',self::name=>'text',self::description=>'text'];

	public function __construct(\PDO $db){
		$this->db=$db;
		$this->pdoh=new \Meerkat\Core\PDOHelper($db);
		$this->sql=new \Meerkat\Core\PDOString($db,$this->columns,self::table,self::schema);
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

	public function Update(array $set,array $filters):int{
		$st=$this->sql->Start()
			->Update()
			->Set($set)
			->Where(self::id,$where)
			->Limit(1)
			->GetStatement();
		$this->pdoh->ExecuteStatementCatch($st,[],$rowCount);
		if($rowCount!=1)
			return CDI::QUERY_UPDATE_NOTHING_CHANGED;
		return CDI::QUERY_OK;
	}

	public function Delete(array $filters):int{
		$st=$this->sql->Start()
			->Delete()
			->Where(self::id,$where)
			->Limit(1)
			->GetStatement();
			$this->pdoh->ExecuteStatementCatch($st,[],$rowCount);
		if($rowCount!=1)
			return CDI::QUERY_UPDATE_NOTHING_CHANGED;
		return CDI::QUERY_OK;
	}
}