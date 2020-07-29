import * as C from './constants.js';
import {CommonDataInterface as CDI} from './commondatainterface.js';
import {Typer} from './typer.js';
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
		this.carrierTyper=new Typer();
		this.carrierTyper.addInteger(C.POSTAL_CARRIERS_ID,false,'-1','Carrier ID',true)
			.addString(C.POSTAL_CARRIERS_NAME,false,'---','Carrier Name',false,'Must be 2-100 characters.',2,100)
			.addString(C.POSTAL_CARRIERS_DESCRIPTION,false,'---','Carrier Description',false,
				'Must be no longer than 200 characters.',null,200)
			.addString(C.POSTAL_ZONES_NAME,false,'---','Postal Zones',false,'Must be 2-100 characters',2,100)
			.addConstant(C.POSTAL_CARRIERS_MAPPING,false,'Zone Mapping')
			.addConstant(C.COUNTRIES_NAME,false,'Country Name')
			.addConstant(C.COUNTRIES_CODE2)
			.addConstant(C.COUNTRIES_CODE3)
			.addList(C.REGION_ID,false,-1,'Region',true)
			.addList(C.POSTAL_ZONES_ID,false,-1,'Postal Zone',false);
			this.carrierForm=new PostalCarrierForm(this.carrierTyper,this.carrierCDI);
			this.zoneForm=new PostalZonesForm(this.carrierTyper,this.zoneCDI);
			this.postalMappingTable=new PostalZoneMappingTable(this.carrierTyper,this.regionsCDI,
				this.zoneCDI,this.zoneMapCDI);
			this.carrierTable=new PostalCarriersTable(this.carrierTyper,this.carrierCDI,
				this.carrierForm,this.zoneForm,this.postalMappingTable);
	}
}

let apc=new AdminPostalCarriers();