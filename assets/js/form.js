import {DH} from './dh.js';
export class Form{
	constructor(typer,container,classes,prefix){
		this.typer=typer;
		this.container=container;
		this.classes=classes;
		this.elements={inputs:{}};
		this.prefix=prefix;
		this.submitCallback=null;
		this.startForm();
	}

	getPrefixName(name){
		return this.prefix+name;
	}

	showForm(){
		this.container.className=this.classes.formShow;
	}

	hideForm(){
		this.container.className=this.classes.formHide;
	}

	startForm(){
		DH.clearChildNodes(this.container);
		this.elements.frame=DH.appendNew(this.container,'div');
		this.elements.frame.className=this.classes.formFrame;
		this.elements.form=DH.appendNew(this.elements.frame,'form');
		this.elements.form.addEventListener('submit',e=>{this.submitFormEvent(e)});
		return this;
	}

	setError(name){
		if(this.elements.inputs[name].errorSpan.innerText.length==0)
			DH.appendText(this.elements.inputs[name].errorSpan,
				this.typer.getError(name));
	}

	removeError(name){
		DH.clearChildNodes(this.elements.inputs[name].errorSpan);
	}

	attachSubmitCallBack(callback){
		this.submitCallback=callback;
		return this;
	}

	async submitFormEvent(e){
		let errors=[];
		e.preventDefault();
		for(const k in this.elements.inputs){
			switch(this.elements.inputs[k].type){
				case 'input':
					if(!this.elements.inputs[k].input.validity.valid){
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
			let r=await this.submitCallback(this.gatherValues());
		}
	}

	gatherValues(){
		let values={};
		for(const k in this.elements.inputs){
			values[k]=this.getValue(k);
		}
		return values;
	}

	getValue(name){
		switch(this.elements.inputs[name].type){
			case 'input':
				return this.elements.inputs[name].input.value;
			case 'select':
				return this.elements.inputs[name].select.
					options[this.elements.inputs[name].select.selectedIndex].value;
		}
	}

	addInput(name,required=true){
		if(!(name in this.typer.definitions)){
			throw Error(name+' not in typer definitions.');
		}
		let pName=this.getPrefixName(name);
		let div=DH.appendNew(this.elements.form,'div');
		div.className=this.classes.inputRowContainer;
		let label=DH.appendNewWithText(div,'label',this.typer.getPrompt(name));
		label.htmlFor=pName;
		let div2=DH.appendNew(div,'div');
		div2.className=this.classes.inputContainer;
		let input=this.typer.generateFormElement(name,true);
		div2.appendChild(input);
		input.name=pName;
		input.id=pName;
		input.dataset.name=name;
		input.autocomplete='off';
		let errorSpan=DH.appendNew(div2,'span');
		errorSpan.className=this.classes.errorSpan;
		this.elements.inputs[name]={
			type:'input',
			div:div,
			input:input,
			errorSpan:errorSpan
		};
		input.addEventListener('input',e=>this.eventTextInput(e));
		input.addEventListener('focus',e=>this.eventTextFocus(e));
		input.addEventListener('blur',e=>this.eventTextBlur(e));
		return this;
	}

	addSelect(name,removeFromList=null, handler=false){
		let pName=this.getPrefixName(name);
		let div=DH.appendNew(this.elements.form,'div');
		div.className=this.classes.inputRowContainer;
		let label=DH.appendNewWithText(div,'label',this.typer.getPrompt(name));
		label.htmlFor=pName;
		let div2=DH.appendNew(div,'div');
		div2.className=this.classes.inputContainer;
		let select=this.typer.generateFormElement(name,true,removeFromList);
		div2.appendChild(select);
		select.dataset.name=name;
		this.elements.inputs[name]={
			type:'select',
			div:div,
			select:select
		};
		if(handler){
			select.addEventListener('change',e=>{
				this.eventSelectChange(e,handler);
			});
		}
		return this;
	}

	addButtonGroup(name){
		let div=DH.appendNew(this.elements.form,'div');
		div.className=this.classes.inputRowContainer;
		this.elements.inputs[name]={
			type:'buttonGroup',
			div:div
		};
		return this;
	}

	addButton(name,value,label,type,group=null,handler=false){
		let pName=this.getPrefixName(name);
		let div;
		if(!group){
			div=DH.appendNew(this.elements.form,'div');
			div.className=this.classes.inputRowContainer;
		}
		else{
			div=this.elements.inputs[group].div;
		}
		let b=DH.appendNewWithText(div,'button',label);
		b.value=value;
		switch(type){
			case 'submit':
				b.type='submit;';
				break;
			case 'reset':
				b.type='reset';
				break;
			case 'cancel':
				b.type='cancel';
				b.addEventListener('click',e=>{this.eventCancelButtonClick(e)});
				break;
			case 'button':
				b.type='button';
				b.addEventListener('click',handler);
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

	eventCancelButtonClick(e){
		e.preventDefault();
		this.hideForm();
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
		handler(e.target.value);
	}
}