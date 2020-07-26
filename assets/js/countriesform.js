import {Form} from './form.js';
import * as C from './constants.js';

export class CountriesForm{
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
		this.form.attachSubmitCallBack(this.create)
			.addInput(C.COUNTRIES_NAME)
			.addInput(C.COUNTRIES_CODE2)
			.addInput(C.COUNTRIES_CODE3)
			.addSelect(this.regionIDAlias)
			.addButtonGroup('buttons')
			.addButton('submit','submit','Create','submit','buttons')
			.addButton('reset','reset','Reset','reset','buttons')
			.addButton('cancel','cancel','Cancel','cancel','buttons');
	}

	showForm(){
		this.form.showForm();
	}

	hideForm(){
		this.form.hideForm();
	}

	create(values){
		alert('here');
	}
}