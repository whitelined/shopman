import {CommonDataInterface as CDI, CommonDataInterface} from './commondatainterface.js';
import {PostalZoneRelationTable,PostalZoneRelationTyper} from './postalzones.js';

let cdiPZ=new CommonDataInterface('PostalZones','/api/PostalZones');
let cdiPZM=new CommonDataInterface('PostalZoneMembers','/api/PostalZoneMembers');
let pzTyper=new PostalZoneRelationTyper();
let pzTable=new PostalZoneRelationTable(pTyper,pCDI,
	{
		thead:document.getElementById('admin_postal_zones_members_thead'),
		tbody:document.getElementById('admin_postal_zones_members_tbody'),
		tfoot:document.getElementById('admin_postal_zones_members_tfoot')
	});