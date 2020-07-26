<?php

namespace Objects;

class Admin_Postage{
	private $country;
	public function __construct(){
		$v=new \Meerkat\Core\View('Admin_Postage');
		$v->pageTitle='Admin - Postage';
		$v->Display();
	}
}
