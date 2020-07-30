<?php
namespace Lib;

use \Meerkat\Core\CommonDataInterface as CDI;

class PostalZoneMapping extends TypicalDataInterface{
	public const schema='shopman';	 
	public const table='postal_zone_mapping';
	
	public function __construct(\PDO $db){
		$this->Init($db,[PostalZones::id=>'integer',Countries::id=>'integer',PostalCarriers::id=>'integer'],
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
			->AddUniqueConstraint([PostalZones::id,Countries::id,PostalCarriers::id])
			->EndTable()
			->GetStatement()
			->execute();
	}

	public function TransformColumns($column){
		if($column==PostalZones::id||$column==PostalCarriers::id)
			return $this->sql->Coalesce($column,$column,-1);
		if($column==Countries::id)
			return 'c.'.Countries::id;
		return $column;
	}

	public function Get(array $columns,array $where,array $order,int $limit=-1,int $offset=-1):array{
		$st=$this->sql->Start()
			->Select()
			->Columns($columns,[$this,'TransformColumns'])
			->From(Countries::table,Countries::schema,'c')
			->LeftJoin(self::table,self::schema,'p')
			->On('c',Countries::id,'=','p')
			->Where()
			->Column(PostalCarriers::id)
			->CompareValue($where[PostalCarriers::id])
			->Or()
			->Column(PostalCarriers::id)
			->CompareNull()
			->Order($order)
			->Limit($limit,$offset)
			->GetStatement();
		$st->execute();
		return $st->fetchAll(\PDO::FETCH_ASSOC);	
	}
}