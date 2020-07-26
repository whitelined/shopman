import {Typer} from './typer.js';
import {DataTable} from './datatable.js';
import * as CON from './constants.js';

const POSTAL_ZONE_LIST='postal_zone_list';

export class PostalZoneRelationTyper{
	constructor(){
		this.typer=new Typer();
		this.typer.addInteger(CON.POSTAL_ZONE_ID,0,'Postal Zone ID')
			.addInteger(CON.COUNTRIES_ID,0,'Country ID');
	}
}

export class PostalZoneRelationTable{
	/**
	 * 
	 * @param {Typer} typer Typer containing data information
	 * @param {CommonDataInterface} cdi Common data interface for Postage
	 * @param {object} elements Object containing thead, tbody and tfoot elements.
	 */
	constructor(typer,cdi,elements){
		this.sort={name:CON.POSTAGE_ID,direction:DIRECTION_UP};
		this.view={size=30,offset:0};
		this.typer=typer;
		this.cdi=cdi;
		this.elements=elements;
		this.makeTable();
		this.currentSelectedZone=0;
	}

	makeTable(){
		this.table=new DataTable(typer,this.elements);
		this.table.addTextColumn(CON.POSTAGE_ID,true)
			.addTextColumn(CON.POSTAGE_NAME,true)
			.addTextColumn(CON.POSTAGE_DESCRIPTION,true)
			.attachDataHandler('view',(s,o)=>this.setView(s,o))
			.attachDataHandler('refresh',()=>this.refreshData())
			.attachDataHandler('change',(id,n,v=>this.changeData(id,n,v)))
			.attachDataHandler('sort',(n,d)=>this.setSort(n,d))
			.addToolbarItem('custom','Postal Zones','postal_zones',()=>this.getPostalZoneForm())
			.addToolbarItem('select','Current Postal Zone:',POSTAL_ZONE_LIST,v=>this.ChangePostalZone(v));
	}

	setPostalZones(zones){
		let z=[];
		zones.forEach(e=>{
			z.push({value:e[CON.POSTAL_ZONE_ID],
					text:e[CON.POSTAL_ZONE_NAME]});
		});
		if(this.currentSelectedZone==0){
			this.currentSelectedZone=z[0].value;
		}
		this.table.setToolbarSelectList(POSTAL_ZONE_LIST,
			z,z[this.currentSelectedZone].value);
	}

	setView(size,offset){
		this.size=size;
		this.offset=offset;
	}

	setSort(name,direction){
		this.sort.name=name;
		this.sort.direction=direction;
	}

	async refreshData(){
		let response=await this.cdi.get()
			.columns([CON.POSTAL_ZONE_ID,CON_CO,CON.POSTAGE_DESCRIPTION])
			.order(this.sort.name,this.sort.direction)
			.limit(this.view.size,this.view.offset)
			.send();
		if(!response)
			return false;
		this.table.clearBody();
		response.data.forEach(e=>{
			this.table.addRow(e[CON.POSTAGE_ID],e);
		});
		return true;
	}

	async changeData(id,name,value){
		let response=await this.cdi.update()
			.set(name,value)
			.where(CON.POSTAGE_ID,id,'=')
			.send();
	}

	async changePostalZone(zone){

	}

	async getPostalZoneForm(){

	}
}