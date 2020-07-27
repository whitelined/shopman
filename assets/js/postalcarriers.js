import {DataTable,DataTableController} from './datatable.js';
import {Form,FormController} from './form.js';
import * as C from './constants.js';

export class PostalCarrierForm extends FormController{
	/**
	 * 
	 * @param {Typer} typer 
	 * @param {CommonDataInterface} cdi 
	 * @param {HTMLElement} formContainer 
	 */
	constructor(typer,cdi,formContainer){
		super();
		this.typer=typer;
		this.cdi=cdi;
		this.formContainer=formContainer;
		this.createForm();
	}

	createForm(){
		this.form=new Form(this,this.typer,this.formContainer,C.DEFAULT_FORM_CLASSES,'postal_carriers_');
		this.form.add(C.POSTAL_CARRIER_NAME)
			.add(C.POSTAL_CARRIER_DESCRIPTION)
			.addButtonGroup('buttons')
			.addButton('submit','submit','Create','submit','buttons')
			.addButton('reset','reset','Reset','reset','buttons')
			.addButton('cancel','cancel','Cancel','cancel','buttons');
	}

	submitForm(values){
		let r=this.cdi
			.insert()
			.columns([C.POSTAL_CARRIER_NAME,C.POSTAL_CARRIER_DESCRIPTION])
			.values(values)
			.send();
		if(r)
			return true;
		return false;
	}
}

export class PostalCarriersTable extends DataTableController{
	/**
	 * Constructor.
	 * @param {Typer} typer 
	 * @param {CommonDataInterface} cdi 
	 * @param {HTMLElement} elements 
	 * @param {Object} callbacks 
	 */
	constructor(typer,cdi,elements,callbacks){
		super();
		this.typer=typer;
		this.cdi=cdi;
		this.elements=elements;
		this.callbacks=callbacks;
		this.setupTable();
	}

	setupTable(){
		this.table=new DataTable(this,this.typer,this.elements);
		this.table.addColumn(C.POSTAL_CARRIER_ID,true,false)
			.addColumn(C.POSTAL_CARRIER_NAME,true,false)
			.addColumn(C.POSTAL_CARRIER_DESCRIPTION,true,false)
			.addLinkColumn(C.POSTAL_ZONE_NAME)
			.addToolbarItem('custom','\u229E','create')
			.addToolbarItem('delete',String.fromCodePoint(0x1F5D1),'delete');
		this.table.setViewSize(50);
		this.table.setSort(C.POSTAL_CARRIER_NAME,C.DIRECTION_UP);
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
			this.table.addRow(r[C.POSTAL_CARRIER_ID],r);
		});
		this.table.renderFoot(d.totalSize);
	}

	async change(rowId,name,value){
		let d=await this.cdi.update().set(name,value)
			.where(C.POSTAL_CARRIER_ID,rowId,'=').send();
		if(!d)
			return;
		this.refreshData();
	}

	async delete(ids){
		if(confirm('Do you want to delete selected carriers ('+ids.length+')')){
			let d=await this.cdi.delete()
				.where(C.POSTAL_CARRIER_ID,ids,'IN').send();
			if(!d)
				return;
			this.refreshData();
		}
	}

	clickCustomButton(name){
		switch(name){
			case 'create':
				this.callbacks.createForm();
		}
	}
}