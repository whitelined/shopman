import * as C from './constants.js';
import {CommonDataInterface as CDI, CommonDataInterface} from './commondatainterface.js';
import {Typer} from './typer.js';
import {PostalCarriersTable, PostalCarrierForm} from './postalcarriers.js';

let cdiPZ=new CommonDataInterface('PostalZones','/api/PostalZones');
let cdiPZM=new CommonDataInterface('PostalZoneMembers','/api/PostalZoneMembers');

class AdminPostalCarriers{
	constructor(){
		this.carrierCDI=new CDI('PostalCarriers','/api/PostalCarriers');
		this.zoneCDI=new CDI('PostalZones','/api/PostalZones');
		this.tableElements={
			thead:document.getElementById('admin_postal_carriers_thead'),
			tbody:document.getElementById('admin_postal_carriers_tbody'),
			tfoot:document.getElementById('admin_postal_carriers_tfoot')
		};
		this.formContainer=document.getElementById('postal_carriers_form');
		this.callbacks={
			createForm: ()=>this.createCarrierForm()
		};
		this.start();
	}

	createCarrierForm(){
		this.carrierForm.showForm();
	}

	start(){
		this.carrierTyper=new Typer();
		this.carrierTyper.addInteger(C.POSTAL_CARRIER_ID,false,'-1','Carrier ID',true)
			.addString(C.POSTAL_CARRIER_NAME,false,'---','Carrier Name',false,'Must be 2-100 characters.',2,100)
			.addString(C.POSTAL_CARRIER_DESCRIPTION,false,'---','Carrier Description',false,
				'Must be no longer than 200 characters.',null,200)
			.addString(C.POSTAL_ZONE_NAME,false,'---','Postal Zones',true);
		this.carrierTable=new PostalCarriersTable(this.carrierTyper,this.carrierCDI,this.tableElements,this.callbacks);
		this.carrierForm=new PostalCarrierForm(this.carrierTyper,this.carrierCDI,this.formContainer);
	}
}

let apc=new AdminPostalCarriers();