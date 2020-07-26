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
	private $newColumns;
	private $defaultTable;
	private $defaultSchema;

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

	private function Append($text){
		trim($text);
		if($this->sql==''){
			$this->sql=$text;
		}
		else{
			$this->sql.=' '.$text;
		}
	}

	private function FormatOperator($operator){
		if($operator=='LIKE'||$operator=='NOT LIKE'){
			return " {$operator} ";
		}
		return $operator;
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

	private function FormatWhereClause(string $name,array $where):string{
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
				return "$name IN (".implode(',',$comps).')';
			}
			else{
				return "$name IN (".$this->PrepareBindValue($name,$where['comparison'],'w').')';
			}
		}
		return $name.$this->FormatOperator($o)
			.$this->PrepareBindValue($name,$where['comparison'],'w');
	}

	/**
	 * Formats SQL identifer, adds schema if not null
	 *
	 * @param [type] $name Identifier
	 * @param [type] $schema Schema
	 * @return string
	 */
	private function FormatIdentifier($name,$schema):string{
		if(!$schema){
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
		return $s.((!$name)?$this->defaultTable:$name);
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
		$this->bindingNextParameter=1;
		$this->newColumns=[];
		$this->columnOrder=[];
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
	 * Appends UPDATE statement to table
	 *
	 * @param string $table Table to update.
	 * @param string $schema Schema.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Update(string $table=null,string $schema=null):PDOString{
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
	public function Insert(string $table=null,string $schema=null):PDOString{
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
	public function Delete(string $table=null,string $schema=null):PDOString{
		$this->Append("DELETE FROM ".$this->FormatIdentifier($table,$schema));
		return $this;
	}

	/**
	 * Appends from statement
	 *
	 * @param [type] $table Table from.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function From($table=null,$schema=null):PDOString{
		$this->Append('FROM '.$this->FormatIdentifier($table,$schema));
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

	/**
	 * Appends string of a comparison filter
	 *
	 * @param string $name Name of Column to filter.
	 * @param array $where Array containing 'comparison' and optional 'operator'.
	 * @param boolean $prefix
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Where(string $name,array $where):PDOString{

		$this->Append('WHERE '.$this->FormatWhereClause($name,$where));
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

			$filters[]=$this->FormatWhereClause($k,$v);
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

			$filters[]=$this->FormatWhereClause($k,$v);
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
	public function StartCreateTable(string $table=null,string $schema=null,bool $ifNotExists=true):PDOString{
		$this->newColumns=[];
		$this->Append('CREATE TABLE');
		if($ifNotExists)
			$this->Append('IF NOT EXISTS');
		$this->Append($this->FormatIdentifier($table,$schema).'(');
		return $this;
	}

	/**
	 * Adds new column of type
	 *
	 * @param string $name Name of column.
	 * @param string $type Type of column.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function AddColumn(string $name,string $type):PDOString{
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