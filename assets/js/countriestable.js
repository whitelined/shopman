import * as C from './constants.js';
import {DataTable,DataTableController} from './datatable.js';

export class CountriesTable extends DataTableController{
	constructor(typer,regionIDAlias,cdi,elements,createCallback){
		super();
		this.typer=typer;
		this.regionIDAlias=regionIDAlias;
		this.cdi=cdi;
		this.elements=elements;
		this.createCallback=createCallback;
		this.setupTable();
	}

	setupTable(){
		this.table=new DataTable(this,this.typer,this.elements);
		this.table.addColumn(C.COUNTRIES_ID)
			.addColumn(C.COUNTRIES_NAME)
			.addColumn(C.COUNTRIES_CODE2)
			.addColumn(C.COUNTRIES_CODE3)
			.addColumn(this.regionIDAlias)
			.addToolbarItem('custom','\u229E','create')
			.addToolbarItem('selectAll','\u2611')
			.addToolbarItem('selectNone','\u2610')
			.addToolbarItem('delete',String.fromCodePoint(0x1F5D1),'delete');
		this.table.setViewSize(50);
		this.table.setSort(C.COUNTRIES_NAME,'ASC');
	}

	clickCustomButton(name){
		switch(name){
			case 'create':
				this.createCallback();
		};
	}

	async refresh(){
		this.cdi.get().columns('*').order(this.sort.name,this.sort.direction)
			.limit(this.view.size,this.view.offset*this.view.size);
		for(const k in this.filters){
			let value;
			if(this.filters[k].comparison==C.SELECT_NULL_ID){
				value=null;
			}
			else{
				value=this.filters[k].comparison;
			}
			this.cdi.where(k,value,this.filters[k].operator);
		}
		let d=await this.cdi.send();
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
		this.refreshData();
	}

	async deleteCountries(ids){
		if(confirm('Do you want to delete selected countries ('+ids.length+')')){
			let d=await this.cdi.delete()
				.where(C.COUNTRIES_ID,ids,'IN').send();
			if(!d)
				return;
			this.refresh();
		}
	}
}