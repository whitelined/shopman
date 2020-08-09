<?php
namespace Config;
use Meerkat\Core\Manifest;
if(strpos(getcwd(),'vitacoll')!==FALSE)
	require_once('config-server.php');
else
	require_once('config-local.php');
