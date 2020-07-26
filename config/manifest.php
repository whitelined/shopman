<?php

use Meerkat\Core\Manifest as M;

M::AddManifestItem('MainDB',function(){
	$pdo=new \PDO("pgsql:host=localhost;port=5432;dbname=shopman;".
		"user=aaron;password=gta3000");
	$pdo->setAttribute(\PDO::ATTR_ERRMODE,\PDO::ERRMODE_EXCEPTION);
	return $pdo;
});
