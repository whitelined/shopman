<?php
/**
 * Part of Meerkat framework system.
 * Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 *
 * Licensed under MIT license. For all information regarding copyright and
 * license, refer to LICENSE.txt. Redistribution of this file must retain
 * copyright and license notes.
 *
 * SQL Former class
 *
 * @copyright Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 * @license https://opensource.org/licenses/MIT
 * @package Meerkat
 * @subpackage Core
 */

namespace Meerkat\Core;

class SQLFormer{
	private $db;
	private $definitions;
	private $binds=[];
	private $sql='';

	/**
	 * Construct an SQLFormer object;
	 * @param PDO   $db          PDO database object
	 * @param array $definitions Definitions of column types. Keys are column names, respective values are type.
	 */
	public function __construct(\PDO $db,array $definitions){
		$this->db=$db;
		$this->definitions=$definitions;
	}

	public function Select($columns){
		$this="SELECT ".implode(',',$columns)
	}
}
