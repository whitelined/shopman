import * as C from './constants.js';
import {CommonDataInterface as CDI} from './commondatainterface.js';
import {DataProperties} from './dataproperties.js';
import {PostalCarriersTable, PostalZoneMappingTable, PostalCarrierForm, PostalZonesForm} from './postalcarriers.js';

class AdminPostalCarriers{
	constructor(){
		this.regionsCDI=new CDI('Regions','/api/Regions');
		this.carrierCDI=new CDI('PostalCarriers','/api/PostalCarriers');
		this.zoneCDI=new CDI('PostalZones','/api/PostalZones');
		this.zoneMapCDI=new CDI('PostalZoneMapping','/api/PostalZoneMapping');
		this.start();
	}

	start(){
		this.carrierDP=new DataProperties();
		this.carrierDP.addInteger(C.POSTAL_CARRIERS_ID,false,'Carrier ID')
			.addString(C.POSTAL_CARRIERS_NAME,false,'Carrier Name','Must be 2-100 characters.',2,100)
			.addString(C.POSTAL_CARRIERS_DESCRIPTION,false,'Carrier Description',
				'Must be no longer than 200 characters.',null,200)
			.addString(C.POSTAL_ZONES_NAME,false,'Postal Zones','Must be 2-100 characters',2,100)
			.addOther(C.POSTAL_CARRIERS_MAPPING,false,'Zone Mapping')
			.addString(C.COUNTRIES_NAME,false,'Country Name')
			.addString(C.COUNTRIES_CODE2,false,'ISO Code 2')
			.addString(C.COUNTRIES_CODE3,false,'ISO Code 3')
			.addInteger(C.REGION_ID,false,'Region')
			.addInteger(C.POSTAL_ZONES_ID,false,'Postal Zone');
			this.carrierForm=new PostalCarrierForm(this.carrierDP,this.carrierCDI);
			this.zoneForm=new PostalZonesForm(this.carrierDP,this.zoneCDI);
			this.postalMappingTable=new PostalZoneMappingTable(this.carrierDP,this.regionsCDI,
				this.zoneCDI,this.zoneMapCDI);
			this.carrierTable=new PostalCarriersTable(this.carrierDP,this.carrierCDI,
				this.carrierForm,this.zoneForm,this.postalMappingTable);
	}
}

let apc=new AdminPostalCarriers();