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
		this.form.add(C.POSTAL_CARRIERS_NAME)
			.add(C.POSTAL_CARRIERS_DESCRIPTION)
			.addButtonGroup('buttons')
			.addButton('submit','submit','Create','submit','buttons')
			.addButton('reset','reset','Reset','reset','buttons')
			.addButton('cancel','cancel','Cancel','cancel','buttons');
	}

	submitForm(values){
		let r=this.cdi
			.insert()
			.columns([C.POSTAL_CARRIERS_NAME,C.POSTAL_CARRIERS_DESCRIPTION])
			.values(values)
			.send();
		if(r)
			return true;
		return false;
	}
}

export class PostalZonesForm extends FormController{
	constructor(typer,cdi,formContainer){
		super();
		this.typer=typer;
		this.cdi=cdi;
		this.formContainer=formContainer;
		this.createForm();
		this.currentId=0;
	}

	async setCurrentId(id,show=true){
		this.currentId=id;
		let r=await this.cdi.get().columns('*').order(C.POSTAL_ZONES_NAME,C.DIRECTION_UP).send();
		if(!r){
			return;
		}
		let values=[];
		r.data.forEach(e=>{
			values.push({id:e[C.POSTAL_ZONES_ID],value:[C.POSTAL_ZONES_NAME]});
		});
		this.form.setValue(C.POSTAL_ZONES_NAME,values);
		if(show)
			this.showForm();
	}

	async addListItem(name,value){
			
	}

	createForm(){
		this.form=new Form(this,this.typer,this.formContainer,C.DEFAULT_FORM_CLASSES,'postal_zones_');
		this.form.add(C.POSTAL_ZONES_NAME,'list',true)
			.addButton('cancel','cancel','Finish','cancel');
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
		this.table.addColumn(C.POSTAL_CARRIERS_ID,true,false)
			.addColumn(C.POSTAL_CARRIERS_NAME,true,false)
			.addColumn(C.POSTAL_CARRIERS_DESCRIPTION,true,false)
			.addLinkColumn(C.POSTAL_ZONES_NAME)
			.addToolbarItem('custom',C.UI_CREATE_GLYPH,'create')
			.addToolbarItem('delete',String.fromCodePoint(0x1F5D1),'delete');
		this.table.setViewSize(50);
		this.table.setSort(C.POSTAL_CARRIERS_NAME,C.DIRECTION_UP);
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
			if(r[C.POSTAL_ZONES_NAME]==null)
				r[C.POSTAL_ZONES_NAME]='{NOT SET}';
			this.table.addRow(r[C.POSTAL_CARRIERS_ID],r);
		});
		this.table.renderFoot(d.totalSize);
	}

	async change(rowId,name,value){
		let d=await this.cdi.update().set(name,value)
			.where(C.POSTAL_CARRIERS_ID,rowId,'=').send();
		if(!d)
			return;
		this.refresh();
	}

	async delete(ids){
		if(confirm('Do you want to delete selected carriers ('+ids.length+')')){
			let d=await this.cdi.delete()
				.where(C.POSTAL_CARRIERS_ID,ids,'IN').send();
			if(!d)
				return;
			this.refresh();
		}
	}

	clickCustomButton(name){
		switch(name){
			case 'create':
				this.callbacks.createForm();
		}
	}

	clickLink(name,id,value){
		if(name==C.POSTAL_ZONES_NAME)
			this.callbacks.showZones(id);
	}
}