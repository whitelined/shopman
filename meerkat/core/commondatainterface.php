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

use Lib\Countries;

abstract class CommonDataInterface{
	const SORT_ASC='ASC';
	const SORT_DESC='DESC';
	const TYPE_ANY=0;
	const TYPE_INTEGER='integer';
	const TYPE_DECIMAL='decimal';
	const TYPE_TEXT='text';

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
	const ERROR_CLIENT_LIMIT_NOT_DEFINED=12;
	const ERROR_CLIENT_PARAMETER_NOT_REQUIRED=12;
	const ERROR_SERVER_EMPTY_WHERE_OPERATORS=1001;
	const ERROR_SERVER_UPDATE_NOT_PERFORMED=1002;

	const QUERY_OK=0;
	const QUERY_INSERT_FAIL_DUPLICATE=1;
	const QUERY_UPDATE_NOTHING_CHANGED=2;
	const QUERY_DELETE_NOTHING_DELETE=3;

	private $contentType=null;
	private $data=null;

	protected $action=null;
	protected $transforms=[];
	protected $sets=[];
	protected $parameters=[];
	protected $filters=[];
	protected $sorts=[];
	protected $inserts=[];
	protected $values=[];
	protected $insertDefinitions=[];
	protected $limit=-1;
	protected $offset=-1;


	private function SetContentType(){
		header('Content-Type: application/json');
	}

	/**
	 * Checks data against column type. If operator is present, detects if array is for 'IN'
	 * @param array $definition Definition containing 'name','type','source'
	 * @param  mixed  $value     Data to check against
	 * @param  string $operator Optional operator, to check special cases.
	 * @return bool             Returns true if ok, false otherwise.
	 */
	private function CheckType($definition,$value,$operator=''):bool{
		if($operator=='IN'||$operator=='NOT IN'){
			if(is_array($value)){
				foreach($value as $v){
					if(is_array($v)||!$this->CheckType($definition,$v)){
						return false;
					}
				}
				return true;
			}
			else
			{
				return false;
			}
		}
		if($value==null){
			return true;
		}
		switch($definition['type']){
			case self::TYPE_TEXT:
				if(is_string($value))
					return true;
				return false;
			case self::TYPE_INTEGER:
				if(filter_var($value,FILTER_VALIDATE_INT)!==false)
					return true;
				return false;
			case self::TYPE_DECIMAL:
				if(is_numeric($value))
					return true;
				return false;
		}		
		return false;
	}

	private function TransformData($definition,$action,$value){
		foreach($this->transforms as $v){
			if($v[0]==$definition){
				if(!in_array($action,$v[1]))
					return $value;
				return $v[2]($value);
			}
		}
		return $value;
	}

	/**
	 * Adds a callback that transform data 
	 *
	 * @param array $definition Definition, where, if matches, callback is called.
	 * @param array $where Where to transform data, array values one or more of 'set','insert' or 'filter'
	 * @param callable $callback Function that takes value as parameter, and returns transformed value.
	 * @return void
	 */
	protected function AddTransformData(array $definition,array $where,$callback){
		$this->transforms[]=[$definition,$where,$callback];
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
				$this->Get();
				break;
			case 'update':
				$this->Update();
				break;
			case 'insert':
				$this->Insert();
				break;
			case 'delete':
				$this->Delete();
				break;
		}
		return true;
	}

	private function CheckFilter($definition,$filter,$operators){		
		if(count($filter)!=3){
			$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,"Filter not defined correctly.");
		}
		if($filter[0]!=$definition['name'])
			return false;
		if(count($operators)>0&&!in_array($filter[1],$operators)){
			$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,
				"Operator '{$filter[1]}' not allowed for filter {$definition['name']}");
		}
		if(!$this->CheckType($definition,$filter[2],$filter[1])){
			$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,
				"Filter (type: {$definition['type']}) {$definition['name']} has incompatible data format.");
		}
		return true;
	}

	private function CheckSort($definition,$sort){
		if(count($sort)!=2){
			$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,
				"Sort not defined correctly.");
		}
		if($sort[1]!=self::SORT_ASC&&$sort[1]!=self::SORT_DESC){
			$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,
				"Sort not defined correctly.");
		}
		if($sort[0]==$definition['name'])
			return true;
		return false;
	}

	/**
	 * Checks parameter isn't empty - has at least one entry.
	 *
	 * @return CommonDataInterface Returns this for chaining.
	 */
	protected function ParameterNotEmpty():CommonDataInterface{
		if(count($this->parameters)<1)
			$this->ReturnError(self::ERROR_CLIENT_PARAMETER_NOT_REQUIRED,
			"No parameters defined, required.");
		return $this;
	}

	/**
	 * Checks for requested parameter
	 *
	 * @param array $definition Definition containing 'name','type','source'
	 * @param boolean $isRequired Set to true if it's required.
	 * @return CommonDataInterface Returns this for chaining.
	 */
	protected function Parameter(array $definition,bool $isRequired=false):CommonDataInterface{
		if(!isset($this->data['parameters'])){
			$this->ReturnError(self::ERROR_CLIENT_PARAMETER_NOT_REQUIRED,
				"No parameters not defined, required.");
		}
		if(is_string($this->data['parameters'])&&$this->data['parameters']=='*'){
			$this->parameters[$definition['name']]=$definition;
		}
		else if(is_array($this->data['parameters'])){
			foreach($this->data['parameters'] as $k=>$v){
				if($v==$definition['name']){
					$this->parameters[$definition['name']]=$definition;
					unset($this->data['parameters'][$k]);
					return $this;
				}
			}
			if($isRequired){
				$this->ReturnError(self::ERROR_CLIENT_PARAMETER_NOT_REQUIRED,
					"Parameter {$definition['name']} not found in request");
			}
		}
		else{
			$this->ReturnError(self::ERROR_CLIENT_PARAMETER_NOT_REQUIRED,
				"Parameters defined as unknown data type.");
		}
		return $this;
	}

	/**
	 * Checks set isn't empty.
	 *
	 * @return CommonDataInterface Returns this for chaining.
	 */
	protected function SetNotEmpty():CommonDataInterface{
		if(count($this->sets)<1){
			$this->ReturnError(self::ERROR_CLIENT_SET_NOT_DEFINED,
				"No sets defined, required.");
		}
		return $this;
	}

	/**
	 * Checks for requested parameter
	 *
	 * @param array $definition Definition containing 'name','type','source'
	 * @param boolean $isRequired Set to true if it's required.
	 * @return CommonDataInterface Returns this for chaining.
	 */
	protected function Set(array $definition,$isRequired=false):CommonDataInterface{
		if(!isset($this->data['set'])&&$isRequired){
			$this->ReturnError(self::ERROR_CLIENT_SET_NOT_DEFINED,
				"No sets defined at all, required.");
		}
		if(isset($this->data['set'])){
			foreach($this->data['set'] as $k=>$v){
				if(count($v)!=2){
					$this->ReturnError(self::ERROR_CLIENT_SET_NOT_DEFINED,
					"Set not defined correctly.");
				}
				if($v[0]==$definition['name']){
					if($this->CheckType($definition,$v[1])){
						$v[1]=$this->TransformData($definition,'set',$v[1]);
						$this->sets[$definition['name']]=[$definition,$v[1]];
						unset($this->data['set']);
						return $this;
					}
				}
			}
			if($isRequired){
				$this->ReturnError(self::ERROR_CLIENT_SET_NOT_DEFINED,
					"Set {$definition['name']} not defined, required.");
			}
		}
		return $this;
	}

	/**
	 * Checks filter isn't empty - has at least one entry.
	 *
	 * @return CommonDataInterface Returns this for chaining.
	 */
	protected function FilterNotEmpty():CommonDataInterface{
		if(count($this->filters)<1)
			$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,
			"No filters defined, required.");
		return $this;
	}

	/**
	 * Checks for filter
	 *
	 * @param array $definition Definition containing 'name','type','source'
	 * @param boolean $isRequired Set to true if it's required.
	 * @param array $operators Optional set of allowed operators 
	 * @return CommonDataInterface Returns this for chaining.
	 */
	protected function Filter(array $definition,bool $isRequired=false,array $operators=[]):CommonDataInterface{
		if(!isset($this->data['filters'])&&$isRequired){
			$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,
				"No filters defined at all.");
		}
		if(isset($this->data['filters'])){
			foreach($this->data['filters'] as $k=>$v){
				if($this->CheckFilter($definition,$v,$operators)){
					$v[2]=$this->TransformData($definition,'filter',$v[2]);
					$this->filters[$definition['name']]=[$definition,$v[1],$v[2]];
					unset($this->data['filters'][$k]);
					return $this;
				}
			}
		}
		else{
			if($isRequired){
				$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,
					"Filter {$definition['name']} is missing.");
			}
		}
		return $this;
	}

	/**
	 * Checks for sorting
	 *
	 * @param array $definition Definition containing 'name','type','source'
	 * @param boolean $isRequired Set to true if it's required.
	 * @return CommonDataInterface Returns this for chaining.
	 */
	protected function Sort(array $definition,bool $isRequired=false):CommonDataInterface{
		if(isset($this->data['sort'])){
			if(is_array($this->data['sort'])){
				foreach($this->data['sort'] as $k=>$v){
					if($this->CheckSort($definition,$v)){
						$this->sorts[$definition['name']]=$v;
						unset($this->data['sort'][$k]);
						return $this;
					}
				}
				if($isRequired){
					$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,
					"Sort {$definition['name']} not defined, required.");
				}
			}
			else{
				$this->ReturnError(self::ERROR_CLIENT_FILTER_NOT_DEFINED,
					"Sort not defined correctly, should be an array.");
			}
		}
		return $this;
	}

	/**
	 * Adds a value definition
	 *
	 * @param array $definition Column definition.
	 * @param boolean $isRequired Is this value required.
	 * @return CommonDataInterface Returns this for chaining.
	 */
	protected function Value(array $definition,$isRequired=false):CommonDataInterface{
		$this->insertDefinitions[$definition['name']]=[$definition,$isRequired];
		return $this;
	}

	/**
	 * Undocumented function
	 *
	 * @return CommonDataInterface Returns this for chaining.
	 */
	protected function ValidateValues():CommonDataInterface{
		if(!isset($this->data['values'])){
			$this->ReturnError(self::ERROR_CLIENT_VALUES_NOT_DEFINED,
				"Values not defined.");
		}
		foreach($this->data['values'] as $v){
			foreach($this->insertDefinitions as $v2){
				if(isset($v[$v2[0]['name']])){
					if(!$this->CheckType($v2[0],$v[$v2[0]['name']])){
						$this->ReturnError(self::ERROR_CLIENT_VALUES_NOT_DEFINED,
							"Invalid data type ({$v2[0]['type']}) for {$v2[0]['name']}.");
					}
				}
				else{
					if($v2[1])
						$this->ReturnError(self::ERROR_CLIENT_VALUES_NOT_DEFINED,
							"Values {$v2[0]['name']} not defined, required.");
				}
			}
			foreach($v as $k2=>$v2){
				if(!isset($this->insertDefinitions[$k2])){
					$this->ReturnError(self::ERROR_CLIENT_VALUES_NOT_DEFINED,
						"Value {$k2} not recognized.");
				}
				$this->inserts[$k2]=$this->insertDefinitions[$k2][0];
			}
		}
		$this->values=$this->data['values'];
		return $this;
	}

	/**
	 * Checks for limit and offset.
	 *
	 * @param boolean $isRequired Is a limit and offset required.
	 * @return CommonDataInterface Returns this for chaining.
	 */
	protected function Limit(bool $isRequired=false):CommonDataInterface{
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
		if($isRequired&&($this->limit==-1||$this->offset==-1)){
			$this->ReturnError(self::ERROR_CLIENT_LIMIT_NOT_DEFINED,
				"Limit and offset not defined, required");
		}
		return $this;
	}

	abstract protected function Get();
	abstract protected function Update();
	abstract protected function Delete();
	abstract protected function Insert();
}
