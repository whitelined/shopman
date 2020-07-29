import {DH} from './dh.js';
/**
 * Type class, holds common information for types used for different components
 */

export const TYPE_INT='integer';
export const TYPE_STRING='string';
export const TYPE_REGEX='regex';
export const TYPE_LIST='list';
export const TYPE_CONSTANT='constant';

export class Typer{
	constructor(){
		this.definitions={};
	}

	typeExists(name){
		if(name in this.definitions)
			return true;
		return false;
	}

	/**
	 * Returns true name of supplied alias.
	 * @param {string} name Alias.
	 * @returnss {string} Returns true name of alias.
	 */
	getDataName(name){
		return this.definitions[name].dataName;
	}

	/**
	 * Generates form element associated with type, and validation rules.
	 * @param {string} name Name of type.
	 * @param {bool} setDefault Sets default value of input.
	 */
	generateFormElement(name,setDefault=false){
		switch(this.definitions[name].type){
			case TYPE_INT:
			case TYPE_STRING:
			case TYPE_REGEX:
				return this.generateInput(name,setDefault);
			case TYPE_LIST:
				return this.generateSelect(name,setDefault);
			case TYPE_CONSTANT:
				break;
		}
	}

	generateSelect(name,setDefault=false){
		let select=document.createElement('select');
		this.definitions[name].list.forEach(e=>{
			let op=DH.appendNewWithText(select,'option',e.value);
			op.value=e.key;
		});
		if(setDefault){
			select.value=this.getDefaultValue(name);
		}
		return select;
	}

	generateInput(name,setDefault=false){
		let input=document.createElement('input');
		switch(this.definitions[name].type){
			case TYPE_INT:
				input.type='number';
				if(this.definitions[name].min)
					input.min=this.definitions[name].min;
				if(this.definitions[name].max)
					input.max=this.definitions[name].max;
				break;
			case TYPE_STRING:
					input.type='text';
				if(this.definitions[name].minLength)
					input.minLength=this.definitions[name].minLength;
				if(this.definitions[name].maxLength)
					input.maxLength=this.definitions[name].maxLength;
				break;
			case TYPE_REGEX:
				input.type='text';
				input.pattern=this.definitions[name].regex.source;
				break;
		}
		if(setDefault){
			input.value=this.getDefaultValue(name);
		}
		return input;
	}

	/**
	 * Gets default value for named type.
	 * @param {string} name Name of type.
	 * @returns {mixed} Default Value.
	 */
	getDefaultValue(name){
		return this.definitions[name].defaultValue;
	}

	/**
	 * Returns type.
	 * @param {string} name Name of type.
	 * @returns {string} Type.
	 */
	getType(name){
		return this.definitions[name].type;
	}

	/**
	 * Returns error text for name
	 * @param {string} name Name of type to return.
	 * @returns string Error string relating to format of type.
	 */
	getError(name){
		return this.definitions[name].error;
	}

	/**
	 * Returns prompt text for named type.
	 * @param {string} name Prompt for named type.
	 * @returns string Prompt for named type.
	 */
	getPrompt(name){
		return this.definitions[name].prompt;
	}

	/**
	 * Returns if type is readonly.
	 * @param {string} name Name of type.
	 * @returns {boolean} Returns true if read only, false otherwise.
	 */
	isReadOnly(name){
		return this.definitions[name].readOnly;
	}

	/**
	 * Validates name of comparison.
	 * @param {string} name Alias of comparison 
	 * @param mixed value Data to compare.
	 */
	validateValue(name,value){
		if(!(name in this.definitions))
			throw 'No definition for '+name;
		switch(this.definitions[name].type){
			case TYPE_INT:
				return this.validateInteger(name,value);
			case TYPE_STRING:
				return this.validateString(name,value);
			case TYPE_REGEX:
				return this.validateRegex(name,value);
			case TYPE_LIST:
				return this.validateList(name,value);
			default:
				throw 'Invalid type found';
		}
	}

	/**
	 * Adds a constant value.
	 * @param {string} name Alias of comparison 
	 * @param {string} prompt Prompt text to use.
	 */
	addConstant(name,dataName,prompt){
		this.definitions[name]={
			dataName:(!dataName)?name:dataName,
			type:TYPE_CONSTANT,
			prompt:prompt
		}
		return this;
	}

	/**
	 * Add validation of integer.
	 * @param {string} name Alias of comparison 
	 * @param {string} dataName name of data type. Set to false to use alias 'name'.
	 * @param {int} defaultValue Default value.
	 * @param {string} prompt Prompt text to use.
	 * @param {boolean} readOnly Sets type as a read only value.
	 * @param {string} error Description of what value needs to be
	 * @param {int} min Minimum value.
	 * @param {int} max Maximum value.
	 * @param {bool} strict If false, strings parsed to int.
	 */
	addInteger(name,dataName,defaultValue,prompt,readOnly=false,error=null,min=null,max=null,strict=false){
		this.definitions[name]={
			dataName:(!dataName)?name:dataName,
			type:TYPE_INT,
			defaultValue:defaultValue,
			prompt:prompt,
			readOnly:readOnly,
			error:error,
			min:min,
			max:max,
			strict:strict};
		return this;
	}

	validateInteger(name,value){
		let v=value;
		if(this.definitions[name].strict){
			if(!Number.isInteger(value))
				return false;
		}
		else{
			if(typeof value===TYPE_STRING){
				v=parseInt(value);
				if(Number.isNaN(v))
					return false;
			}
		}
		if(this.definitions[name].min!==null&&v<this.definitions[name].min){
			return false;
		}
		if(this.definitions[name].max!==null&&v>this.definitions[name].max){
			return false;
		}
		return true;
	}

	/**
	 * Add validation of string.
	 * @param {string} name Alias of comparison 
	 * @param {string} dataName name of data type. Set to false to use alias 'name'.
	 * @param {string} defaultValue Default value.
	 * @param {string} prompt Prompt text to use.
	 * @param {boolean} readOnly Sets type as a read only value.
	 * @param {string} error Description of what value needs to be
	 * @param {int} minLength min length of string.
	 * @param {int} maxLength max length of string.
	 */
	addString(name,dataName,defaultValue,prompt,readOnly=false,error=null,minLength=null,maxLength=null){
		this.definitions[name]={
			dataName:(!dataName)?name:dataName,
			type:TYPE_STRING,
			defaultValue:defaultValue,
			prompt:prompt,
			readOnly:readOnly,
			error:error,
			minLength:minLength,
			maxLength:maxLength};
		return this;
	}

	validateString(name,value){
		if(this.definitions[name].minLength!==null&&value.length<this.definitions[name].minLength)
			return false;
		if(this.definitions[name].maxLength!==null&&value.length>this.definitions[name].maxLength)
			return false;
		return true;
	}

	/**
	 * Add validation against regex.
	 * @param {string} name Alias of comparison 
	 * @param {string} dataName name of data type. Set to false to use alias 'name'.
	 * @param {string} defaultValue Default value.
	 * @param {string} prompt Prompt text to use.
	 * @param {boolean} readOnly Sets type as a read only value.
	 * @param {RegExp} regex Regex to compare against.
	 * @param {string} error Description of what value needs to be
	 */
	addRegex(name,dataName,defaultValue,prompt,readOnly=false,regex,error=null){
		this.definitions[name]={
			dataName:(!dataName)?name:dataName,
			type:TYPE_REGEX,
			defaultValue:defaultValue,
			prompt:prompt,
			readOnly:readOnly,
			error:error,
			regex:regex};
		return this;
	}

	validateRegex(name,value){
		if(this.definitions[name].regex.test(value))
			return true;
		return false;
	}

	/**
	 * Add validation against list.
	 * @param {string} name Alias of comparison 
	 * @param {string} dataName name of data type. Set to false to use alias 'name'.
	 * @param {string} defaultValue Default value.
	 * @param {string} prompt Prompt text to use.
	 * @param {boolean} readOnly Sets type as a read only value.
	 * @param {string} error Description of what value needs to be
	 */
	addList(name,dataName,defaultValue=null,prompt,readOnly=false,error=null){
		this.definitions[name]={
			dataName:(!dataName)?name:dataName,
			type:TYPE_LIST,
			defaultValue:defaultValue,
			prompt:prompt,
			readOnly:readOnly,
			error:error,
			list:[]};
		return this;
	}

	/**
	 * Add list option
	 * @param {string} name 
	 * @param {string} key 
	 * @param {mixed} value 
	 * @param {boolean} valid 
	 */
	addListOption(name,key,value,valid=true){
		this.definitions[name].list.push({key:key,value:value,valid:valid});
		return this;
	}

	validateList(name,key){
		let found=false;
		this.definitions[name].list.forEach(e=>{
			if(e.key=key)
				found=true;
		});
		return found;
	}

	/**
	 * Removes Typer item.
	 * @param {string} name Name of item to remove.
	 */
	removeItem(name){
		delete this.definitions[name];
	}

	/**
	 * Removes all the list options from Typer item.
	 * @param {string} name Name of item to remove list items.
	 */
	resetListOptions(name){
		this.definitions[name].list=[];
	}
}