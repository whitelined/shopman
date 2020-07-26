<?php
/**
 * Part of Meerkat framework system.
 * Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 *
 * Licensed under MIT license. For all information regarding copyright and
 * license, refer to LICENSE.txt. Redistribution of this file must retain
 * copyright and license notes.
 *
 * PDO Helper functions trait
 *
 * @copyright Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 * @license https://opensource.org/licenses/MIT
 * @package Meerkat
 * @subpackage Core
 */

namespace Meerkat\Core;

class PDOHelper{
	private $db;

	/**
	 * PDO Helper
	 *
	 * @param \PDO $db PDO active database
	 */
	public function __construct(\PDO $db)
	{
		$this->db=$db;
	}

	/**
	 * Checks table exists within specified schema
	 * @param  string  $schema Schema name.
	 * @param  string  $table  Table name.
	 * @return bool         Returns true if exists, false otherwise.
	 */
	public function CheckTableExists(string $schema,string $table):bool{
		$sql=<<<SQL
SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname=lower('{$schema}') AND tablename=lower('{$table}')) as exists
SQL;
		$st=$this->db->prepare($sql);
		$st->execute();
		$e=$st->fetch(\PDO::FETCH_ASSOC);
		if($e['exists']==true)
			return true;
		return false;
	}

	/**
	 * Checks table in schema for the columns and types of those columns.
	 * Returns true if all ok, false otherwise.
	 * If verbose is set, echos each error.
	 * @param  string  $schema  Schema name.
	 * @param  string  $table   Table name.
	 * @param  array   $columns Array of columns, where key is column name, and value is type.
	 * @param  bool    $verbose Echo out errors if set to true.
	 * @return bool          Returns true if structure matches, false otherwise.
	 */
	public function CheckTableColumnTypes(string $schema,string $table,
		array $columns,$verbose=true):bool{

		$sql=<<<SQL
		SELECT column_name as name,LOWER(data_type) as type FROM information_schema.columns
			WHERE table_schema='$schema' AND table_name='$table';
		SQL;
		$st=$this->db->prepare($sql);
		$st->execute();
		$c=$st->fetchAll(\PDO::FETCH_ASSOC);
		$checked=0;
		foreach($c as $v){
			if(isset($columns[$v['name']])){
				if($v['type']!=mb_strtolower($columns[$v['name']])){
					if($verbose){
						echo "Column {$v['name']} is type {$v['type']}, should be {$columns[$v['name']]}.\n";
					}
					else{
						$checked++;
					}
				}
			}
			else{
				if($verbose)
					echo "Warning: Additional column found '{$v['name']}' ({$v['type']}).\n";
			}
		}
		if($checked==count($columns)){
			return true;
		}
		return false;
	}

	/**
	 * Executes the supplied statement, returns ok, or error is matched, or throws on exception.
	 *
	 * @param \PDOStatement $statement Statement to execute.
	 * @param array $errors Array of integer errors. Function will return if an exception occurred with one of these errors.
	 * @param mixed $name
	 * @return array Returns false if ok, or array with 'code' and 'message'
	 */
	public function ExecuteStatementCatch(\PDOStatement $statement,array $errors,int &$rowCount):array{
		try{
			$statement->execute();
			$rowCount=$statement->rowCount();
			return ['ok'=>true];
		}
		catch(\PDOException $e){
			if(in_array($e->getCode(),$errors)){
				return ['ok'=>false,'code'=>$e->getCode(),'message'=>$e->getMessage()];
			}
			else{
				throw $e;
			}
		}
	}
}
