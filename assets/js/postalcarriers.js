import {DataTable,DataTableController,
		DataTableToolbarButtons,
		DataTableColumnText,
		DataTableColumnLink,
		DataTableColumnSelect,
		DataTableColumnEdit,
		DataTableToolbarNewDelete,
		DataTableToolbarSelect,
		DataTableToolbarSelectRows} from './datatable.js';
import {Form,FormController, FormElementList, FormElementButtonGroup, FormElementInput} from './form.js';
import * as C from './constants.js';
import { CommonDataInterface } from './commondatainterface.js';
import { DH } from './dh.js';
import { DataProperties } from './dataproperties.js';

export class PostalCarrierForm extends FormController{
	/**
	 * 
	 * @param {DataProperties} dp 
	 * @param {CommonDataInterface} cdi 
	 * @param {HTMLElement} formContainer 
	 */
	constructor(dp,cdi){
		super();
		this.dp=dp;
		this.cdi=cdi;
		this.createForm();
	}

	createForm(){
		this.form=new Form(this,'pc_');
		this.form.setMainContainerById(C.ID_POSTAL_CARRIER_FORM)
			.startForm()
			.addFormElement(new FormElementInput(C.POSTAL_CARRIERS_NAME,this.dp))
			.addFormElement(new FormElementInput(C.POSTAL_CARRIERS_DESCRIPTION,this.dp))
			.addFormElement(new FormElementButtonGroup()
				.addSubmitButton('Create').addResetButton('Reset').addCancelButton('Cancel'));
	}

	async submitForm(values){
		await this.cdi
			.insert()
			.values(values)
			.send()
			.catch(e=>{throw e;});
		this.fromTable.refresh();
	}

	showForm(fromTable){	
		this.form.showComponent();
		this.fromTable=fromTable;
	}
}

export class PostalZonesForm extends FormController{
	/**
	 * 
	 * @param {DataProperties} dp 
	 * @param {CommonDataInterface} cdi 
	 */
	constructor(dp,cdi){
		super();
		this.dp=dp;
		this.cdi=cdi;
		this.createForm();
		this.currentId=0;
	}

	async setCurrentId(id){
		this.currentId=id;
		await this.cdi
			.get()
			.parameters('*')
			.filter(C.POSTAL_CARRIERS_ID,'=',this.currentId)
			.sort(C.POSTAL_ZONES_NAME,C.DIRECTION_UP)
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
			.values(v)
			.send()
			.catch(e=>{throw e;});
		await this.setCurrentId(this.currentId);
		this.fromTable.refresh();
	}

	async changeListItem(name,id,value){
		await this.cdi
			.update()
			.set(C.POSTAL_ZONES_NAME,value)
			.filter(C.POSTAL_ZONES_ID,'=',id)
			.send()
			.then(()=>this.fromTable.refresh())
			.catch(e=>{throw e;});
	}

	async deleteListItem(name,id){
		await this.cdi
			.delete()
			.filter(C.POSTAL_ZONES_ID,'=',id)
			.send()
			.catch(e=>{throw e;});
		await this.setCurrentId(this.currentId);
			this.fromTable.refresh();
	}

	createForm(){
		this.form=new Form(this,'pz_');
		this.form.setMainContainerById(C.ID_POSTAL_ZONES_FORM)
			.startForm()
			.addFormElement(new FormElementList(C.POSTAL_ZONES_NAME,this.dp))
			.addFormElement(new FormElementButtonGroup().addCancelButton('Cancel'));
	}

	showForm(fromTable){
		this.form.showComponent();
		this.fromTable=fromTable;
	}
}

export class PostalZoneMappingTable extends DataTableController{
	/**
	 * 
	 * @param {DataProperties} dp 
	 * @param {CommonDataInterface} regionsCdi 
	 * @param {CommonDataInterface} zoneCdi 
	 * @param {CommonDataInterface} zoneMapCdi 
	 */
	constructor(dp,regionsCdi,zoneCdi,zoneMapCdi){
		super();
		this.currentId=0;
		this.dp=dp;
		this.regionsCdi=regionsCdi;
		this.zoneCdi=zoneCdi;
		this.zoneMapCdi=zoneMapCdi;
		this.setupTable();
	}

	async getRegions(){
		await this.regionsCdi
			.get()
			.parameters('*')
			.sort(C.REGION_NAME,C.DIRECTION_UP)
			.send()
			.catch(e=>{throw e});
		let c=this.table.getColumn(C.REGION_ID);
		c.deleteAllOptions();
		c.addOption(C.SELECT_NULL_ID,'{NOT SET/NULL}')
		this.regionsCdi.getData().forEach(e=>{
			c.addOption(e[C.REGION_ID],e[C.REGION_NAME]);
		});
	}

	async getZones(){
		await this.zoneCdi
			.get()
			.parameters('*')
			.filter(C.POSTAL_CARRIERS_ID,'=',this.currentId)
			.sort(C.POSTAL_ZONES_NAME,C.DIRECTION_UP)
			.send()
			.catch(e=>{throw e});
		let c=this.table.getColumn(C.POSTAL_ZONES_ID);
		c.deleteAllOptions();
		c.addOption(C.SELECT_NULL_ID,'{NOT SET/NULL}');
		this.zoneCdi.getData().forEach(e=>{
			c.addOption(e[C.POSTAL_ZONES_ID],e[C.POSTAL_ZONES_NAME]);
		});
	}

	async refresh(){
		this.table.clearBody();
		await this.zoneMapCdi
			.get()
			.parameters('*')	
			.sort(this.sort.name,this.sort.direction)
			.limit(this.view.size,this.view.offset)
			.filters(this.filters,this.dp)
			.filter(C.POSTAL_CARRIERS_ID,'=',this.currentId)
			.send()
			.catch(e=>{throw e});
		this.zoneMapCdi.getData().forEach(e=>{
			this.table.addRow(e[C.COUNTRIES_ID],e);
		});
	}

	setCarrierList(list){
		let s=this.table.getToolbarItem('currentCarrierId');
		s.removeAllOptions();
		list.forEach(e=>{
			s.addOption(e[C.POSTAL_CARRIERS_ID],e[C.POSTAL_CARRIERS_NAME]);
		});
	}

	clickToolbarButton(name){
		this.table.hideComponent();
		this.from.showComponent();
	}

	async changeToolbarSelect(name,value){
		this.currentId=value;
		await this.getZones();
		this.refresh();
	}

	setupTable(){
		this.table=new DataTable(this.dp,this);
		this.table
			.setMainContainerById(C.ID_POSTAL_ZONE_MAPPING_TABLE)
			.setContainerClass('table')
			.setElementsByIdObject(C.ID_POSTAL_ZONES_MAPPING_TABLE_ELEMENTS)
			.addColumn(new DataTableColumnText(C.COUNTRIES_NAME,this.dp))
			.addColumn(new DataTableColumnText(C.COUNTRIES_CODE2,this.dp))
			.addColumn(new DataTableColumnText(C.COUNTRIES_CODE3,this.dp))
			.addColumn(new DataTableColumnSelect(C.REGION_ID,this.dp,true,true,false,true))
			.addColumn(new DataTableColumnSelect(C.POSTAL_ZONES_ID,this.dp,true,true,true,false))
			.addToolbarItem(new DataTableToolbarButtons().addButton('finish','Finish Mapping'))
			.addToolbarItem(new DataTableToolbarSelect('currentCarrierId'))
			.addToolbarItem(new DataTableToolbarSelectRows('selectRows',true,true,false));
	}

	async showTable(id,from){
		this.currentId=id;
		await this.getRegions();
		await this.getZones();
		from.hideComponent();
		this.from=from;
		this.table.setViewSize(50);
		this.table.setSort(C.COUNTRIES_NAME,C.DIRECTION_UP);
		this.table.showComponent();
	}

	async changeMultipleCellValue(rowIds,name,value){
		if(name==C.POSTAL_ZONES_ID){
			this.zoneMapCdi
				.insert()
			rowIds.forEach(e=>{
				let v={};
				v[C.POSTAL_CARRIERS_ID]=this.currentId;
				v[C.COUNTRIES_ID]=e;
				v[C.POSTAL_ZONES_ID]=value;
				this.zoneMapCdi.values(v);
			});
			await this.zoneMapCdi
				.send()
				.catch(e=>{throw e;});
		}
	}

	async changeCellValue(rowId,name,value){
		if(name==C.POSTAL_ZONES_ID){
			let v={};
			v[C.POSTAL_CARRIERS_ID]=this.currentId;
			v[C.COUNTRIES_ID]=rowId;
			v[C.POSTAL_ZONES_ID]=value;
			await this.zoneMapCdi
				.insert()
				.values(v)
				.send()
				.catch(e=>{throw e;});
		}
	}
}

export class PostalCarriersTable extends DataTableController{
	/**
	 * Constructor.
	 * @param {DataProperties} dp 
	 * @param {CommonDataInterface} cdi 
	 * @param {PostalCarrierForm} pcForm
	 * @param {PostalZonesForm} pzForm
	 * @param {pzTable} pzmTable
	 */
	constructor(dp,cdi,pcForm,pzForm,pzmTable=null){
		super();
		this.dp=dp;
		this.cdi=cdi;
		this.pcForm=pcForm;
		this.pzForm=pzForm;
		this.pzmTable=pzmTable;
		this.setupTable();
	}

	setupTable(){
		this.table=new DataTable(this.dp,this);
		this.table
			.setMainContainerById(C.ID_ELEMENTS_POSTAL_CARRIER_TABLE)
			.setContainerClass('table')
			.setElementsByIdObject(C.ID_POSTAL_CARRIER_TABLE_ELEMENTS)
			.addColumn(new DataTableColumnText(C.POSTAL_CARRIERS_ID,this.dp,true,false))
			.addColumn(new DataTableColumnEdit(C.POSTAL_CARRIERS_NAME,this.dp,true,false))
			.addColumn(new DataTableColumnEdit(C.POSTAL_CARRIERS_DESCRIPTION,this.dp,true,false))
			.addColumn(new DataTableColumnLink(C.POSTAL_ZONES_NAME,this.dp,true,false))
			.addColumn(new DataTableColumnLink(C.POSTAL_CARRIERS_MAPPING,this.dp,true,false))
			.addToolbarItem(new DataTableToolbarNewDelete('new/delete'));
		this.table.setViewSize(50);
		this.table.setSort(C.POSTAL_CARRIERS_NAME,C.DIRECTION_UP);
	}

	async refresh(){
		await this.cdi
			.get()
			.parameters('*')
			.sort(this.sort.name,this.sort.direction)
			.limit(this.view.size,this.view.offset*this.view.size)
			.filters(this.filters,this.dp)
			.send()
			.catch(e=>{throw e});
		this.table.clearBody();
		this.cdi.getData().forEach(r => {
			if(r[C.POSTAL_ZONES_NAME]==null)
				r[C.POSTAL_ZONES_NAME]='{NOT SET}';
			else{
				r[C.POSTAL_ZONES_NAME]=JSON.parse(r[C.POSTAL_ZONES_NAME]).join(', ');
			}
			r[C.POSTAL_CARRIERS_MAPPING]='Map Zones';
			this.table.addRow(r[C.POSTAL_CARRIERS_ID],r);
		});
		this.table.renderFoot(this.cdi.getTotalSize());
		this.pzmTable.setCarrierList(this.cdi.getData());
	}

	async changeCellValue(rowId,name,value){
		await this.cdi
			.update()
			.set(name,value)
			.filter(C.POSTAL_CARRIERS_ID,'=',rowId)
			.send()
			.catch(e=>{throw e});
		this.refresh();
	}

	async deleteRows(ids){
		if(confirm('Do you want to delete selected carriers ('+ids.length+')')){
			await this.cdi
				.delete()
				.filter(C.POSTAL_CARRIERS_ID,'IN',ids)
				.send()
				.then(()=>this.refresh())
				.catch(e=>{throw e});
		}
	}

	createRow(name){
		if(name=='create');
			this.pcForm.showForm(this);
	}

	async clickLink(name,id){
		if(name==C.POSTAL_ZONES_NAME){
			await this.pzForm.setCurrentId(id);
			this.pzForm.showForm(this);
		}
		else if(name==C.POSTAL_CARRIERS_MAPPING){
			await this.pzmTable.showTable(id,this.table);
		}
	}
}