import {CommonDataInterface as CDI, CommonDataInterface} from './commondatainterface.js';
import {PostalZoneRelationTable,PostalZoneRelationTyper} from './postalzones.js';

let cdiPZ=new CommonDataInterface('PostalZones','/api/PostalZones');
let cdiPZM=new CommonDataInterface('PostalZoneMembers','/api/PostalZoneMembers');
let pzTyper=new PostalZoneRelationDataProperties();
let pzTable=new PostalZoneRelationTable(pTyper,pCDI,


class AdminPostalZones{
	
}