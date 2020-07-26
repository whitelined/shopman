<?php
$sttm=microtime(true);
error_reporting(E_ALL);
ini_set("display_errors", 1);
set_time_limit(600);

spl_autoload_register(function($class){
	$in=mb_strtolower(str_replace('\\','/',$class));
	if(!file_exists(Config\local_root.$in.'.php'))
		var_dump(debug_backtrace());
	require_once(Config\local_root.$in.'.php');
});
require_once('config/config.php');
require_once('config/manifest.php');
require_once('runwebapp.php');

file_put_contents('time.log',"URL: ".$_SERVER['REQUEST_URI'].
	", TIME: ".(microtime(true)-$sttm)."s, MEM:".
	(memory_get_peak_usage()/1024/1024)."mb\n", FILE_APPEND);
