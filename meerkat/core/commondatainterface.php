<?php
/**
 * Part of Meerkat framework system.
 * Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 *
 * Licensed under MIT license. For all information regarding copyright and
 * license, refer to LICENSE.txt. Redistribution of this file must retain
 * copyright and license notes.
 *
 * Common data interface.
 *
 * @copyright Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 * @license https://opensource.org/licenses/MIT
 * @package Meerkat
 * @subpackage Core
 */
namespace Meerkat\Core;

abstract class CommonDataInterface{
	const SORT_ASC='ASC';
	const SORT_DESC='DESC';
	const TYPE_ANY=0;
	const TYPE_INT=1;
	const TYPE_DECIMAL=2;
	const TYPE_NUMBER=3;
	const TYPE_STRING=4;
	const TYPE_ARRAY=5;
	const TYPE_PARSER=7;

	const ERROR_CLIENT_INVALID_REQUEST_TYPE=1;
	const ERROR_CLIENT_MALFORMED_JSON=2;
	const ERROR_CLIENT_MISSING_REQUEST_TYPE=3;
	const ERROR_CLIENT_FILTER_NOT_DEFINED=4;
	const ERROR_CLIENT_INCORRECT_DATA_TYPE=5;
	const ERROR_CLIENT_SORT_DIRECTION=6;
	const ERROR_CLIENT_INVALID_WHERE_OPERATOR=7;
	const ERROR_CLIENT_ORDER_NOT_DEFINED=8;
	const ERROR_CLIENT_COLUMNS_NOT_DEFINED=9;
	const ERROR_CLIENT_SET_NOT_DEFINED=10;
	const ERROR_CLIENT_VALUES_NOT_DEFINED=11;
	const ERROR_SERVER_EMPTY_WHERE_OPERATORS=1001;
	const ERROR_SERVER_UPDATE_NOT_PERFORMED=1002;

	const QUERY_OK=0;
	const QUERY_INSERT_FAIL_DUPLICATE=1;
	const QUERY_UPDATE_NOTHING_CHANGED=2;
	const QUERY_DELETE_NOTHING_DELETE=3;

	private $contentType=null;
	private $data=null;

	protected $action=null;
	protected $sets;
	protected $definitions=[];
	protected $order=[];
	protected $limit=-1;
	protected $offset=-1;
	protected $filters=[];
	protected $columns;
	protected $values;


	private function SetContentType(){
		header('Content-Type: application/json');
	}

	/**
	 * Checks data against column type. If operator is present, detects if array is for 'IN'
	 * @param  string $name     Name of column
	 * @param  mixed  $data     Data to check against
	 * @param  string $operator Optional operator, to check special cases.
	 * @return bool             Returns true if ok, false otherwise.
	 */
	private function CheckType(string $name,&$data,string $operator=null):bool{
		if($operator=='IN'&&is_array($data)){
			foreach($data as $v){
				if(!$this->CheckType($name,$v))
					return false;
			}
			return true;
		}
		switch($this->definitions[$name]->type){
			case self::TYPE_ANY:
				return true;
			case self::TYPE_INT:
				if(filter_var($data,FILTER_VALIDATE_INT)===false){
					return false;
				}
				return true;
			case self::TYPE_NUMBER:
			case self::TYPE_DECIMAL:
				if(is_numeric($data)){
					return true;
				}
				return false;
			case self::TYPE_STRING:
				if(is_string($data)){
					return true;
				}
				return false;
			case self::TYPE_ARRAY:
				if(is_array($data)){
					return true;
				}
				return false;
			case self::TYPE_PARSER:
				if($this->definitions[$name]->parser($data)){
					return true;
				}
				return false;
		}
	}

	private function CheckComparisonOperator(string $op,array $list):bool{
		if(in_array($op,$list))
			return true;
		return false;
	}

	private function ProcessGet(){
		$this->Columns();
		$this->Where();
		$this->Order();
		$this->Limit();
		$this->Get();
	}

	private function ProcessUpdate(){
		$this->Set();
		$this->Where();
		$this->Limit();
		$this->Update();
	}

	private function ProcessInsert(){
		$this->Columns();
		$this->Values();
		$this->Insert();
	}

	private function ProcessDelete(){
		$this->Where();
		$this->Delete();
	}

	protected function Return(bool $ok=true,int $queryStatus=self::QUERY_OK){
		echo json_encode(['ok'=>$ok,'queryResponseCode'=>$queryStatus]);
	}

	protected function ReturnData($data,$size,$totalSize=null){
		if($totalSize!==null)
			$r=['totalSize'=>$totalSize];
		else
			$r=[];
		$r['ok']=true;
		$r['queryResponseCode']=self::QUERY_OK;
		$r['size']=$size;
		$r['data']=$data;
		echo json_encode($r);
	}

	/**
	 * Returns an error, and throws CommonDataInterfaceError to stop further execution of data interface.
	 *
	 * @param int $code Code of error.
	 * @param string $text Text describing error in more detail.
	 * @return void
	 * @throws CommonDataInterfaceError Error containing code and text.
	 */
	protected function ReturnError(int $code,string $text){
		echo json_encode(['ok'=>false,'code'=>$code,'text'=>$text,'sent'=>$this->data]);
		throw new CommonDataInterfaceError($text,$code);
	}
	
	protected function AddColumnDefinition(ColumnDefinition $cd){
		$this->definitions[$cd->name]=$cd;
	}

	protected function ReceiveData(){
		$this->SetContentType();
		$this->contentType=$_SERVER['CONTENT_TYPE']??null;
		if($this->contentType!='application/json'){
			$this->ReturnError(self::ERROR_CLIENT_INVALID_REQUEST_TYPE,'Content-type not application/json');
			return false;
		}
		$d=file_get_contents("php://input");
		if(($this->data=json_decode($d,true))===false){
			$this->ReturnError(self::ERROR_CLIENT_MALFORMED_JSON,'Unable to decode JSON');
			return false;
		}
		if(!isset($this->data['action'])){
			$this->ReturnError(self::ERROR_CLIENT_MISSING_REQUEST_TYPE,'requestType not set');
			return false;
		}
		$this->action=$this->data['action'];
		switch($this->action){
			case 'get':
				$this->ProcessGet();
				break;
			case 'update':
				$this->ProcessUpdate();
				break;
			case 'insert':
				$this->ProcessInsert();
				break;
			case 'delete':
				$this->ProcessDelete();
				break;
		}
		return true;
	}

	/**
	 * Checks set definitions
	 *
	 * @return void
	 */
	protected function Set(){
		$this->sets=[];
		if(!isset($this->data['set'])||count($this->data['set'])<1){
			$this->ReturnError(self::ERROR_CLIENT_SET_NOT_DEFINED,
				"Set not defined for action '{$this->action}'.");
		}
		foreach($this->data['set'] as $k=>$v){
			if($this->CheckType($k,$v)){
				$this->sets[$k]=$v;
			}
			else{
				$this->ReturnError(self::ERROR_CLIENT_SET_NOT_DEFINED,
					"Incompatible type for '$k'.");
			}
		}
	}

	/**
	 * Checks columns against list that can be used in request
	 */
	protected function Columns(){
		$this->columns=[];
		switch($this->action){
			case 'get':
				$p='selectable';
				break;
			case 'update':
				$p='updatable';
				break;
			case 'insert':
				$p='insertable';
				break;
		}
		if(!isset($this->data['columns'])&&!is_array($this->data['columns'])){
				$this->ReturnError(self::ERROR_CLIENT_COLUMNS_NOT_DEFINED,
				"Columns not set or is not a string or not an array.");
			}
		if(count($this->data['columns'])==1&&$this->data['columns'][0]=='*'){
			foreach($this->definitions as $v){
				if($v->{$p}){
					$this->columns[]=$v->name;
				}
			}
		}
		else{
			foreach($this->data['columns'] as $v){
				if(!isset($this->definitions[$v])){
					$this->ReturnError(self::ERROR_CLIENT_COLUMNS_NOT_DEFINED,
						"'$v' column not defined.");
				}
				if($this->definitions[$v]->{$p}){
					$this->columns[]=$v;
				}
				else{
					$this->ReturnError(self::ERROR_CLIENT_COLUMNS_NOT_DEFINED,
						"Column '$v' does not support action '{$this->action}'.");
				}
			}
		}
	}

	/**
	 * Checks values for insert request.
	 *
	 * @return void
	 */
	protected function Values(){
		$rows=[];
		if(!isset($this->data['values'])||!is_array($this->data['values'])){
			$this->ReturnError(self::ERROR_CLIENT_VALUES_NOT_DEFINED,
				"'values' not defined or not array.");
		}
		foreach($this->data['values'] as $v){
			foreach($v as $k2=>$v2){
				if(!in_array($k2,$this->columns)){
					$this->ReturnError(self::ERROR_CLIENT_VALUES_NOT_DEFINED,
						"Value '{$k2}' not defined in column.");
				}
				if(!$this->CheckType($k2,$v[$k2])){
					$this->ReturnError(self::ERROR_CLIENT_VALUES_NOT_DEFINED,
					"Value for '{$k2}' not valid.");
				}
			}
			$rows[]=$v;
		}
		$this->values=$rows;
	}

	/**
	 * Checks ordering requests match allowed order columns.
	 */
	protected function Order(){
		if(!isset($this->data['order']))
			return;
		foreach($this->data['order'] as $v){
			if(!isset($v['by'],$v['direction'])&&$v['direction']!=self::SORT_ASC&&
				$v['direction']!=self::SORT_DESC){
				$this->ReturnError(self::ERROR_CLIENT_ORDER_NOT_DEFINED,
					"'by' and/or 'direction' not defined in array, or 'direction' ill-defined.");
			}
			if(isset($this->definitions[$v['by']])&&
				$this->definitions[$v['by']]->orderable){
				$this->order[$v['by']]=$v['direction'];
			}
			else{
				$this->ReturnError(self::ERROR_CLIENT_ORDER_NOT_DEFINED,
					"Invalid column to order by '{$v['by']}'");
			}
		}
		unset($this->data['order']);
	}

	/**
	 * Checks for any required or optional where clauses, and validates them.
	 */
	protected function Where(){
		if(isset($this->data['filters'])&&is_array($this->data['filters'])){
			foreach($this->data['filters'] as $k=>$v){
				if($this->definitions[$k]->filterRestrictions&&
					!in_array($this->action,$this->definitions[$k]->filterRestrictions)){
					$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,
						"'$k' filter not allowed for this action '{$this->action}'.");
				}
				if(isset($this->definitions[$k])&&
					$this->definitions[$k]->filterable){
					if(isset($v['operator'])){
						if(!$this->CheckComparisonOperator($v['operator'],
							$this->definitions[$k]->operators)){
							$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,
								"Invalid operator {$v['operator']} for '$k'.");
						}
						if(!$this->CheckType($k,$v['comparison'],$v['operator'])){
							$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,
								"Comparison incompatible with column type.");
						}
						$this->filters[$k]=$v;
					}
				}
				else{
					$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,
					"Filter '$k' not defined, or not filterable.");
				}
			}
		}
	}

	protected function Limit(){
		if(isset($this->data['limit'])&&is_int($this->data['limit'])){
			$this->limit=$this->data['limit'];
		}
		else{
			$this->limit=-1;
		}
		if(isset($this->data['offset'])&&is_int($this->data['offset'])){
			$this->offset=$this->data['offset'];
		}
		else{
			$this->offset=-1;
		}
	}

	abstract protected function Get();
	abstract protected function Update();
	abstract protected function Delete();
	abstract protected function Insert();
}
