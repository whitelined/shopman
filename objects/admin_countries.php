<?php

namespace Objects;

class Admin_Countries{
	private $country;
	public function __construct(){
		$v=new \Meerkat\Core\View('Admin_Countries');
		$v->pageTitle='Admin - Countries';
		$v->Display();
	}
}
