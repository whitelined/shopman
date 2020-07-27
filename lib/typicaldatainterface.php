<?php 
namespace Lib;
use \Meerkat\Core\CommonDataInterface as CDI;

abstract class TypicalDataInterface{

	protected $db;
	protected $pdoh;
	protected $sql;
	protected $columns;
	protected $tableName;
	protected $schema;
	protected $defaultId;

	public function Init($db,$columns,$defaultId,$tableName,$schema){
		$this->columns=$columns;
		$this->defaultId=$defaultId;
		$this->db=$db;
		$this->tableName=$tableName;
		$this->schema=$schema;
		$this->pdoh=new \Meerkat\Core\PDOHelper($db);
		$this->sql=new \Meerkat\Core\PDOString($db,$this->columns,$tableName,$schema);
	}

	abstract public function CreateTable();

	public function DoesTableExist(){
		return $this->pdoh->CheckTableExists($this->schema,$this->tableName);
	}
	
	public function CheckTableContents(){
		return $this->pdoh->CheckTableColumnTypes($this->schema,$this->tableName,
			$this->columns,true);
	}

	public function Count():int{
		$st=$this->sql->Start()
			->Select(['COUNT(*) as count'])
			->From()
			->GetStatement();
		$st->execute();
		return $st->fetch(\PDO::FETCH_ASSOC)['count'];
	}

	public function CountWhere(array $where):int{
		$st=$this->sql->Start()
			->Select(['COUNT(*) as count'])
			->From()
			->WhereAnd($where)
			->GetStatement();
		$st->execute();
		return $st->fetch(\PDO::FETCH_ASSOC)['count'];
	}

	public function Insert(array $columns,array $values){
		$rowCount=0;
		$st=$this->sql->Start()
			->Insert()
			->InsertColumns($columns)
			->Values($values)
			->GetStatement();
		$res=$this->pdoh->ExecuteStatementCatch($st,[23505],$rowCount);
		if($rowCount==0)
			return CDI::QUERY_INSERT_FAIL_DUPLICATE;
		return CDI::QUERY_OK;
	}

	public function Get(array $columns,array $where,array $order,int $limit=-1,int $offset=-1):array{
		$st=$this->sql->Start()
			->Select($columns)
			->From()
			->WhereAnd($where)
			->Order($order)
			->Limit($limit,$offset)
			->GetStatement();
		$st->execute();
		return $st->fetchAll(\PDO::FETCH_ASSOC);
	}

	public function Update(array $set,array $where){
		$rowCount=0;
		$st=$this->sql->Start()
			->Update()
			->Set($set)
			->Where($this->defaultId,$where[$this->defaultId])
			->GetStatement();
		$this->pdoh->ExecuteStatementCatch($st,[],$rowCount);
		if($rowCount=1)
			return CDI::QUERY_OK;
		return CDI::QUERY_UPDATE_NOTHING_CHANGED;
	}

	public function Delete(array $where){
		$rowCount=0;
		$st=$this->sql->Start()
			->Delete()
			->Where($this->defaultId,$where[$this->defaultId])
			->GetStatement();
		$this->pdoh->ExecuteStatementCatch($st,[],$rowCount);
		if($rowCount=1)
			return CDI::QUERY_OK;
		return CDI::QUERY_UPDATE_NOTHING_CHANGED;
	}
}
