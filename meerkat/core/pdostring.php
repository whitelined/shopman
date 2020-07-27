<?php
/**
 * Part of Meerkat framework system.
 * Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 *
 * Licensed under MIT license. For all information regarding copyright and
 * license, refer to LICENSE.txt. Redistribution of this file must retain
 * copyright and license notes.
 *
 * PDO String class.
 *
 * @copyright Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 * @license https://opensource.org/licenses/MIT
 * @package Meerkat
 * @subpackage Core
 */

namespace Meerkat\Core;

class PDOString{
	private $db;
	private $sql;
	private $bindingNextParameter;
	private $bindingValues;
	private $bindingReferences;
	private $definitions;
	private $columnOrder;
	private $columns;
	private $newColumns;
	private $defaultTable;
	private $defaultSchema;
	private $stores;
	private $nextWhere;

	/**
	 * Constructor
	 *
	 * @param PDO $db PDO active database
	 * @param array $definitions Array of column definitions, where key is column name, and value is SQL type
	 */
	public function __construct(\PDO $db,array $definitions,
		string $defaultTable=null,$defaultSchema=null){
		$this->defaultTable=$defaultTable;
		$this->defaultSchema=$defaultSchema;
		$this->db=$db;
		$this->definitions=$definitions;
		$this->Reset();
	}

	private function Append($text,$addSpace=true){
		trim($text);
		if(!$addSpace){
			$this->sql.=$text;
			return;
		}
		if($this->sql==''){
			$this->sql=$text;
		}
		else{
			$this->sql.=' '.$text;
		}
	}

	private function NextBindingParameter($action,$type=''):string{
		return ":pdo_{$action}_{$type}_".$this->bindingNextParameter++;
	}

	private function PrepareBindValue($name,$value,$action):string{
		$blah=$this->definitions[$name];
		if(in_array($this->definitions[$name],['text','character','json','jsonb',
			'time','datetime','date','numeric','real','double precision'])){
			$type=\PDO::PARAM_STR;
			$bv='str';
		}
		else{
			$type=\PDO::PARAM_INT;
			$bv='int';
		}
		$bv=$this->NextBindingParameter($action,$bv);
		$this->bindingValues[$bv]=['type'=>$type,'value'=>$value];
		return $bv;
	}

	private function Bind(\PDOStatement $st){
		foreach($this->bindingValues as $k=>$v){
			$st->bindValue($k,$v['value'],$v['type']);
		}
	}

	private function DefaultOperator($name){
		if($this->definitions[$name]=='text'||$this->definitions[$name]=='character'||
			$this->definitions[$name]=='character varying'){
			return 'LIKE';
		}
		else{
			return '=';
		}
	}

	private function FormatColumn($name,$alias){
		if($alias=='')
			return $name;
		return "{$alias}.{$name}";
	}

	private function FormatOperator($operator){
		if($operator=='LIKE'||$operator=='NOT LIKE'||$operator=='ILIKE'||$operator=='NOT ILIKE'){
			return " {$operator} ";
		}
		return $operator;
	}

	private function FormatWhereClause(string $name,string $alias, array $where):string{
		$n=$this->FormatColumn($name,$alias);
		if($where['comparison']===null){
			return "{$n} IS NULL";
		}
		if(!isset($where['operator'])){
			$o=$this->DefaultOperator($name);
		}
		else{
			$o=$where['operator'];
		}
		if($o=='IN'){
			if(is_array($where['comparison'])){
				$comps=[];
				foreach($where['comparison'] as $v){
					$comps[]=$this->PrepareBindValue($name,$v,'w');
				}
				return "$n IN (".implode(',',$comps).')';
			}
			else{
				return "$n IN (".$this->PrepareBindValue($name,$where['comparison'],'w').')';
			}
		}
		return $name.$this->FormatOperator($o)
			.$this->PrepareBindValue($name,$where['comparison'],'w');
	}

	/**
	 * Formats SQL identifer, adds schema if not null
	 *
	 * @param string $name Identifier
	 * @param string $schema Schema
	 * @param string $alias Alias of identifier
	 * @return string Returns formatted identifier
	 */
	public function FormatIdentifier(string $name='',string $schema='',string $alias=''):string{
		if($schema==''){
			if($this->defaultSchema){
				$s=$this->defaultSchema.'.';
			}
			else{
				$s='';
			}
		}
		else{
			$s=$schema.'.';
		}
		$a='';
		if($alias!=''){
			$a=" {$alias}";
		}
		return $s.(($name=='')?$this->defaultTable:$name).$a;
	}

	/**
	 * Resets the current string and bindings, not the definitions.
	 *
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Reset():PDOString{
		$this->sql='';
		$this->bindingValues=[];
		$this->bindingReferences=[];
		$this->newColumns=[];
		$this->columnOrder=[];
		$this->stores=[];
		$this->columns=[];
		return $this;
	}

	/**
	 * Starts new PDO string, resetting everything.
	 *
	 * @param string $text Optional start of SQL string.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Start(string $text=null):PDOString{
		$this->Reset();
		if($text!==null)
			$this->Append($text);
		return $this;
	}

	/**
	 * Stores currently generated SQL for later use, resets current SQL string - not binding values though!
	 *
	 * @param [type] $name Name to get item.
	 * @return PDOString
	 */
	public function Push($name):PDOString{
		$this->stores[$name]=$this->sql;
		$this->sql='';
		return $this;
	}

	/**
	 * Retrieves named SQL stored, and deletes it specified.
	 *
	 * @param [type] $name Nane of item to get.
	 * @param boolean $keep Set to true if you don't want to delete item.
	 * @return string Stored SQL statement.
	 */
	public function Pop($name,$keep=false):string{
		$s=$this->stores[$name];
		if($keep)
			return $s;
		unset($this->stores[$name]);
		return $s;
	}

	/**
	 * Appends SELECT statement, optionally lists columns after
	 *
	 * @param array $columns
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Select(array $columns=null):PDOString{
		$this->Append('SELECT');
		if($columns!==null)
			$this->Columns($columns);
		return $this;
	}

	/**
	 * Starts sub statement
	 *
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function StartSub():PDOString{
		$this->Append('(',false);
		return $this;
	}

	/**
	 * Ends sub statement
	 *
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function EndSub():PDOString{
		$this->Append(')',false);
		return $this;
	}

	/**
	 * Appends UPDATE statement to table
	 *
	 * @param string $table Table to update.
	 * @param string $schema Schema.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Update(string $table='',string $schema=''):PDOString{
		$this->Append("UPDATE ".$this->FormatIdentifier($table,$schema));
		return $this;
	}

	/**
	 * Appends INSERT statement.
	 *
	 * @param string $table Table to insert into.
	 * @param string $schema Schema.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Insert(string $table='',string $schema=''):PDOString{
		$this->Append("INSERT INTO ".$this->FormatIdentifier($table,$schema));
		return $this;
	}

	/**
	 * Appends DELETE Statement.
	 *
	 * @param string $table Table to delete from.
	 * @param string $schema Schema.s
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Delete(string $table='',string $schema=''):PDOString{
		$this->Append("DELETE FROM ".$this->FormatIdentifier($table,$schema));
		return $this;
	}

	/**
	 * Appends from statement
	 *
	 * @param [type] $table Table from.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function From(string $table='',string $schema='',string $alias=''):PDOString{
		$this->Append('FROM '.$this->FormatIdentifier($table,$schema,$alias));
		return $this;
	}

	/**
	 * Appends SET statement with columns and values
	 *
	 * @param array $set Array where key is column name, value is new value to set.
	 * @return PDOString
	 */
	public function Set(array $set):PDOString{
		$sets=[];
		foreach($set as $k=>$v){
			$sets[]="$k=".$this->PrepareBindValue($k,$v,'u');
		}
		$this->Append("SET ".implode(',',$sets));
		return $this;
	}

	/**
	 * Appends text to sql string.
	 *
	 * @param string $text Text to append.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Text(string $text):PDOString{
		$this->Append($text);
		return $this;
	}

	/**
	 * Starts list of columns.
	 *
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function StartColumns():PDOString{
		$this->columns=[];
		return $this;
	}

	/**
	 * Undocumented function
	 *
	 * @param string $name
	 * @param string $from
	 * @param string $as
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function AddColumn(string $name, string $from=null, string $as=null):PDOString{
		$c='';
		if($from){
			$c.="{$from}.";
		}
		$c.=$name;
		if($as){
			$c.=" as {$as}";
		}
		$this->columns[]=$c;
		return $this;
	}

	/**
	 * Undocumented function
	 *
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function EndColumns():PDOString{
		$this->Append(implode(',',$this->columns));
		return $this;
	}

	/**
	 * Appends list of columns
	 *
	 * @param array $columns Can be a string of one column name or *, or an array of names;
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Columns(array $columns):PDOString{
		$this->Append(implode(',',$columns));
		return $this;
	}

	/**
	 * Appends column to last column definition.
	 *
	 * @param string $name Name of column.
	 * @param string $from table or alias where column is from.
	 * @param string $as column is returned as this.
	 * @return PDOString
	 */
	public function AppendColumn(string $name, string $from='', string $as=''):PDOString{
		$c='';
		if($from!=''){
			$c.="{$from}.";
		}
		$c.=$name;
		if($as!=''){
			$c.=" as {$as}";
		}
		$this->Append(",$c",false);
		return $this;
	}

	/**
	 * Appends list of columns for an insert statement.
	 *
	 * @param array $columns 
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function InsertColumns(array $columns):PDOString{
		$this->Append('('.implode(',',$columns).')');
		$this->columnOrder=$columns;//For insert query.
		return $this;
	}

	/**
	 * Appends one or more rows of values to be inserted
	 *
	 * @param array $values Array containing rows to be inserted.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Values(array $values):PDOString{
		$allRows=[];
		$row=[];
		foreach($values as $v){
			foreach($this->columnOrder as $v2){
				$row[]=$this->PrepareBindValue($v2,$v[$v2],'i');
			}
			$allRows[]='('.implode(',',$row).')';
		}
		$this->Append('VALUES '.implode(',',$allRows));
		return $this;
	}


	public function CompareValue($comparison):PDOString{
		$this->Append($this->FormatWhereClause($this->nextWhere[0],$this->nextWhere[1],$comparison));
		return $this;
	}

	/**
	 * Comparison against column
	 *
	 * @param string $name Name of column.
	 * @param string $alias Optional table alias.
	 * @param string $operator Operator, the default is '='.
	 * @return PDOString
	 */
	public function CompareColumn(string $name,string $alias='',string $operator='='):PDOString{
		$this->Append($this->FormatColumn($this->nextWhere[0],$this->nextWhere[1])
			.$this->FormatOperator($operator)
			.$this->FormatColumn($name,$alias));
		return $this;
	}

	/**
	 * Appends string of a comparison filter
	 *
	 * @param string $name Name of Column to filter.
	 * @param string $alias Optional table alias.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Where(string $name,string $alias=''):PDOString{		
		$this->nextWhere=[$name,$alias];
		$this->Append("WHERE");
		return $this;
	}

	/**
	 * Appends string of where statements, joined by AND
	 *
	 * @param array $where Array where key is column name, and value is array containing 
	 * 'comparison' and optional 'operator'.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function WhereAnd(array $where):PDOString{
		$filters=[];
		foreach($where as $k=>$v){
			$filters[]=$this->FormatWhereClause($k,'',$v);
		}
		if(count($filters)<1)
			return $this;
		$this->Append('WHERE '.implode(' AND ',$filters));
		return $this;
	}

	/**
	 * Appends string of where statements, joined by OR
	 *
	 * @param array $where Array where key is column name, and value is array containing 
	 * 'comparison' and optional 'operator'.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function WhereOr(array $where):PDOString{
		$filters=[];
		foreach($where as $k=>$v){
			$filters[]=$this->FormatWhereClause($k,'',$v);
		}
		if(count($filters)<1)
			return $this;
		$this->Append('WHERE'.implode(' OR ',$filters));
		return $this;
	}

	/**
	 * Appends one or more Order by clauses
	 *
	 * @param array $order Array where key is column, and value is the direction (ASC|DESC)
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Order(array $order):PDOString{
		$orders=[];
		foreach($order as $k=>$v){
			$orders[]="$k $v";
		}
		if(count($orders)<1)
			return $this;
		$this->Append('ORDER BY '.implode(',',$orders));
		return $this;
	}

	/**
	 * Appends limit and offset clauses
	 *
	 * @param integer $limit Limit to number of rows.
	 * @param integer $offset The offset.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Limit(int $limit=-1,int $offset=-1):PDOString{
		if($offset!=-1){
			$this->Append("OFFSET $offset ROWS");
		}
		if($limit!=-1){
			$this->Append("FETCH FIRST $limit ROWS ONLY");
		}
		return $this;
	}

	/**
	 * Starts create table statement.
	 *
	 * @param string $name Table name.
	 * @param string $schema Optional schema.
	 * @param boolean $ifNotExists Add 'IF NOT EXISTS' to suppress warning of table already existing.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function StartCreateTable(string $table='',string $schema='',bool $ifNotExists=true):PDOString{
		$this->newColumns=[];
		$this->Append('CREATE TABLE');
		if($ifNotExists)
			$this->Append('IF NOT EXISTS');
		$this->Append($this->FormatIdentifier($table,$schema).'(');
		return $this;
	}

	/**
	 * Creates new column of type for new table.
	 *
	 * @param string $name Name of column.
	 * @param string $type Type of column.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function CreateColumn(string $name,string $type):PDOString{
		$this->newColumns[]="$name $type";
		return $this;
	}

	/**
	 * Appends foreign key reference to previous new column definition.
	 *
	 * @param string $name Name of column to reference
	 * @param string $table Table to reference
	 * @param string $schema Schema of table to reference.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function AppendForeignKey(string $name,string $table,string $schema):PDOString{
		$k=array_key_last($this->newColumns);
		$this->newColumns[$k].=' REFERENCES '.
			$this->FormatIdentifier($table,$schema) ." ($name)";
		return $this;
	}

	/**
	 * Adds a primary key
	 *
	 * @param string|array $key name, or array of names of primary key.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function AddPrimaryKey($key):PDOString{
		if(is_array($key))
			$this->newColumns[]="PRIMARY KEY (".implode($key).")";
		else
			$this->newColumns[]="PRIMARY KEY ($key)";
		return $this;
	}

	/**
	 * Undocumented function
	 *
	 * @param string|array $columns Name of column, or columns to be unique.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function AddUniqueConstraint($columns):PDOString{
		if(is_array($columns))
			$this->newColumns[]="UNIQUE (".implode(',',$columns).")";
		else
			$this->newColumns[]="UNIQUE ($columns)";
		return $this;
	}

	/**
	 * Ends table, generates related SQL.
	 *
	 * @return PDOString
	 */
	public function EndTable():PDOString{
		$this->Append(implode(',',$this->newColumns));
		$this->Append(')');
		return $this;
	}

	/**
	 * Returns the prepared statement based, including bound values
	 *
	 * @param PDO $db
	 * @return PDOStatement
	 */
	public function GetStatement():\PDOStatement{
		$st=$this->db->prepare($this->sql);
		$this->Bind($st);
		return $st;
	}

	/**
	 * Returns the SQL generated by PDOString
	 *
	 * @return string SQL string.
	 */
	public function GetSQL():string{
		return $this->sql;
	}
}