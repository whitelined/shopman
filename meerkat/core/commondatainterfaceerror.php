<?php
/**
 * Part of Meerkat framework system.
 * Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 *
 * Licensed under MIT license. For all information regarding copyright and
 * license, refer to LICENSE.txt. Redistribution of this file must retain
 * copyright and license notes.
 *
 * Commone Data Interface Error.
 *
 * @copyright Copyright 2017 Aaron Harvey (whitelined@gmail.com)
 * @license https://opensource.org/licenses/MIT
 * @package Meerkat
 * @subpackage Core
 */

namespace Meerkat\Core;

class CommonDataInterfaceError extends \Exception{
	/**
	 * Commond Data Interface constructor
	 * @param string $message  Description of Error
	 * @param int    $code     Error code
	 * @param Exception $previous Previous Error in Chain.
	 */
	public function __construct(string $message,int $code,\Exception $previous=null){
		parent::__construct($message,$code,$previous);
	}
}
