import {DataTable,DataTableController} from './datatable.js';
import {Form,FormController} from './form.js';
import * as C from './constants.js';
import { CommonDataInterface } from './commondatainterface.js';
import { DH } from './dh.js';

export class PostalCarrierForm extends FormController{
	/**
	 * 
	 * @param {Typer} typer 
	 * @param {CommonDataInterface} cdi 
	 * @param {HTMLElement} formContainer 
	 */
	constructor(typer,cdi){
		super();
		this.typer=typer;
		this.cdi=cdi;
		this.createForm();
	}

	createForm(){
		this.form=new Form(this.typer,this);
		this.form.addToMessageGroup(null,'PostalCarrierForm');
		this.form.routeComponent('FormController','PostalCarrierFormController');
		this.form.setMainContainerById(C.ELEMENTS_POSTAL_CARRIER_FORM)
			.startForm()
			.add(C.POSTAL_CARRIERS_NAME)
			.add(C.POSTAL_CARRIERS_DESCRIPTION)
			.addButtonGroup('buttons')
			.addButton('submit','submit','Create','submit','buttons')
			.addButton('reset','reset','Reset','reset','buttons')
			.addButton('cancel','cancel','Cancel','cancel','buttons');
	}

	async submitForm(values){
		await this.cdi
			.insert()
			.columns([C.POSTAL_CARRIERS_NAME,C.POSTAL_CARRIERS_DESCRIPTION])
			.values(values)
			.send()
			.catch(e=>{throw e;});
		this.wire('PostalCarriersTable').refresh();
	}

	showForm(){	
		this.form.showComponent();
	}
}

export class PostalZonesForm extends FormController{
	constructor(typer,cdi){
		super();
		this.typer=typer;
		this.cdi=cdi;
		this.createForm();
		this.currentId=0;
	}

	async setCurrentId(id){
		this.currentId=id;
		await this.cdi
			.get()
			.columns('*')
			.where(C.POSTAL_CARRIERS_ID,this.currentId,'=')
			.order(C.POSTAL_ZONES_NAME,C.DIRECTION_UP)
			.send()
			.catch(e=>{throw e});
		let values=[];
		this.cdi.getData().forEach(e=>{
			values.push({id:e[C.POSTAL_ZONES_ID],value:e[C.POSTAL_ZONES_NAME]});
		});
		this.form.setValue(C.POSTAL_ZONES_NAME,values);
	}

	async addListItem(name,value){
		let v={};
		v[C.POSTAL_ZONES_NAME]=value;
		v[C.POSTAL_CARRIERS_ID]=this.currentId;
		await this.cdi
			.insert()
			.columns([C.POSTAL_ZONES_NAME,C.POSTAL_CARRIERS_ID])
			.values(v)
			.send()
			.catch(e=>{throw e;});
		await this.setCurrentId(this.currentId);
		this.wire('PostalCarriersTable').refresh();
	}

	createForm(){
		this.form=new Form(this.typer,this);
		this.form.addToMessageGroup(null,'PostalZonesForm')
			.routeComponent('FormController','PostalZonesFormController')
			.setMainContainerById(C.ELEMENTS_POSTAL_ZONES_FORM)
			.startForm()
			.add(C.POSTAL_ZONES_NAME,'list',true)
			.addButton('cancel','cancel','Finish','cancel');
	}

	showForm(){
		this.form.showComponent();
	}
}

export class PostalZoneMappingTable extends DataTableController{
	/**
	 * 
	 * @param {Typer} typer 
	 * @param {CommonDataInterface} regionsCdi 
	 * @param {CommonDataInterface} zoneCdi 
	 * @param {CommonDataInterface} zoneMapCdi 
	 */
	constructor(typer,regionsCdi,zoneCdi,zoneMapCdi){
		super();
		this.currentId=0;
		this.typer=typer;
		this.regionsCdi=regionsCdi;
		this.zoneCdi=zoneCdi;
		this.zoneMapCdi=zoneMapCdi;
		this.setupTable();
	}

	async getRegions(){
		await this.regionsCdi
			.get()
			.columns('*')
			.order(C.REGION_NAME,C.DIRECTION_UP)
			.send()
			.catch(e=>{throw e});
		return this.regionsCdi.getData();
	}

	async getZones(){
		await this.zoneCdi
			.get()
			.columns('*')
			.where(C.POSTAL_CARRIERS_ID,this.currentId,'=')
			.order(C.POSTAL_ZONES_NAME,C.DIRECTION_UP)
			.send()
			.catch(e=>{throw e});
		return this.zoneCdi.getData();
	}

	async refresh(){
		this.zoneMapCdi
			.get()
			.columns('*')
			.order(this.sort.name,this.sort.direction)
			.limit(this.view.size,this.view.offset)
			.where(C.POSTAL_CARRIERS_ID,this.currentId,'=');
		for(const k in this.filters){
			this.zoneMapCdi.where(k,this.filters[k].comparison
				,this.filters[k].operator);
		}
		await this.zoneMapCdi.send().catch(e=>{throw e});
		this.zoneMapCdi.getData().forEach(e=>{

		});
	}

	setupTable(){
		this.table=new DataTable(this.typer,this);
		this.table
			.setMainContainerById(C.ELEMENTS_POSTAL_ZONE_MAPPING)
			.setElementsByIdObject(C.ELEMENTS_POSTAL_ZONES_MAPPING_TABLE)
			.addColumn(C.COUNTRIES_NAME)
			.addColumn(C.COUNTRIES_CODE2)
			.addColumn(C.COUNTRIES_CODE3)
			.addColumn(C.REGION_ID)
			.addColumn(C.POSTAL_ZONES_ID);
		this.table.setViewSize(50);
		this.table.setSort(C.COUNTRIES_NAME,C.DIRECTION_UP);
	}

	updateTyper(regions,zones){
		this.typer.resetListOptions(C.REGION_ID);
		this.typer.resetListOptions(C.POSTAL_ZONES_ID);
		regions.forEach(e=>{
			this.typer.addListOption(C.REGION_ID,e[C.REGION_ID],e[C.REGION_NAME])
		});
		zones.forEach(e=>{
			this.typer.addListOption(C.POSTAL_ZONES_ID,e[C.POSTAL_ZONES_ID],e[C.POSTAL_ZONES_NAME]);
		})
	}

	async showTable(id){
		this.currentId=id;
		let regions=await this.getRegions();
		let zones=await this.getZones();
		this.updateTyper(regions,zones);
		this.setupTable();
	}
}

export class PostalCarriersTable extends DataTableController{
	/**
	 * Constructor.
	 * @param {Typer} typer 
	 * @param {CommonDataInterface} cdi 
	 * @param {PostalCarrierForm} pcForm
	 * @param {PostalZonesForm} pzForm
	 * @param {pzTable} pzmTable
	 */
	constructor(typer,cdi,pcForm,pzForm,pzmTable=null){
		super();
		this.typer=typer;
		this.cdi=cdi;
		this.pcForm=pcForm;
		this.pzForm=pzForm;
		this.pzmTable=pzmTable;
		this.setupTable();
	}

	setupTable(){
		this.table=new DataTable(this.typer,this);
		this.table
			.setElementsByIdObject(C.ELEMENTS_POSTAL_CARRIER_TABLE)
			.addColumn(C.POSTAL_CARRIERS_ID,true,false)
			.addColumn(C.POSTAL_CARRIERS_NAME,true,false)
			.addColumn(C.POSTAL_CARRIERS_DESCRIPTION,true,false)
			.addLinkColumn(C.POSTAL_ZONES_NAME)
			.addLinkColumn(C.POSTAL_CARRIERS_MAPPING)
			.addToolbarItem('custom',C.UI_CREATE_GLYPH,'create')
			.addToolbarItem('delete',String.fromCodePoint(0x1F5D1),'delete');
		this.table.setViewSize(50);
		this.table.setSort(C.POSTAL_CARRIERS_NAME,C.DIRECTION_UP);
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
		await this.cdi
			.send()
			.catch(e=>{throw e});
		this.table.clearBody();
		this.cdi.getData().forEach(r => {
			if(r[C.POSTAL_ZONES_NAME]==null)
				r[C.POSTAL_ZONES_NAME]='{NOT SET}';
			r[C.POSTAL_CARRIERS_MAPPING]='Map Zones';
			this.table.addRow(r[C.POSTAL_CARRIERS_ID],r);
		});
		this.table.renderFoot(this.cdi.getTotalSize());
	}

	async change(rowId,name,value){
		await this.cdi
			.update()
			.set(name,value)
			.where(C.POSTAL_CARRIERS_ID,rowId,'=')
			.send()
			.catch(e=>{throw e});
		this.refresh();
	}

	async delete(ids){
		if(confirm('Do you want to delete selected carriers ('+ids.length+')')){
			await this.cdi
				.delete()
				.where(C.POSTAL_CARRIERS_ID,ids,'IN')
				.send()
				.catch(e=>{throw e});
			this.refresh();
		}
	}

	clickCustomButton(name){
		if(name=='create');
			this.pcForm.showForm();
	}

	async clickLink(name,id,value){
		if(name==C.POSTAL_ZONES_NAME){
			await this.pzForm.setCurrentId(id);
			this.pzForm.showForm();
		}
		else if(name==C.POSTAL_CARRIERS_MAPPING){
			await this.pzmTable.showTable(id);
		}
	}
}