<?php
namespace Lib;

use \Meerkat\Core\CommonDataInterface as CDI;

class PostalZoneMembers{
	use TypicalDataInterface;
	public const schema='shopman';
	public const table='postal_zone_members';
	
	private $db;
	private $pdoh;
	private $sql;
	private $columns=[self::PostalZones::id=>'integer',Countries::id=>'integer'];

	public function __construct(\PDO $db){
		$this->db=$db;
		$this->pdoh=new \Meerkat\Core\PDOHelper($db);
		$this->sql=new \Meerkat\Core\PDOString($db,$this->columns,self::table,self::schema);
	}

	public function CreateTable(){
		$this->sql->StartCreateTable()
			->CreateColumn(PostalZones::id,'integer')
			->AppendForeignKey(PostalZones::id,PostalZones::table,PostalZones::schema)
			->CreateColumn(Countries::id,'integer')
			->AppendForeignKey(Countries::id,Countries::table,countries::schema)
			->AddUniqueConstraint([PostalZones::id,Countries::id])
			->EndTable()
			->GetStatement()
			->execute();
	}

	public function Get(){
		$st=$this->sql->Start()
			->Select([Countries::id])
	}
}