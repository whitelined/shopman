import {Component} from './component.js';
import {DataProperties} from "./dataproperties.js";
import {DH} from './dh.js';

export class Control extends Component
{
	/**
	 * 
	 * @param {string} name Name of control
	 * @param {DataProperties} dp Data Properties to get type information
	 * @param {boolean} forceValid onFinish callback only called when input is valid, refocuses element if not valid.
	 */
	constructor(name,dp,forceValid=false){
		super();
		this.name=name;
		this.dp=dp;
		this.forceValid=forceValid;

		this.valid=false;
		this.input=null;
		this.errorContainer=null;
		this.expectingClassName('errorSpan','Error message',false,'error-span');
	}

	/**
	 * Gets the error container associated with this Control.
	 * @returns {HTMLElement}
	 */
	getErrorContainer(){
		if(this.errorContainer)
			return this.errorContainer;
		this.errorContainer=document.createElement('span');
		this.errorContainer.className=this.classNames.errorSpan;
		return this.errorContainer;
	}

	getInput(){
		if(this.input)
			return this.input;
		this.input=DH.newWithText('span','Instanced base class.');
		return this.input;
	}

	/**
	 * Appends input element
	 * @param {HTMLElement} container To append to.
	 */
	appendInput(container){
		container.appendChild(this.getInput());
	}

	/**
	 * Appends error container element
	 * @param {HTMLElement} container To append to.
	 */
	appendErrorContainer(container){
		container.appendChild(this.getErrorContainer());
	}

	getError(){
		this.dp.getError(this.name);
	}

	setError(){
		this.clearError();
		DH.appendText(this.errorContainer,this.dp.getError(this.name));
	}

	clearError(){
		DH.clearChildNodes(this.errorContainer);
	}

	isValid(){
		return this.valid;
	}

	focusInput(){
		this.input.focus();
	}

	/**
	 * Gets current value of control.
	 */
	getValue(){
		return 'Instanced base class.';
	}

	setValue(value){
		this.input.value='Instanced base class.';
	}

	/**
	 * Sets callback for when control has finished.
	 * @param {Function} callback Callback function, of form callback(control)
	 */
	onFinish(callback){
		this.onFinish=callback;
	}

	/**
	 * Sets callback for when control has cancelled.
	 * @param {Function} callback Callback function, of form callback(control)
	 */
	onCancel(callback){
		this.onCancel=callback;
	}
}

export class ControlInput extends Control{
	/**
	 * 
	 * @param {string} name Name of control
	 * @param {DataProperties} dp Data Properties to get type information
	 * @param {boolean} forceValid onFinish callback only called when input is valid, refocuses element if not valid.
	 */
	constructor(name,dp,forceValid=true,autoComplete='off'){
		super(name,dp,forceValid);
		this.autoComplete=autoComplete;
	}

	getInput(){
		if(this.input)
			return this.input;
		this.input=this.dp.generateFormElement(this.name);
		this.input.name=this.name;
		this.input.autocomplete=this.autoComplete;
		this.input.addEventListener('input',e=>this.eventInput(e));
		this.input.addEventListener('keydown',e=>this.eventKeyDown(e));
		return this.input;
	}

	getValue(){
		return this.input.value;
	}

	setValue(value){
		this.input.value=value;
	}

	//events 

	eventKeyDown(e){
		if(e.code=='Enter'){
			e.preventDefault();
			if(this.forceValid&&!this.valid){
				this.focusInput();
			}
			else{
				this.onFinish(this);
			}
		}
		else if(e.code=='Escape'){
			e.preventDefault();
			this.onCancel(this);
		}
	}
	
	eventBlur(e){

	}

	eventInput(e){
		if(e.target.validity.valid){
			this.valid=true;
			this.clearError();
		}else{
			this.valid=false;
			this.setError();
		}
	}
}

export class ControlSelect extends Control{
	/**
	 * 
	 * @param {string} name Name of control
	 * @param {DataProperties} dp Data Properties to get type information
	 */
	constructor(name,dp,forceValid=true){
		super(name,dp);
		this.options=[];
	}

	getInput(){
		if(this.input)
			return this.input;
		this.input=document.createElement('select');
		this.renderOptions();
		this.input.addEventListener('change',e=>this.eventChangeSelect(e));
	}

	renderOptions(){
		if(!this.input)
			return;
		this.options.forEach(e=>{
			let o=DH.appendNewWithText(this.input,'option',e.value);
			o.id=e.id;
		});
	}

	findOptionKey(id){
		if(id==null)
			return -1;
		for(let i=0;i<this.options.length;i++){
			if(this.options[i].id=id){
				return i;
			}
		}
		return -1;
	}

	addOption(id,value,valid=true,after=null){
		let no={id:id,value:value,valid:valid};
		let i=this.findOptionKey(after);
		if(i==-1){
			this.options.push(no);
		}
		else{
			this.options.splice(i,0,no);
		}
		this.renderOptions();
	}

	checkValid(){
		let i=this.findOptionKey(this.input.value);
		if(i==-1)
			return;//not sure why this would happen.
		if(this.options[i].valid){
			this.valid=true;
			this.clearError();
		}
		else{
			this.valid=false;
			this.setError();
		}
	}

	setValue(value){
		this.input.value=value;
		this.checkValid();
	}

	/**
	 * Sets callback for when select changes.
	 * @param {Function} callback Callback function, of form callback(control)
	 */
	onChange(callback){
		this.onChange=callback;
	}

	//events

	eventChangeSelect(e){
		this.checkValid();
		if(this.onChange)
			this.onChange(this);
	}
}