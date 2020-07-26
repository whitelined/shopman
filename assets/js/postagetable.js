import {DataTable} from './datatable.js';
import * as CON from './constants.js';
import { CommonDataInterface } from './commondatainterface.js';

export class PostageTable{
	/**
	 * 
	 * @param {Typer} typer Typer containing data information
	 * @param {CommonDataInterface} cdi Common data interface for Postage
	 */
	constructor(typer,cdi){
		this.sort={name:CON.POSTAGE_ID,direction:DIRECTION_UP};
		this.view={size=30,offset:0};
		this.typer=type;
		this.cdi=cdi;
		this.elements={
			thead:document.getElementById('admin_postage_thead'),
			tbody:document.getElementById('admin_postage_tbody'),
			tfoot:document.getElementById('admin_postage_tfoot')
		};
		this.makeTable();
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
	}

	setView(size,offset){

	}

	setSort(name,direction){
		this.sort.name=name;
		this.sort.direction=direction;
	}

	async refreshData(){
		let response=await this.cdi.get()
			.columns([CON.POSTAGE_ID,CON.POSTAGE_NAME,CON.POSTAGE_DESCRIPTION])
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
}