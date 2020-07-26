<?php

namespace Objects;

class Admin_Catalogue{
	private $db;

	public function __construct(\PDO $db){
		$this->db=$db;
		$this->RecieveData();
	}

	public function Get(){
		$this->RequiredWhere('root_id',self::TYPE_INT);
	}
}
