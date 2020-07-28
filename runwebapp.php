<?php

use Meerkat\Core\Manifest as M;

$webapp=new Meerkat\Core\WebApp();

$webapp->Get('Index',function(){ $obj=new Objects\Index(); });
$webapp->Get('Admin/Countries',function(){
	$o=new Objects\Admin_Countries();
});
$webapp->Get('Admin/PostalCarriers',function(){
	$o=new Objects\Admin_PostalCarriers();
});
$webapp->Get('Admin/Regions',function(){
	$o=new Objects\Admin_Regions();
});
$webapp->Get('Admin/Postage',function(){
	$o=new Objects\Admin_Postage();
});

$webapp->Post('api/Countries',function(){
	$c=new Lib\Countries(
		M::GetManifestItem('MainDB'));
	$o=new API\Api_Countries($c);
});

$webapp->Post('api/PostalCarriers',function(){
	$c=new Lib\PostalCarriers(
		M::GetManifestItem('MainDB'));
	$o=new API\Api_PostalCarriers($c);
});

$webapp->Post('api/PostalZones',function(){
	$c=new Lib\PostalZones(
		M::GetManifestItem('MainDB'));
	$o=new API\Api_PostalZones($c);
});

$webapp->Post('api/Regions',function(){
	$c=new Lib\Regions(
		M::GetManifestItem('MainDB'));
	$o=new API\Api_Regions($c);
});

/*$webapp->GetMatch('test1\{test1:*}',function($matches){ var_dump($matches);
/*});

$webapp->GetMatch('test2\{test2:Get|Delete|Update}',function($matches){
var_dump($matches); });

$webapp->GetMatch('test3\{test3_1:Get|Delete|Update}\{test3_2:Jam|Spam}',function($matches){
var_dump($matches); });

$webapp->GetMatch('test4\{test2:Get|Delete|Update}\Fucked',function($matches){
var_dump($matches); }); */
