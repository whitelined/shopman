<?php

namespace Objects;

class Admin_PostalCarriers{
	private $country;
	public function __construct(){
		$v=new \Meerkat\Core\View('Admin_PostalCarriers');
		$v->pageTitle='Admin - Postal Carriers';
		$v->Display();
	}
}
