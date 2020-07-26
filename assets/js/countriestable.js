import * as C from './constants.js';
import {DataTable} from './datatable.js';

export class CountriesTable{
	constructor(typer,regionIDAlias,cdi,elements,createCallback){
		this.view={size:50,offset:0};
		this.sort={name:C.COUNTRIES_NAME,direction:'ASC'};
		this.typer=typer;
		this.regionIDAlias=regionIDAlias;
		this.cdi=cdi;
		this.elements=elements;
		this.createCallback=createCallback;
		this.setupTable();
	}

	setupTable(){
		this.table=new DataTable(this.typer,this.elements);
		this.table.attachDataHandler('refresh',()=>this.refreshData())
			.attachDataHandler('sort',(n,d)=>this.setSort(n,d))
			.attachDataHandler('view',(s,o)=>this.setView(s,o))
			.attachDataHandler('change',(i,n,v)=>this.change(i,n,v));
		this.table.addTextColumn(C.COUNTRIES_ID)
			.addEditColumn(C.COUNTRIES_NAME)
			.addEditColumn(C.COUNTRIES_CODE2)
			.addEditColumn(C.COUNTRIES_CODE3)
			.addSelectColumn(this.regionIDAlias)
			.addToolbarItem('custom','\u229E','create',this.createCallback)
			.addToolbarItem('selectAll','\u2611')
			.addToolbarItem('selectNone','\u2610')
			.addToolbarItem('delete',String.fromCodePoint(0x1F5D1),'delete',ids=>this.deleteCountries(ids));
		this.table.setViewSize(50);
		this.table.setSort(C.COUNTRIES_NAME,'ASC');
	}

	async refreshData(){
		let d=await this.cdi.get().columns('*').order(this.sort.name,this.sort.direction)
			.limit(this.view.size,this.view.offset*this.view.size).send();
		if(!d)
			return;
		this.table.clearBody();
		d.data.forEach(r => {
			this.table.addRow(r[C.COUNTRIES_ID],r);
		});
		this.table.renderFoot(d.totalSize);
	}

	async change(rowId,name,value){
		let d=await this.cdi.update().set(name,value)
			.where(C.COUNTRIES_ID,rowId,'=').send();
		if(!d)
			return;
	}

	async deleteCountries(ids){
		if(confirm('Do you want to delete selected countries ('+ids.length+')')){
			let d=await this.cdi.delete()
				.where(C.COUNTRIES_ID,ids,'IN').send();
			if(!d)
				return;
			this.refreshData();
		}
	}

	setSort(name,direction){
		this.sort.name=name;
		this.sort.direction=direction;
	}

	setView(size,offset){
		this.view.size=size;
		this.view.offset=offset;
	}
}