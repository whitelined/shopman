<?php
header("Content-type: text/css");
chdir('../..');
require_once('config.php');
require_once('../lib/ssl.php');

?>
@font-face 
{
	font-family: "MERRIREG";
	src: url('<?php if(SSL::CheckForSSL()){echo Config::$site_address_secure;}else{echo Config::$site_address;} ?>assets/css/MerriweatherSans-Regular.eot');
	src: local("Merriweather Sans"), url('<?php if(SSL::CheckForSSL()){echo Config::$site_address_secure;}else{echo Config::$site_address;} ?>assets/css/MerriweatherSans-Regular.ttf') format("truetype");
	font-weight: normal;
	font-style: normal;
}

body
{
	font-family: MERRIREG;
	margin:0px;
	padding: 0px;
	background-color: #FF8F14;
	font-size: 16px;
}

#maindoc
{
	position: relative;
	top: 0px;
	width: 940px;
	margin-left: auto;
	margin-right: auto;
}

#top
{
	color: #6D3903;
	width: 910px;
	top: 10px;
	left: 10px;
	margin: 0px;
	border-width: 0px;
	padding: 10px;
	position: relative;
}

#top_border
{
	background-color: #A65907;
	width: 930px;
	position: relative;
}

#top_content
{
	background-color: #FFDA7E;
	color: #6D3903;
	width: 910px;
	top: 10px;
	left: 10px;
	margin: 0px;
	border-width: 0px;
	padding: 10px;
	position: relative;
	margin-bottom: 2em;
}

#top_head
{

}

#top_image
{
	border-width: 0px;
	margin-top: 5px;
	padding: 0px;
	height: 250px;
}

#link_menu
{
	width: 100%;
	height: 2em;
	padding-left:0px;
	padding-right:0px;
	margin-top: 1em;
	margin-bottom: 1em;
}

#link_menu ul
{
	width: 90%;
	display: table;
	list-style-type: none;
	text-align: center;
}

#link_menu ul li
{
	display: table-cell;
	background-color: #6178F4;
	text-align: center;
	font-size: 1em;
	border-right: 4px solid #FFDA7E;
	padding-left:8px;
	padding-right:8px;
	height: 2em;
	vertical-align: middle;
}

#link_menu a
{
	color: #F9D5B0;
	display: block;
	text-decoration: none;
}

#main
{
	width: 940px;
	margin-left: auto;
	margin-right: auto;
}

#main_border
{
	background-color: #A65907;
	width: 930px;
	position: relative;
}

#main_content
{
	background-color: #FFDA7E;
	color: #6D3903;
	width: 910px;
	top: 10px;
	left: 10px;
	margin: 0px;
	border-width: 0px;
	padding: 10px;
	position: relative;
}


#user_welcome
{
	top: 0px;
	width: 500px;
	right: 10px;
	position: absolute;
}

#small_login
{
	text-align: center;
	border-width: 0px;
	font-size: 0.75em;
}

#small_login ul
{
	display: inline;
}

#small_login li
{
	display: inline;
}


.ingredient
{
	font-weight: bold;
}

.form_error
{
	color: red;
}

.std_form li
{
	display: block;
	float: left;
	width: 50%;
}

.std_form
{
	border: 4px solid #6D3903;
}

.std_form legend
{
}

.std_form dl
{
	display: block;
	width: 100%;
}

.std_form dl dt
{
	height: 3em;
	display: block;
	text-align: right;
	width: 47%;
	height: 3em;
	float: left;
	padding: 0px;
	margin: 0px;
	vertical-align: top;
}

.std_form dl dd
{
	height: 3em;
	display: block;
	text-align: left;
	width: 50%;
	float: right;
	height: 3em;
	padding: 0px;
	margin: 0px;
	vertical-align: top;
}

.submit_para
{
	width: 100%;
	text-align: center;
}

.address_type
{
	font-weight: bold;
}

#footer
{
	width: 900px;
	padding-top: 10px;
	margin-left: auto;
	margin-right: auto;
}

#footer p
{
	width: 100%;
	text-align: center;
}
