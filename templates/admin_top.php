<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Admin - <?= $this->pageTitle;?></title>
	<link href="https://fonts.googleapis.com/css?family=Lato&subset=latin,latin-ext" rel="stylesheet" type="text/css">
	<link href="https://fonts.googleapis.com/css?family=Droid+Sans" rel="stylesheet" type="text/css">
	<link href="<?= $this->LinkResource('css','admin.css',true); ?>" rel="stylesheet" type="text/css">
</head>
<body>
<div id="navbar">
<div class="dropdown">
	<image src="<?= $this->LinkResource('images','menubutton.svg',true); ?>"
	class="dropbtn" width="25" height="25">
	<div class="dropdown-content">
	<a href="<?= $this->CallObject('Admin/Countries',null,null,true);?>">Countries</a>
	<a href="<?= $this->CallObject('Admin/Regions',null,null,true);?>">Regions</a>
	<a href="<?= $this->CallObject('Admin/PostalCarriers',null,null,true);?>">Postal Carriers</a>
	<a href="<?= $this->CallObject('Admin/Postage',null,null,true);?>">Postage</a>
	</div>
</div>
</div>
