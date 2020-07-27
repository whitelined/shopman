import {Form,FormController} from './form.js';
import * as C from './constants.js';

export class CountriesForm extends FormController{
	/**
	 * 
	 * @param {Typer} typer 
	 * @param {CommonDataInterface} cdi 
	 * @param {string} regionIDAlias 
	 * @param {HTMLElement} formContainer 
	 */
	constructor(typer,cdi,regionIDAlias,formContainer){
		this.typer=typer;
		this.cdi=cdi;
		this.regionIDAlias=regionIDAlias;
		this.formContainer=formContainer;
		this.createForm();
	}

	createForm(){
		this.form=new Form(this.typer,this.formContainer,
			C.DEFAULT_FORM_CLASSES,'countries_');
		this.form.attachSubmitCallBack((v)=>this.create(v))
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
		let r=this.cdi.insert().columns([C.COUNTRIES_NAME,C.COUNTRIES_CODE2,
			C.COUNTRIES_CODE3,C.REGION_ID]).values(values).send();
		if(!r)
			return false;
		return true;
	}
}