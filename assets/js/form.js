import {DH} from './dh.js';
import {Component} from './component.js';
import * as T from './typer.js';
import * as C from './constants.js';
export class Form extends Component{
	/**
	 * 
	 * @param {Typer} typer 
	 * @param {FormController} controller
	 * @param {String} prefix 
	 */
	constructor(typer,controller,prefix){
		super();
		this.typer=typer;
		this.controller=controller;
		this.formElements={inputs:{},rows:{}};
		this.prefix=prefix;
		this.expectingClassName('formFrame','Form Frame',false,'square')
			.expectingClassName('inputRowContainer','Div container for input row',false,'input-row-container')
			.expectingClassName('inputContainer','Div for input elements',false,'input-container')
			.expectingClassName('errorSpan','Error message',false,'error-span');
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

	setError(name){
		if(this.formElements.inputs[name].errorSpan.innerText.length==0)
			DH.appendText(this.formElements.inputs[name].errorSpan,
				this.typer.getError(name));
	}

	removeError(name){
		DH.clearChildNodes(this.formElements.inputs[name].errorSpan);
	}

	/**
	 * Sets value of a form element
	 * @param {string} name Name of element to set
	 * @param {*} value Value
	 */
	setValue(name,value){
		switch(this.formElements.inputs[name].type){
			case 'input':
				this.formElements.inputs[name].input.value=value;
				break;
			case 'select':
				this.formElements.inputs[name].select.value=value;
				break;
			case 'list':
				this.setListValues(name,value);
				break;
		}
	}

	setListValues(name,values){
		let ul=this.formElements.inputs[name].ul;
		DH.clearChildNodes(ul);
		if(values.length<1){
			let li=DH.appendNewWithText(ul,'li','{empty}');
		}
		else{
			values.forEach(e=>{
				let li=DH.appendNew(ul,'li');
				let sp1=DH.appendNewWithText(li,'span',e.value);
				let sp2=DH.appendNewWithText(li,'span',C.UI_DELETE_GLYPH);
				sp2.dataset.value=e.value;
				sp2.dataset.id=e.id;
				sp2.addEventListener('click',e=>{});
			});
		}
	}

	gatherValues(){
		let values={};
		for(const k in this.formElements.inputs){
			switch(this.formElements.inputs[k].type){
				case 'input':
				case 'select':
					let dataName=this.typer.getDataName(k);
					values[dataName]=this.getValue(k);
					break;
			}
		}
		return values;
	}

	getValue(name){
		switch(this.formElements.inputs[name].type){
			case 'input':
				return this.formElements.inputs[name].input.value;
			case 'select':
				return this.formElements.inputs[name].select.
					options[this.formElements.inputs[name].select.selectedIndex].value;
		}
	}

	/**
	 * Creates new form row.
	 * @param {string} name 
	 * @param {string} prefixName 
	 * @returns {HTMLElement} Returns element to put input in, or empty row
	 */
	createNewRow(name,prefixName,empty=false){
		let div=DH.appendNew(this.formElements.form,'div');
		div.className=this.classNames.inputRowContainer;
		div.dataset.name=name;
		this.formElements.rows[name]=div;
		if(empty)
			return div;
		let label=DH.appendNewWithText(div,'label',this.typer.getPrompt(name));
		label.htmlFor=prefixName;
		let div2=DH.appendNew(div,'div');
		div2.className=this.classNames.inputContainer;
		return div2;
	}

	createNewLabel(name,){
	}

	/**
	 * Creates a form element, based on type from Typer.
	 * @param {string} name Name of type element.
	 * @param {boolean} required Is this required
	 * @param {Function} handler Handler for change of list/select items.
	 * @returns {Typer} 
	 */
	add(name,type=null,required=true){
		if(!this.typer.typeExists(name)){
			throw 'Typer does not contain "'+name+'"';
		}
		let t=this.typer.getType(name);
		if(type){
			switch(type){
				case 'input':
					this.addInput(name,t,required);
					break;
				case 'select':
					this.addSelect(name,t);
					break;
				case 'list':
					this.addList(name,t);
					break;
			}
		}
		else{
			switch(t){
				case T.TYPE_INT:
				case T.TYPE_STRING:
				case T.TYPE_REGEX:
					this.addInput(name,t,required);
					break;
				case T.TYPE_LIST:
					this.addSelect(name,t);
					break;
			}
		}
		return this;
	}

	addInput(name,dataType,required=true){
		let pName=this.getPrefixName(name);
		let row=this.createNewRow(name,pName);
		let input=this.typer.generateFormElement(name,true);
		row.appendChild(input);
		input.name=pName;
		input.id=pName;
		input.dataset.name=name;
		input.autocomplete='off';
		let errorSpan=DH.appendNew(row,'span');
		errorSpan.className=this.classNames.errorSpan;
		this.formElements.inputs[name]={
			type:'input',
			input:input,
			dataType: dataType,
			errorSpan:errorSpan
		};
		input.addEventListener('input',e=>this.eventTextInput(e));
		input.addEventListener('focus',e=>this.eventTextFocus(e));
		input.addEventListener('blur',e=>this.eventTextBlur(e));
		return this;
	}

	addSelect(name,dataType){
		let pName=this.getPrefixName(name);
		let row=this.createNewRow(name,pName);
		let select=this.typer.generateFormElement(name,true);
		row.appendChild(select);
		select.dataset.name=name;
		this.formElements.inputs[name]={
			type:'select',
			dataType: dataType,
			select:select
		};
		select.addEventListener('change',e=>{
			this.eventSelectChange(e);
		});
		return this;
	}

	addList(name,dataType){
		let pName=this.getPrefixName(name);
		let row=this.createNewRow(name,pName);
		let ul=DH.appendNew(row,'ul');
		let div=DH.appendNew(row,'div');
		let input=this.typer.generateFormElement(name,true);
		input.name=pName;
		input.id=pName;
		input.dataset.name=name;
		input.autocomplete='off';
		input.addEventListener('input',e=>{this.eventTextInput(e)});
		div.appendChild(input);
		let errorSpan=DH.appendNew(div,'span');		
		errorSpan.className=this.classNames.errorSpan;
		let button=DH.appendNewWithText(div,'button',C.UI_CREATE_GLYPH);
		button.addEventListener('click',e=>this.eventClickAddToList(e));
		button.type='button';
		button.dataset.name=name;
		this.formElements.inputs[name]={
			type:'list',
			dataType: dataType,
			ul:ul,
			input:input,
			errorSpan:errorSpan
		};
	}

	addButtonGroup(name){
		let row=this.createNewRow(name,'bg',true);
		this.formElements.inputs[name]={
			type:'buttonGroup',
			row:row
		};
		return this;
	}

	addButton(name,value,label,type,group=null){
		let pName=this.getPrefixName(name);
		let row;
		if(!group){
			row=this.createNewRow(name,'bg',true);
		}
		else{
			row=this.formElements.inputs[group].row;
		}
		let b=DH.appendNewWithText(row,'button',label);
		b.dataset.name=name;
		b.value=value;
		switch(type){
			case 'submit':
				b.type='submit;';
				break;
			case 'reset':
				b.type='reset';
				break;
			case 'cancel':
				b.type='button';
				b.addEventListener('click',e=>{this.eventCancelButtonClick(e)});
				break;
			case 'button':
				b.type='button';
				b.addEventListener('click',e=>{this.eventClickButton(e)});
				break;
		}
		return this;
	}
	
	checkInputError(e){
		if(!e.target.validity.valid){
			this.setError(e.target.dataset.name);
		}
		else{
			this.removeError(e.target.dataset.name);
		}
	}

	//events

	eventClickAddToList(e){
		e.preventDefault();
		this.controller.addListItem(e.target.dataset.name,
			e.target.parentNode.firstChild.value);
	}

	async submitFormEvent(e){
		let errors=[];
		e.preventDefault();
		for(const k in this.formElements.inputs){
			switch(this.formElements.inputs[k].type){
				case 'input':
					if(!this.formElements.inputs[k].input.validity.valid){
						errors.push(this.typer.getError(k));
					}
					break;
				case 'select':
					if(!this.typer.validateValue(k,this.getValue(k))){
						errors.push(this.typer.getError(k));
					}
					break;
			}
		}
		console.log(errors);
		if(errors.length>0){
			alert(errors);
		}
		else{
			let r=await this.controller.submitForm(this.gatherValues());
			if(r){
				this.hideComponent();
			}
		}
	}

	eventClickListItemDelete(e){
		this.controller.deleteListItem();
	}

	eventClickButton(e){
		this.controller.clickButton(e.target.dataset.name);
	}

	eventCancelButtonClick(e){
		e.preventDefault();
		this.hideComponent();
	}

	eventTextFocus(e){
		this.checkInputError(e);
	}

	eventTextBlur(e){
		this.removeError(e.target.dataset.name);
	}

	eventTextInput(e){
		this.checkInputError(e);
	}

	eventSelectChange(e,handler){
		this.controller.selectChange(e.target.dataset.name);
	}
}

export class FormController extends Component{
	constructor(){
		super();
	}

	clickButton(name){
		alert('clickButton not implemented.');
	}

	async submitForm(values){
		alert('submitForm not implemented.');
	}

	async deleteListItem(name,id,value){
		alert('deleteListItem not implemented.');
	}

	async addListItem(name,value){
		alert('addListItem not implemented.');
	}
}