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
			->Select()
			->Column($this->sql->Define('COUNT(*)'),'count')
			->From()
			->GetStatement();
		$st->execute();
		return $st->fetch(\PDO::FETCH_ASSOC)['count'];
	}

	public function CountWhere(array $filters):int{
		$st=$this->sql->Start()
			->Select()
			->Column($this->sql->Define('COUNT(*)'),'count')
			->From()
			->Where()
			->WhereAnd($filters)
			->GetStatement();
		$st->execute();
		return $st->fetch(\PDO::FETCH_ASSOC)['count'];
	}

	public function Insert(array $parameters,array $values){
		$rowCount=0;
		$st=$this->sql->Start()
			->Insert()
			->InsertColumns($parameters)
			->Values($values)
			->GetStatement();
		$res=$this->pdoh->ExecuteStatementCatch($st,[23505],$rowCount);
		if($rowCount==0)
			return CDI::QUERY_INSERT_FAIL_DUPLICATE;
		return CDI::QUERY_OK;
	}

	public function Get(array $parameters,array $filters,array $order,int $limit=-1,int $offset=-1):array{
		$st=$this->sql->Start()
			->Select()
			->Column($parameters)
			->From()
			->Where()
			->WhereAnd($filters)
			->Order($order)
			->Limit($limit,$offset)
			->GetStatement();
		$st->execute();
		return $st->fetchAll(\PDO::FETCH_ASSOC);
	}

	public function Update(array $set,array $filters){
		$rowCount=0;
		$st=$this->sql->Start()
			->Update()
			->Set($set)
			->Where()
			->Compare($this->defaultId,$filters[$this->defaultId['name']][1],$filters[$this->defaultId['name']][2])
			->GetStatement();
		$this->pdoh->ExecuteStatementCatch($st,[],$rowCount);
		if($rowCount=1)
			return CDI::QUERY_OK;
		return CDI::QUERY_UPDATE_NOTHING_CHANGED;
	}

	public function Delete(array $filters){
		$rowCount=0;
		$st=$this->sql->Start()
			->Delete()
			->Where()
			->Compare($this->defaultId,$filters[$this->defaultId['name']][1],$filters[$this->defaultId['name']][2])
			->GetStatement();
		$this->pdoh->ExecuteStatementCatch($st,[],$rowCount);
		if($rowCount=1)
			return CDI::QUERY_OK;
		return CDI::QUERY_UPDATE_NOTHING_CHANGED;
	}
}
