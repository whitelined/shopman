<?php

namespace Lib;

class PostalCarriers extends TypicalDataInterface{
	public const schema='shopman';
	public const table='postal_carriers';
	public const id='postal_carrier_id';
	public const name='postal_carrier_name';
	public const description='description';

	public function __construct(\PDO $db){
		$this->Init($db,[
				self::id=>'integer',
				self::name=>'text',
				self::description=>'text'],
			self::id,self::table,self::schema);
	}

	public function Get(array $columns,array $where,array $order,int $limit=-1,int $offset=-1):array{
		$key=array_search(PostalZones::name,$columns);
		if($key!==false){
			$this->sql->Start()->StartSub()
				->Select(['array_to_json(array_agg('.PostalZones::name.'))'])
				->From(PostalZones::table,PostalZones::schema,'p')
				->Where(self::id,'p')
				->CompareColumn(self::id,'c')
				->EndSub()
				->Push('sub');
			array_splice($columns,$key,1);
		}
		$st=$this->sql
			->Select($columns)
			->AppendColumn($this->sql->Pop('sub'),'',PostalZones::name)
			->From('','','c')
			->WhereAnd($where)
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