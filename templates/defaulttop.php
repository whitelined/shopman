<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Vitacoll Gold - <?= $this->pagetitle;?></title>
	<link href="http://fonts.googleapis.com/css?family=Lato&subset=latin,latin-ext" rel="stylesheet" type="text/css">
	<link href="https://fonts.googleapis.com/css?family=Droid+Sans" rel="stylesheet" type="text/css">
	<link href="<?= $this->LinkResource('css','default.css'); ?>" rel="stylesheet" type="text/css">
</head>
<body>
<div id="top">
<nav id="navmenu">
<div id="menu">
<img src="<?= $this->LinkResource('images','menubutton.svg'); ?>" height="35" width="35">
<ul id="menulist">
<li><a href="<?= $this->CallObject('Index'); ?>">Home</a></li>
<li><a href="<?= $this->CallObject('Benefits'); ?>">Benefits</a></li>
<li><a href="<?= $this->CallObject('HowItWorks'); ?>">How it works</a></li>
<li><a href="<?= $this->CallObject('Testimonials'); ?>">Testimonials</a></li>
<li><a href="<?= $this->CallObject('FAQ'); ?>">FAQ</a></li>
<li><a href="<?= $this->CallObject('Order',null,null,true); ?>">Order</a></li>
<li><a href="<?= $this->CallObject('Contact'); ?>">Contact</a></li>
<li><a href="<?= $this->CallObject('Blog'); ?>">Blog</a></li>
</ul>
</div>
<div id="langmenu">
<img src="<?= $this->LinkResource('images/flag','gb.png',true);?>">
<div id="langmenu_pull">
<img src="<?= $this->LinkResource('images/flag','de.png',true);?>">
<img src="<?= $this->LinkResource('images/flag','fr.png',true);?>">
</div>
</div>
</nav>
</div>
<div id="logo">
<picture id="logoimg">
<source srcset="<?= $this->LinkResource('images','vl-lo.png',true);?>" media="(min-width:800px)">
<source srcset="<?= $this->LinkResource('images','vl-lo.png',true);?>" media="(min-width:320px) and (max-width:800px)">
<img src="<?= $this->LinkResource('images','vl-lo.png',true);?>" alt="Vitacoll Gold Logo">
</picture>
</div>
