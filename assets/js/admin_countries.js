import * as C from './constants.js';
import {Typer} from './typer.js';
import {CommonDataInterface as CDI} from './commondatainterface.js';
import {CountriesTable} from './countriestable.js';
import {CountriesForm} from './countriesform.js'

const REGION_ID_FORM=C.REGION_ID+'_form';
const REGION_ID_TABLE=C.REGION_ID+'_table';

class AdminCountries{
	constructor(){
		this.ccdi=new CDI('Countries','/api/Countries');
		this.rcdi=new CDI('Regions','/api/Regions');
		this.tableElements={
			thead:document.getElementById('admin_countries_thead'),
			tbody:document.getElementById('admin_countries_tbody'),
			tfoot:document.getElementById('admin_countries_tfoot')
		};
		this.formContainer=document.getElementById('country_form');
		this.start();
	}

	showNewCountryForm(){
		this.form.showForm();
	}
	
	setTyperRegions(regions){
		this.typer.resetListOptions(REGION_ID_FORM);
		this.typer.resetListOptions(REGION_ID_TABLE);
		this.typer.addListOption(REGION_ID_FORM,C.SELECT_DEFAULT_TEXT,'--Select Region--',false);
		this.typer.addListOption(REGION_ID_TABLE,C.SELECT_NULL_ID,'{NOT SET/NULL}',false);
		regions.forEach(e=>{
			this.typer.addListOption(REGION_ID_FORM,e[C.REGION_ID],e[C.REGION_NAME],true);
			this.typer.addListOption(REGION_ID_TABLE,e[C.REGION_ID],e[C.REGION_NAME],true);
		});
	}

	async getRegions(){
		let d=await this.rcdi.get()
			.columns('*')
			.order(C.REGION_NAME,C.DIRECTION_UP)
			.send();	
		if(!d){
			alert('Failed to get region data.');
			return;
		}
		return d.data;
	}
	
	async start(){
		this.regions=await this.getRegions();
		this.typer=new Typer();
		this.typer.addInteger(C.COUNTRIES_ID,false,'0','Country ID')
			.addString(C.COUNTRIES_NAME,false,'-','Country Name','Country name needs to be 2-100 characters.')
			.addRegex(C.COUNTRIES_CODE2,false,'-','ISO Code 2',/^[A-Z]{2}$/,'Two characters, [A-Z].')
			.addRegex(C.COUNTRIES_CODE3,false,'-','ISO Code 3',/^[A-Z]{3}$/,'Three characters, [A-Z].')
			.addList(REGION_ID_FORM,C.REGION_ID,C.SELECT_DEFAULT_TEXT,'Region','Select region from list.')
			.addList(REGION_ID_TABLE,C.REGION_ID,C.SELECT_NULL_ID,'Region','Select region from list.');
		this.setTyperRegions(this.regions);
		this.table=new CountriesTable(this.typer,REGION_ID_TABLE,
			this.ccdi,this.tableElements,()=>this.showNewCountryForm());
		this.form=new CountriesForm(this.typer,this.ccdi,REGION_ID_FORM,this.formContainer);
	}
}

let ac=new AdminCountries();