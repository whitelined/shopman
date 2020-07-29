import * as C from './constants.js';
import {Form,FormController} from './form.js';
import {DataTable,DataTableController} from './datatable.js';
import { CommonDataInterface } from './commondatainterface.js';

export class CountriesForm extends FormController{
	/**
	 * 
	 * @param {Typer} typer 
	 * @param {CommonDataInterface} cdi 
	 * @param {string} regionIDAlias 
	 * @param {HTMLElement} formContainer 
	 */
	constructor(typer,cdi,regionIDAlias){
		super();
		this.typer=typer;
		this.cdi=cdi;
		this.regionIDAlias=regionIDAlias;
		this.createForm();
	}

	createForm(){
		this.form=new Form(this.typer,'countries_');
		this.form.setMainContainerById(C.ELEMENTS_COUNTRY_FORM)
			.startForm()
			.add(C.COUNTRIES_NAME)
			.add(C.COUNTRIES_CODE2)
			.add(C.COUNTRIES_CODE3)
			.add(this.regionIDAlias)
			.addButtonGroup('buttons')
			.addButton('submit','submit','Create','submit','buttons')
			.addButton('reset','reset','Reset','reset','buttons')
			.addButton('cancel','cancel','Cancel','cancel','buttons');
	}

	async submitForm(values){
		await this.cdi
			.insert()
			.columns([C.COUNTRIES_NAME,C.COUNTRIES_CODE2,
			C.COUNTRIES_CODE3,C.REGION_ID])
			.values(values)
			.send()
			.catch(e=>{throw e});
		return;
	}

	showForm(){
		this.form.showComponent();
	}
}

export class CountriesTable extends DataTableController{
	/**
	 * 
	 * @param {Typer} typer 
	 * @param {string} regionIDAlias 
	 * @param {CommonDataInterface} cdi 
	 * @param {CountriesForm} cForm 
	 */
	constructor(typer,regionIDAlias,cdi,cForm){
		super();
		this.typer=typer;
		this.regionIDAlias=regionIDAlias;
		this.cdi=cdi;
		this.cForm=cForm;
		this.setupTable();
	}

	setupTable(){
		this.table=new DataTable(this.typer,this);
		this.table
			.setElementsByIdObject(C.ELEMENTS_COUNTRY_TABLE)
			.addColumn(C.COUNTRIES_ID)
			.addColumn(C.COUNTRIES_NAME)
			.addColumn(C.COUNTRIES_CODE2)
			.addColumn(C.COUNTRIES_CODE3)
			.addColumn(this.regionIDAlias)
			.addToolbarItem('custom',C.UI_CREATE_GLYPH,'create')
			.addToolbarItem('selectAll','\u2611')
			.addToolbarItem('selectNone','\u2610')
			.addToolbarItem('delete',String.fromCodePoint(0x1F5D1),'delete');
		this.table.setViewSize(50);
		this.table.setSort(C.COUNTRIES_NAME,'ASC');
	}

	clickCustomButton(name){
		if(name=='create'){
			this.cForm.showForm();
		}
	}

	async refresh(){
		this.cdi
			.get()
			.columns('*')
			.order(this.sort.name,this.sort.direction)
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
		await this.cdi.send().catch(e=>{throw e});
		this.table.clearBody();
		this.cdi.getData().forEach(r => {
			this.table.addRow(r[C.COUNTRIES_ID],r);
		});
		this.table.renderFoot(this.cdi.getTotalSize());
	}

	async change(rowId,name,value){
		await this.cdi
			.update()
			.set(name,value)
			.where(C.COUNTRIES_ID,rowId,'=')
			.send()
			.catch(e=>{throw e});
		this.refresh();
	}

	async delete(ids){
		if(confirm('Do you want to delete selected countries ('+ids.length+')')){
			await this.cdi
				.delete()
				.where(C.COUNTRIES_ID,ids,'IN')
				.send()
				.catch(e=>{throw e});
			this.refresh();
		}
	}
}