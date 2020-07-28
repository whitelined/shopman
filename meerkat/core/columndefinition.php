<?php
/**
 * Part of Meerkat framework system.
 * Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 *
 * Licensed under MIT license. For all information regarding copyright and
 * license, refer to LICENSE.txt. Redistribution of this file must retain
 * copyright and license notes.
 *
 * Column definition.
 *
 * @copyright Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 * @license https://opensource.org/licenses/MIT
 * @package Meerkat
 * @subpackage Core
 */

namespace Meerkat\Core;

class ColumnDefinition{
	public $name=null;
	public $required=false;
	public $operatorsRequired=false;
	public $operators=[];
	public $type=null;
	public $parser=null;
	public $filterable=false;
	public $filterRestrictions=null;
	public $dataTransformer=null;
	public $selectable=false;
	public $orderable=false;
	public $updatable=false;
	public $insertable=false;


	/**
	 * Defines column definition
	 * @param string  $name       Name of column
	 * @param boolean $selectable Is column selectable in get query
	 * @param boolean $orderable  Can you order by the column in get query
	 * @param boolean $updatable  Can column be updated in update query
	 * @param boolean $insertable Is column an insertable value in insery query
	 */
	public function __construct(string $name,bool $selectable=false,bool $orderable=false,
		bool $updatable=false,bool $insertable=false){
		$this->name=$name;
		$this->selectable=$selectable;
		$this->orderable=$orderable;
		$this->updatable=$updatable;
		$this->insertable=$insertable;
		$this->dataTransformer=function($d){return $d;};
	}

	/**
	 * Sets type check
	 * @param  int             $type Type to check against
	 * @return ColumnDefinition       Returns itself to chain functions.
	 */
	public function Type(int $type,callable $parser=null):ColumnDefinition{
		$this->type=$type;
		$this->parser=$parser;
		return $this;
	}

	/**
	 * Sets allowed filter operations on column.
	 * @param  array           $operations Array of allowed operations
	 * @param  boolean         $required   Set to false if default operation is allowed.
	 * @param array $restrictions List of actions that this filter is limited to.
	 * @return ColumnDefinition             Returns itself to chain functions.
	 */
	public function Filterable(array $operators=['='],array $restrictions=null):ColumnDefinition{
		$this->filterable=true;
		$this->operators=$operators;
		$this->filterRestrictions=$restrictions;
		return $this;
	}

	/**
	 * Make column selectable.
	 *
	 * @return ColumnDefinition
	 */
	public function Selectable():ColumnDefinition{
		$this->selectable=true;
		return $this;
	}

	/**
	 * Make column orderable.
	 *
	 * @return ColumnDefinition
	 */
	public function Orderable():ColumnDefinition{
		$this->orderable=true;
		return $this;
	}

	/**
	 * Make column updatable.
	 *
	 * @return ColumnDefinition
	 */
	public function Updatable():ColumnDefinition{
		$this->updatable=true;
		return $this;
	}

	/**
	 * Make column insertable.
	 *
	 * @return ColumnDefinition
	 */
	public function Insertable():ColumnDefinition{
		$this->insertable=true;
		return $this;
	}

	/**
	 * Adds a data transformer.
	 *
	 * @param callable $dataTransformer A callback, that accepts a data value, and returns data transformed to suit requirements.
	 * @return ColumnDefinition
	 */
	public function AddDataTransformer(callable $dataTransformer):ColumnDefinition{
		$this->dataTransformer=$dataTransformer;
		return $this;
	}
}
