<?php

namespace Objects;

class Index{
	public function __construct(){
		$v=new \Meerkat\Core\View('index');
		$v->pageTitle='Index';
		$v->Display();
	}
}
