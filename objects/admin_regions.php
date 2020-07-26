<?php

namespace Objects;

class Admin_Regions{
	private $country;
	public function __construct(){
		$v=new \Meerkat\Core\View('Admin_Regions');
		$v->pageTitle='Admin - Regions';
		$v->Display();
	}
}
