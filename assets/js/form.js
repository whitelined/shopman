import {DH} from './dh.js';
import {Component} from './component.js';
import * as C from './constants.js';
import {ControlInput, ControlSelect} from './control.js';
export class Form extends Component{
	/**
	 * 
	 * @param {FormController} controller
	 * @param {String} prefix 
	 */
	constructor(controller,prefix){
		super();
		this.controller=controller;
		this.prefix=prefix;
		this.formElements={inputs:{},rows:{}};
		this.formItems=[];
		this.expectingClassName('formFrame','Form Frame',false,'square')
			.expectingClassName('inputRowContainer','Div container for input row',false,'input-row-container')
			.expectingClassName('inputContainer','Div for input elements',false,'input-container');
	}


	getPrefixName(name){
		return this.prefix+name;
	}

	startForm(){
		DH.clearChildNodes(this.mainContainer);
		this.formElements.frame=DH.appendNew(this.mainContainer,'div');
		this.formElements.frame.className=this.classNames.formFrame;
		this.formElements.form=DH.appendNew(this.formElements.frame,'form');
		this.formElements.form.addEventListener('submit',e=>{this.submitFormEvent(e)});
		return this;
	}

	/**
	 * Adds form element.
	 * @param {FormElement} element Element to add.
	 */
	addFormElement(element){
		this.formItems.push(element);
		element.attachToForm(this);
		element.renderInput();
		return this;
	}

	/**
	 * Gets a form element
	 * @param {string} name name of element
	 * @returns {FormElement}
	 */
	getFormElement(name){
		for(let i=0;i<this.formItems.length;i++){
			if(this.formItems[i].getName()==name){
				return this.formItems[i];
			}
		}
		return null;
	}

	/**
	 * Sets value of a form element
	 * @param {string} name Name of element to set
	 * @param {*} value Value
	 */
	setValue(name,value){
		this.getFormElement(name).setValue(value);
	}


	gatherValues(){
		let values={};
		this.formItems.forEach(e=>{
			if(e.returnsValue())
				values[e.getName()]=e.getValue();
		});
		return values;
	}

	/**
	 * Creates new form row.
	 * @param {string} name 
	 * @param {string} prefixName 
	 * @param {string} prompt 
	 * @returns {HTMLElement} Returns element to put input in, or empty row
	 */
	createNewRow(name,prefixName,prompt,empty=false){
		let div=DH.appendNew(this.formElements.form,'div');
		div.className=this.classNames.inputRowContainer;
		div.dataset.name=name;
		if(empty)
			return div;
		let label=DH.appendNewWithText(div,'label',prompt);
		label.htmlFor=prefixName;
		let div2=DH.appendNew(div,'div');
		div2.className=this.classNames.inputContainer;
		return div2;
	}

	async changeListItem(name,id,value){
		return await this.controller.changeListItem(name,id,value);
	}

	async addListItem(name,value){
		await this.controller.addListItem(name,value);
	}

	async deleteListItem(name,id){
		await this.controller.deleteListItem(name,id);
	}

	async clickButton(name){
		await this.controller.clickButton(name);
	}

	//events

	async submitFormEvent(e){
		let errors=[];
		e.preventDefault();
		this.formItems.forEach(e=>{

		});
		console.log(errors);
		if(errors.length>0){
			alert(errors);
		}
		else{
			await this.controller.submitForm(this.gatherValues())
				.then(()=>this.hideComponent())
				.catch(e=>{alert(e)});
		}
	}
}

export class FormController extends Component{
	constructor(){
		super();
	}

	async submitForm(values){
		alert('submitForm not implemented.');
	}

	async clickButton(name){
		alert('clickButton not implemented.');
	}

	async changeListItem(name,id,value){
		alert('changeListItem not implemented.');
		throw ('changeListItem not implemented.');
	}

	async submitForm(values){
		alert('submitForm not implemented.');
	}

	async deleteListItem(name,id){
		alert('deleteListItem not implemented.');
	}

	async addListItem(name,value){
		alert('addListItem not implemented.');
	}
}

export class FormElement extends Component{
	/**
	 * 
	 * @param {string} name Name of form element.
	 * @param {DataProperties} dp Data properties
	 */
	constructor(name,dp){
		super();
		this.name=name;
		this.dp=dp;
		this.currentRow=null;
	}

	attachToForm(form){
		this.form=form;
		this.prefixName=this.form.getPrefixName(this.name);
	}

	getRow(empty=false){
		if(this.currentRow){
			DH.clearChildNodes(this.currentRow);
			return;
		}
		this.currentRow=this.form.createNewRow(this.name,
			this.prefixName,this.dp.getPrompt(this.name),empty);
	}

	getName(){
		return this.name;
	}

	returnsValue(){
		
	}

	getValue(){

	}

	setValue(value){

	}

	isValid(){
		
	}

	getError(){
		return null;
	}

	renderInput(){

	}
}

export class FormElementButtonGroup extends FormElement{
	/**
	 * 
	 * @param {string} name Name of form element.
	*/
	constructor(name){
		super(name,null);
		this.buttons=[];
	}

	getRow(empty=false){
		if(this.currentRow){
			DH.clearChildNodes(this.currentRow);
			return;
		}
		this.currentRow=this.form.createNewRow(this.name,null,null,true);
	}

	addButtonType(type,prompt,name=null){
		this.buttons.push({type:type,prompt:prompt,name:name});
		return this;
	}
	
	addSubmitButton(prompt){
		this.addButtonType('submit',prompt);
		return this;
	}

	addResetButton(prompt){
		this.addButtonType('reset',prompt);
		return this;
	}

	addCancelButton(prompt){
		this.addButtonType('cancel',prompt);
		return this;
	}

	addButton(name,prompt){
		this.addButtonType('button',prompt,name);
		return this;
	}

	renderInput(){
		this.getRow(true);
		this.buttons.forEach(e=>{
			let b=DH.appendNewWithText(this.currentRow,'button',e.prompt);
			switch(e.type){
				case 'submit':
					b.type='submit';
					break;
				case 'reset':
					b.type='reset';
					break;
				case 'cancel':
					b.type='button';
					b.addEventListener('click',e=>this.eventClickCancelButton(e));
					break;
				case 'button':
					b.type='button';
					b.dataset.name=e.name;
					b.addEventListener('click',e=>this.eventClickButton(e));
					break;
			}
		});
	}

	returnsValue(){
		return false;
	}

	isValid(){
		return true;
	}

	getValue(){
		return null;
	}

	setValue(value){
		return null;
	}

	//events

	eventClickButton(e){
		e.preventDefault();
		this.form.clickButton(e.target.dataset.name);
	}

	eventClickCancelButton(e){
		this.form.hideComponent();
	}
}

export class FormElementInput extends FormElement{
	/**
	 * 
	 * @param {string} name Name of form element.
	 * @param {DataProperties} dp Data properties
	 */
	constructor(name,dp){
		super(name,dp);
		this.errorSpan=null;
	}

	renderInput(){
		if(!this.input)
			this.input=new ControlInput(this.name,this.dp,false);
		this.getRow();
		this.input.appendInput(this.currentRow);
		this.input.appendErrorContainer(this.currentRow);
		return this;
	}

	getError(){
		return this.input.getError();
	}

	isValid(){
		return this.input.isValid();
	}

	returnsValue(){
		return true;
	}

	getValue(){
		return this.input.getValue();
	}

	setValue(value){
		this.input.setValue(value);
	}
}

export class FormElementSelect extends FormElement{
	/**
	 * 
	 * @param {string} name Name of form element.
	 * @param {DataProperties} dp Data properties
	 */
	constructor(name,dp){
		super(name,dp);
		this.select=null;
	}

	renderInput(){
		if(!this.input)
			this.input=new ControlSelect(this.name,this.dp);
		this.getRow();
		this.input.appendInput(this.currentRow);
		this.input.appendErrorContainer(this.currentRow);
		return this;
	}

	getValue(){
		return this.input.value;
	}

	setValue(value){
		this.input.value=value;
	}

	returnsValue(){
		return true;
	}

	getError(){
		return this.input.getError();
	}

	isValid(){
		return this.input.isValid();
	}
}

export class FormElementList extends FormElement{
	/**
	 * 
	 * @param {string} name Name of form element.
	 * @param {DataProperties} dp Data properties
	 */
	constructor(name,dp){
		super(name,dp);
		this.listValues=null;
		this.input=null;
		this.editInput=null;
		this.errorSpan=null;
		this.ul=null;
		this.edit={};
		this.expectingClassName('errorSpan','Error span for form element',false,'error-span');
	}

	/**
	 * Sets list of values. 
	 * @param {Array} values Array of objects, with id as a key and value as text to display.
	 */
	setListValues(values){
		this.listValues=values;
		DH.clearChildNodes(this.ul);
		if(values.length<1){
			let li=DH.appendNewWithText(this.ul,'li','{empty}');
		}
		else{
			values.forEach(e=>{
				let li=DH.appendNew(this.ul,'li');
				li.dataset.id=e.id;
				li.dataset.value=e.value;
				let sp1=DH.appendNewWithText(li,'span',e.value);
				let sp2=DH.appendNewWithText(li,'span',C.UI_DELETE_GLYPH);
				sp1.addEventListener('dblclick',e=>this.eventDoubleClickText(e));
				sp2.addEventListener('click',e=>this.eventClickListItemDelete(e));
			});
		}
	}

	renderInput(){
		if(!this.input){
			this.input=new ControlInput(this.name,this.dp,false);
			this.input.onFinish(c=>this.onFinishNew(c));
			this.input.onCancel(c=>this.onCancelNew(c));
		}
		if(!this.editInput){
			this.editInput=new ControlInput(this.name,this.dp,true);
			this.editInput.onFinish(c=>this.onFinishEdit(c));
			this.editInput.onCancel(c=>this.onCancelEdit(c));
		}
		this.getRow();
		this.ul=DH.appendNew(this.currentRow,'ul');
		let div=DH.appendNew(this.currentRow,'div');
		this.input.appendInput(div);
		this.input.appendErrorContainer(div);
	}

	getError(){
		return '';
	}

	isValid(){
		return true;
	}

	getValue(){
		return null;
	}

	setValue(value){
		this.setListValues(value);
	}

	returnsValue(){
		return true;
	}
	
	setListItemBack(value=null){
		alert(value);
		console.log(value);
		DH.clearChildNodes(this.edit.li);
		this.edit.li.appendChild(this.edit.value);
		this.edit.li.appendChild(this.edit.button);
		if(value!=null){
			DH.clearChildNodes(this.edit.value);
			DH.appendText(this.edit.value,value);
			this.edit.button.dataset.id=id;
		}
		this.edit={};
	}

	//events

	async onFinishEdit(c){
		await this.form.changeListItem(this.name,this.edit.li.dataset.value,c.getValue())
			.then((r)=>this.setListItemBack(c.getValue()))
			.catch((e)=>this.setListItemBack());
	}

	onCancelEdit(c){
		this.setListItemBack();
	}

	async onFinishNew(c){
		if(c.isValid())
			this.form.addListItem(this.name,c.getValue());
		else
			c.focusInput();
	}

	onCancelNew(c){
	}


	eventTextInput(e){
		this.checkInputError(e);
	}

	eventClickListItemDelete(e){
		this.form.deleteListItem(this.name,e.target.parentNode.dataset.id);
	}

	eventDoubleClickText(e){
		this.edit.li=e.target.parentNode;
		this.edit.value=this.edit.li.childNodes[0];
		this.edit.button=this.edit.li.childNodes[1];
		DH.clearChildNodes(this.edit.li);
		this.editInput.appendInput(this.edit.li);
		this.editInput.appendErrorContainer(this.edit.li);
		this.editInput.setValue(this.edit.li.dataset.value);
		this.editInput.focusInput();
	}
}