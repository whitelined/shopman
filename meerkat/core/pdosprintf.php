<?php

namespace Meerkat\Core;

use Exception;

class PDOSprintf{
	private $statement;
	private $definitions=[];
	private $parameters=[];
	private $binding;
	private $nextBindingValue=1;

	public function __construct(string $statement,$definitions){
		$this->statement=$statement;
		$this->addDefinitions($definitions);
	}

	private function addDefinitions($definitions){
		foreach($definitions as $v){
			$this->definitions[$v['name']]=$v;
		}
	}

	private function FormatColumn($column,$fullName){
		$c=$column;
		if(is_string($c)){
			if(!$fullName)
				return $column;
			if(isset($this->definitions[$c])){
				$c=$this->definitions[$c];
			}else{
				return $column;
			}
		}
		return (($fullName)?"{$c['table']}.":'').$c['name'];
	}

	private function IsColumnDefinition($column){
		if(isset($column['name'],$column['type'],$column['table']))
			return true;
		return false;
	}

	private function bind($name){

	}

	private function RenderSQL(){
		$utf32=iconv('UTF-8','UTF-32',$this->statement);
		$length=strlen($utf32);
		$build='';
		$parameter='';
		$state='text';
		$escape=false;
		for($i=0;$i<$length;$i+=4){
			$v=iconv('UTF-32','UTF-8',substr($utf32,$i,4));
			if($state=='text'){
				switch($v){
					case '\\':
						if($escape){
							$build.='\\';
							$escape=false;
						}
						else{
							$escape=true;
						}
						break;
					case '{':
						if($escape){
							$escape=false;
							$build.='{';
						}
						else{
							$state='parameter';
						}
						break;
					default:
						$build.=$v;
						break;
				}
			}
			else if($state='parameter'){
				if($v!='}'){
					$parameter.=$v;
				}
				else{
					if(strlen($parameter)<1){
						throw new Exception('Zero length parameter in PDOSprintf');
					}
					$build.=$this->bind($parameter);
					$parameter='';
					$state='text';
				}
			}
		}
	}

	/**
	 * Binds column(s) definition to parameter
	 *
	 * @param string $name Name of parameter
	 * @param string|array $column Column or columns
	 * @param boolean $fullName Prepend table name.
	 * @return PDOSprintf Returns this for chaining.
	 */
	public function BindColumn(string $name,$column,$fullName=false):PDOSprintf{
		if(is_array($column)){
			if($this->IsColumnDefinition($column)){
				$this->parameters[$name]=$this->FormatColumn($column,$fullName);
			}
			else{
				$l=[];
				foreach($column as $v){
					$l[]=$this->FormatColumn($v,$fullName);
				}
				$this->parameters[$name]=implode(',',$l);
			}
		}
		else{
			$this->parameters[$name]=$this->FormatColumn($column,$fullName);
		}
		return $this;
	}

	public function BindValue($name,$value){

	}

	public function GetStatement(){
		$this->RenderSQL();
	}
}