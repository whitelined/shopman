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

use AppendIterator;
use Lib\Regions;

class PDOString{
	private $db;
	private $sql;
	private $bindingNextParameter=20;
	private $bindingValues;
	private $definitions;
	private $defaultTable;
	private $defaultSchema;
	private $stores;
	private $tableAliases=[];
	private $previousAction;
	private $templates=[];
	private $explicitIdentifiers=false;
	private $coalesce=[];
	private $columnOrder=[];
	private $startWhere=false;

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
		$this->definitions=[];
		$this->addDefinitions($definitions);
		$this->Reset();
	}

	private function addDefinitions($definitions){
		foreach($definitions as $v){
			$this->definitions[$v['name']]=$v;
		}
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

	private function IsColumnDefinition($column){
		if(isset($column['name'],$column['type'],$column['table']))
			return true;
		return false;
	}

	private function DiscernType($column,&$value){
		if(is_array($column)){
			return $column['type'];
		}
		else if(is_string($column)&&isset($this->definitions[$column])){
			return $this->definitions[$column]['type'];
		}
		else{
			if(is_array($value)){
				return 'array';
			}
			else if(is_string($value)){
				return 'text';
			}
			return 'integer';
		}
	}

	private function NextBindingParameter($action,$type=''):string{
		return ":pdo_{$action}_{$type}_".$this->bindingNextParameter++;
	}

	private function PrepareBindArray($value,$column){
	}

	private function PrepareBindValue($column,$value,$action):string{
		$type=$this->DiscernType($column,$value);
		if(in_array($type,['smallint','integer','bigint','decimal','numeric','real','double precision'])){
			$type=\PDO::PARAM_INT;
			$bv='int';
		}
		else if($type=='array'){
			//to be implemented.
		}
		else{
			$type=\PDO::PARAM_STR;
			$bv='str';
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

	private function GetTableAlias($column){
		if(isset($this->tableAliases[$column['table']]))
			return $this->tableAliases[$column['table']];
		return $column['table'];
	}

	private function FormatColumn($column,$coalesce=false){
		if($coalesce&&isset($this->coalesce[$column['name']])){
			$c=[];
			foreach($this->coalesce[$column['name']] as $v){
				if($this->IsColumnDefinition($v)){
					if($this->explicitIdentifiers&&$v['table']!='')
						$c[]=$this->GetTableAlias($v).".{$v['name']}";
					else
						$c[]=$v['name'];
				}
				else{
					$c[]=$v;
				}
			}
			return 'COALESCE ('.implode(',',$c).') AS '.$column['name'];
		}
		if($this->explicitIdentifiers&&$column['table']!=''){
			$e=$this->GetTableAlias($column).'.';
		}
		else{
			$e='';
		}
		return $e.$column['name'];
	}

	private function FormatOperator($operator){
		if($operator=='LIKE'||$operator=='NOT LIKE'||$operator=='ILIKE'||$operator=='NOT ILIKE'||
			$operator=='IN'||$operator=='NOT IN'){
			return " {$operator} ";
		}
		return $operator;
	}

	private function FormatCompare($column,$operator,$value){
		$c=$this->FormatColumn($column);
		if($this->IsColumnDefinition($value)){
			//possible danger in value equaling a column definition.
			//||(is_string($value)&&isset($this->definitions[$value]))){
			return $c.$this->FormatOperator($operator).$this->FormatColumn($value);
		}
		if($value===null){
			if($operator=='!=')
				$c.=" IS NOT NULL";
			else
				$c.=" IS NULL";
		}
		else{
			$c.=$this->FormatOperator($operator);
			if($operator=='IN'||$operator=='NOT IN'){
				if(is_array($value)){
					$comps=[];
					foreach($value as $v){
						$comps[]=$this->PrepareBindValue($column,$v,'c');
					}
					$c.="(".implode(',',$comps).')';
				}
				else{
					$c.="(".$this->PrepareBindValue($column,$value,'c').')';
				}
			}
			else{
				$c.=$this->PrepareBindValue($column,$value,'c');
			}
		}
		return $c;
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
		$this->previousAction='';
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
	 * Adds a template string
	 *
	 * @param string $name Name of template.
	 * @param string $template Template string, where parameters listed as {$V0} {$C0}
	 * where V is value, C is column.
	 * @param string $type text, column
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function AddTemplate(string $name, string $template,string $type='text'):PDOString{
		preg_match_all('/(\{\$([CV]){1}([0-9]|[1-9][0-9])\})/',$template,$matches);
		$templateList=[];
		$t=$template;
		foreach($matches[1] as $k=>$v){
			$s=explode($v,$t);
			if(mb_strlen($s[0])>0)
				$templateList[]=$s[0];
			$templateList[]=['type'=>$matches[2][$k],'parameter'=>$matches[3][$k]];
			$t=$s[1];
		}
		if(mb_strlen($t)>0)
			$templateList[]=$t;
		$this->templates[$name]=['list'=>$templateList,'type'=>$type];
		return $this;
	}

	/**
	 * Runs template
	 *
	 * @param [type] $name Name of template to run
	 * @param [type] ...$parameters Parameters for template.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Template($name,...$parameters):PDOString{
		if(!$this->templates[$name])
			return $this;
		if($this->templates[$name]['type']=='column'){
			if($this->previousAction=='column')
				$this->Append(',',false);
			$this->previousAction='column';
		}
		foreach($this->templates[$name]['list'] as $v){
			if(is_string($v)){
				$this->Append($v);
			}
			else{
				if($v['type']=='C'){
					$this->Append($this->FormatColumn($parameters[$v['parameter']]));
				}
				else if ($v['type']=='V'){

				}
			}
		}
		return $this;
	}

	/**
	 * Defines a column
	 *
	 * @param [type] $name Name of column
	 * @param [type] $type Type
	 * @param [type] $table Table column exists
	 * @return array
	 */
	public function Define($name,$type='',$table=''):array{
		return ['name'=>$name,'type'=>$type,'table'=>$table];
	}

	/**
	 * Adds a definiton for coalesce 
	 *
	 * @param array ...$as Takes all function parameters. Quote strings in ''.
	 * @return string Returns formatted coalesce operation.
	 */
	public function Coalesce($column,...$parameters):PDOString{
		$this->coalesce[$column['name']]=$parameters;
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
	 * Turns on/off explicit column naming
	 *
	 * @param boolean $on True for on, false off.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Explicit(bool $on=true):PDOString{
		if($on)
			$this->explicitIdentifiers=true;
		else
			$this->explicitIdentifiers=false;
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
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Select():PDOString{
		$this->previousAction='select';
		$this->Append('SELECT');
		return $this;
	}

	/**
	 * Starts sub statement
	 *
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function StartSub():PDOString{
		$this->previousAction='openSub';
		$this->Append('(',false);
		return $this;
	}

	/**
	 * Ends sub statement
	 *
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function EndSub():PDOString{
		$this->previousAction='closeSub';
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
		$this->previousAction='tablename';
		$this->Append('UPDATE '.$this->FormatIdentifier($table,$schema));
		return $this;
	}

	/**
	 * Appends Insert statement
	 *
	 * @param string $table Table to insert to, blank for default
	 * @param string $schema Schema of table
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Insert(string $table='',string $schema=''):PDOString{
		$this->Append('INSERT INTO '.$this->FormatIdentifier($table,$schema));
		return $this;
	}

	/**
	 * Appends list of columns for an insert statement.
	 *
	 * @param array $columns 
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function InsertColumns(array $columns):PDOString{
		$this->previousAction='insertColumn';
		if($this->IsColumnDefinition($columns)){
			$columns=[$columns];
		}
		foreach($columns as $v){
			$this->columnOrder[]=$v['name'];
		}
		$this->Append('('.implode(',',$this->columnOrder).')');
		return $this;
	}


	/**
	 * Appends ON CONFLICT for insert statements.
	 *
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function OnConflict($columns):PDOString{
		$this->previousAction='onConflict';
		if($this->IsColumnDefinition($columns))
			$columns=[$columns];
		$c=[];
		foreach($columns as $v){
			$c[]=$v['name'];
		}
		$this->Append('ON CONFLICT ('.implode(',',$c).')');
		return $this;
	}

	/**
	 * Appends DO NOTHING for insert conflict.
	 *
	 * @return PDOString
	 */
	public function DoNothing():PDOString{
		$this->previousAction='doNothing';
		$this->Append('DO NOTHING');
		return $this;
	}

	/**
	 * Appends DO UPDATE SET for insert conflict.
	 *
	 * @return PDOString
	 */
	public function DoUpdate():PDOString{
		$this->previousAction='doUpdate';
		$this->Append('DO UPDATE');
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
		$this->previousAction='tablename';
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
		$this->previousAction='tablename';
		$this->Append('FROM '.$this->FormatIdentifier($table,$schema,$alias));
		return $this;
	}

	public function LeftJoin(string $table,string $schema){
		$this->previousAction='tablename';
		$this->Append('LEFT JOIN '.$this->FormatIdentifier($table,$schema));
		return $this;
	}

	public function On($column1,$operator,$column2=''){
		$this->previousAction='on';
		$this->Append('ON '.$this->FormatColumn($column1).$operator.$this->FormatColumn($column2));
		return $this;
	}

	/**
	 * Appends SET statement with columns and values
	 *
	 * @param array $set Array where key is column name, value is new value to set.
	 * @return PDOString
	 */
	public function Set(array $set):PDOString{
		if($this->previousAction=='set')
			$this->Append(',',false);
		else{
			$this->Append('SET ');
		}
		$this->previousAction='set';
		$sets=[];
		foreach($set as $k=>$v){
			$sets[]="{$k}=".$this->PrepareBindValue($v[0],$v[1],'u');
		}
		$this->Append(implode(',',$sets));
		return $this;
	}

	/**
	 * Appends SET statement for EXCLUDED column
	 *
	 * @param [type] $column
	 * @param [type] $excluded
	 * @return PDOString
	 */
	public function SetExcluded($column,$excluded):PDOString{
		if($this->previousAction=='set')
			$this->Append(',',false);
		else{
			$this->Append('SET ');
		}
		$this->previousAction='set';
		$this->Append("{$column['name']}=EXCLUDED.{$excluded['name']}");
		return $this;
	}

	/**
	 * Appends text to sql string.
	 *
	 * @param string $text Text to append.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Text(string $text):PDOString{
		$this->previousAction='text';
		$this->Append($text);
		return $this;
	}

	/**
	 * Appends column
	 *
	 * @return PDOString
	 */
	public function Column($column, $as=''):PDOString{
		if($column=='')
			return $this;
		if($this->previousAction=='column')
			$this->Append(',',false);
		$this->previousAction='column';
		if($this->IsColumnDefinition($column)){
			$this->Append($this->FormatColumn($column,true));
			if($as!='')
				if($this->IsColumnDefinition($as)){
					$as=$as['name'];
				}
				$this->Append(" AS {$as}");
		}
		else{
			$c=[];
			foreach($column as $v){
				$c[]=$this->FormatColumn($v,true);
			}
			$this->Append(implode(',',$c));
		}
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
		foreach($values as $v){
			$row=[];
			foreach($this->columnOrder as $v2){
				$row[]=$this->PrepareBindValue($v2,$v[$v2],'i');
			}
			$allRows[]='('.implode(',',$row).')';
		}
		if($this->previousAction=='insertValues')
			$this->Append(','.implode(',',$allRows));
		else
			$this->Append('VALUES '.implode(',',$allRows));
		$this->previousAction='insertValues';
		return $this;
	}

	public function Compare($column,$operator,$value):PDOString{
		if($this->startWhere){
			$this->Append("WHERE");
			$this->startWhere=false;
		}
		$this->previousAction='compare';
		$this->Append($this->FormatCompare($column,$operator,$value));
		return $this;
	}

	/**
	 * Adds OR
	 *
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Or():PDOString{
		$this->previousAction='or';
		$this->Append('OR');
		return $this;
	}

	/**
	 * Adds AND
	 *
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function And():PDOString{
		$this->previousAction='and';
		$this->Append('AND');
		return $this;
	}


	/**
	 * Appends string of a comparison filter
	 *
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Where():PDOString{
		if($this->previousAction=='where')
			return $this;
		$this->previousAction='where';
		$this->startWhere=true;
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
		if($this->startWhere&&count($where)>0){
			$this->Append("WHERE");
			$this->startWhere=false;
		}
		$this->previousAction='compare';
		$filters=[];
		foreach($where as $k=>$v){
			$filters[]=$this->FormatCompare($v[0],$v[1],$v[2]);
		}
		if(count($filters)<1)
			return $this;
		$this->Append(implode(' AND ',$filters));
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
		if($this->startWhere&&count($where)>0){
			$this->Append("WHERE");
			$this->startWhere=false;
		}
		$this->previousAction='compare';
		$filters=[];
		foreach($where as $k=>$v){
			$filters[]=$this->FormatCompare($v[0],$v[1],$v[2]);
		}
		if(count($filters)<1)
			return $this;
		$this->Append(implode(' OR ',$filters));
		return $this;
	}

	/**
	 * Appends one or more Order by clauses
	 *
	 * @param array $order Array where key is column, and value is the direction (ASC|DESC)
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function Order(array $order):PDOString{
		$this->previousAction='order';
		$orders=[];
		foreach($order as $k=>$v){
			$orders[]="{$v[0]} {$v[1]}";
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
		$this->previousAction='createTable';
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
	 * @param array $name Column definition.
	 * @param string $type Type of column if different to definition, e.g. serial instead of integer.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function CreateColumn(array $name,string $type=''):PDOString{
		if($type=='')
			$type=$name['type'];
		$this->previousAction='createTableColumn';
		$this->newColumns[]="{$name['name']} $type";
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
	public function AppendForeignKey(array $name,string $table,string $schema):PDOString{
		$this->previousAction='createTableForeignKey';
		$k=array_key_last($this->newColumns);
		$this->newColumns[$k].=' REFERENCES '.
			$this->FormatIdentifier($table,$schema) ." ({$name['name']})";
		return $this;
	}

	/**
	 * Appends on delete to last foreign key definition.
	 *
	 * @param string $action Name or action to take, CASCADE, NO ACTION, RESTRICT, SET NULL, SET DEFAULT
	 * @return PDOString
	 */
	public function OnDelete(string $action):PDOString{
		if($this->previousAction=='createTableForeignKey'){
			$k=array_key_last($this->newColumns);
			$this->newColumns[$k].=" ON DELETE {$action}";
		}
		return $this;
	}

	/**
	 * Appends on delete to last foreign key definition.
	 *
	 * @param string $action Name or action to take, CASCADE, NO ACTION, RESTRICT, SET NULL, SET DEFAULT
	 * @return PDOString
	 */
	public function OnUpdate(string $action):PDOString{
		if($this->previousAction=='createTableForeignKey'){
			$k=array_key_last($this->newColumns);
			$this->newColumns[$k].=" ON UPDATE {$action}";
		}
		return $this;
	}


	/**
	 * Adds a primary key
	 *
	 * @param array $key column, or array of columns of primary key.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function AddPrimaryKey($key):PDOString{
		$this->previousAction='createTablePrimaryKey';
		if(!$this->IsColumnDefinition($key)){
			$c=[];
			foreach($key as $v){
				$c[]=$v['name'];
			}
			$this->newColumns[]="PRIMARY KEY (".implode($c).")";
		}
		else
			$this->newColumns[]="PRIMARY KEY ({$key['name']})";
		return $this;
	}

	/**
	 * Undocumented function
	 *
	 * @param string|array $columns Name of column, or columns to be unique.
	 * @return PDOString Returns reference to called object, for chaining.
	 */
	public function AddUniqueConstraint($columns):PDOString{
		$this->previousAction='createTableUnique';
		if(!$this->IsColumnDefinition($columns)){
			$c=[];
			foreach($columns as $v){
				$c[]=$v['name'];
			}
			$this->newColumns[]="UNIQUE (".implode(',',$c).")";
		}
		else
			$this->newColumns[]="UNIQUE ({$columns['name']})";
		return $this;
	}

	/**
	 * Ends table, generates related SQL.
	 *
	 * @return PDOString
	 */
	public function EndTable():PDOString{
		$this->previousAction='createTableEnd';
		$this->Append(implode(',',$this->newColumns));
		$this->Append(')');
		return $this;
	}

	/**
	 * Creates statement, executes, returns statement.
	 *
	 * @return \PDOStatement
	 */
	public function Execute():\PDOStatement{
		$st=$this->GetStatement();
		$st->execute();
		return $st;
	}

	/**
	 * Returns the prepared statement based, including bound values
	 *
	 * @param PDO $db
	 * @return PDOStatement
	 */
	public function GetStatement():\PDOStatement{
		file_put_contents(\Config\local_sql_dump,$this->sql."\n",FILE_APPEND);
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
		file_put_contents(\Config\local_sql_dump,$this->sql."\n",FILE_APPEND);
		return $this->sql;
	}
}