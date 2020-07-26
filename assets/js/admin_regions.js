import {Typer} from './typer.js';
import {CommonDataInterface as CDI} from './commondatainterface.js';
import {DataTable} from './datatable.js';
import {Form} from './form.js';

const ID='region_id';
const NAME='name';

const NULLREGION=-1;
const DEFAULTTEXT=-2;

class Admin_Regions{
	constructor(){
		this.view={size:50,offset:0};
		this.sort={name:ID,direction:'ASC'};
		this.regions=null;
		this.form=null;
		this.typer=null;
		this.table=null;
		this.tableElements={
			thead:document.getElementById('admin_regions_thead'),
			tbody:document.getElementById('admin_regions_tbody'),
			tfoot:document.getElementById('admin_regions_tfoot')
		};
		this.formContainer=document.getElementById('region_form');
		this.cdiRegions=new CDI('Regions','/api/Regions');
		this.init();
	}

	async init(){
		this.initTyper();
		this.initForm();
		this.initTable();
	}

	initTyper(regions){
		this.typer=new Typer();
		this.typer.addInteger(ID,0,'Country ID',null)
			.addString(NAME,'-','Region Name','Region name must be 2 to 100 characters.',2,100);
	}

	initForm(){
		this.form=new Form(this.typer,this.formContainer,{
			formShow:'blankout show',
			formHide:'blankout',
			formFrame:'square'
		},'country_');
		this.form.startForm()
			.addInput(NAME,true)
			.addButton('submit','submit','Create!','submit');
		this.form.attachSubmitCallBack(v=>{this.submitRegionForm(v)});
	}

	async submitRegionForm(values){
		let r=await this.cdiRegions.insert()
			.columns([NAME])
			.values(values)
			.send();
	}

	initTable(){
		this.table=new DataTable(this.typer,this.tableElements);
		this.table.attachDataHandler('refresh',()=>this.refreshData())
			.attachDataHandler('sort',(n,d)=>this.setSort(n,d))
			.attachDataHandler('view',(s,o)=>this.setView(s,o))
			.attachDataHandler('change',(i,n,v)=>this.change(i,n,v));
		this.table.addTextColumn(ID,true).addEditColumn(NAME,true)
			.addToolbarItem('custom','\u229E','create',e=>this.form.showForm())
			.addToolbarItem('selectAll','\u2611')
			.addToolbarItem('selectNone','\u2610')
			.addToolbarItem('delete',String.fromCodePoint(0x1F5D1),'delete',ids=>{this.deleteRegions(ids)});
		this.table.setViewSize(50);
		this.table.setSort(ID,'ASC');
	}

	async getRegions(force=false){
		if(this.regions&&!force)
			return this.regions;
		let d=await this.cdiRegions.get().columns('*').send();
		if(!d)
			return;
		this.regions={};
		d.data.forEach(r=>{
			this.regions[r.region_id]=r.name;
		});
		return this.regions;
	}

	async refreshData(){
		let d=await this.cdiRegions.get().columns('*').order(this.sort.name,this.sort.direction)
			.send();
		if(!d)
			return;
		this.table.clearBody();
		d.data.forEach(r => {
			this.table.addRow(r[ID],r);
		});
		this.table.renderFoot(d.totalSize);
	}

	async change(rowId,name,value){
		let d=await this.cdiRegions.update().set(name,value)
			.where(ID,rowId,'=').send();
		if(!d)
			return;
	}

	async deleteRegions(ids){
		if(confirm('Do you want to delete selected regions ('+ids.length+')')){
			let d=await this.cdiRegions.delete()
				.where(ID,ids,'IN').send();
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

let ac=new Admin_Regions();