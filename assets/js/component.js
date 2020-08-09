export class Component{
	static stack=1;

	static containerClasses={
		table:{show:'table-container',hide:'table-container hide'},
		form:{show:'blankout',hide:'blankout hide'}
	};

	constructor(){
		this.mainContainer=null;
		this.containerClass='form';
		this.elements={};
		this.classNames={};
		this.expecting={elements:{},classNames:{}};
	}

	setContainerClass(name){
		this.containerClass=name;
		return this;
	}

	hideComponent(){
		this.mainContainer.className=Component.containerClasses[this.containerClass].hide;
		return this;
	}
	
	showComponent(){
		this.mainContainer.className=Component.containerClasses[this.containerClass].show;
		return this;
	}

	/**
	 * Adds a container classes.
	 * @param {string} name Name of container classes.
	 * @param {string} show Name of show class.
	 * @param {string} hide Name of hide class.
	 */
	static addContainerClass(name,show,hide){
		Component.containerClasses[name]={show:show,hide:hide};
	}

	/**
	 * Sets an element that is expected.
	 * @param {string} name Name of element
	 * @param {string} description Description of element.
	 * @param {boolean} required If it's absolutely required
	 * @param {HTMLElement} initialValue Initial/Default value for it.
	 * @returns {Component} Returns itself for chaining.
	 */
	expectingElement(name,description,required,initialValue){
		this.elements[name]=initialValue;
		this.expecting.elements[name]={description:description
			,required:required
			,isSet:false};
		return this;
	}

	/**
	 * Sets a style Classname that is expected.
	 * @param {string} name Name of classname.
	 * @param {string} description Description of classname.
	 * @param {boolean} required If it's absolutely required
	 * @param {string} initialValue Initial/Default value for it.
	 * @returns {Component} Returns itself for chaining.
	 */
	expectingClassName(name,description,required,initialValue){
		this.classNames[name]=initialValue;
		this.expecting.classNames[name]={description:description
			,required:required
			,isSet:false};
		return this;
	}

	/**
	 * Sets an element
	 * @param {string} name Name of element to set
	 * @param {HTMLElement} element Element to set.
	 * @returns {Component} Returns itself for chaining.
	 */
	setElement(name,element){
		this.elements[name]=element;
		if(name in this.expecting.elements){
			this.expecting.elements[name].isSet=true;
		}
		return this;
	}

	/**
	 * Sets an element by finding it by ID.
	 * @param {string} name Name of element to set.
	 * @param {string} id ID of element to set.
	 * @returns {Component} Returns itself for chaining.
	 */
	setElementById(name,id){
		let e=document.getElementById(id);
		this.elements[name]=e;
		if(name in this.expecting.elements){
			this.expecting.elements[name].isSet=true;
		}
		return this;
	}

	/**
	 * Sets a group of elements by ID.
	 * @param {Object} ids Group of IDs, where k is name, and value is element ID to find.
	 * @returns {Component} Returns itself for chaining.
	 */
	setElementsByIdObject(ids){
		for(const k in ids){
			this.elements[k]=document.getElementById(ids[k]);
			if(k in this.expecting.elements){
				this.expecting.elements[k].isSet=true;
			}
		}
		return this;
	}

	/**
	 * Sets class name.
	 * @param {string} name Name of class to set
	 * @param {string} value Class name.
	 * @returns {Component} Returns itself for chaining.
	 */
	setClassName(name,value){
		this.classNames[name]=value;
		if(name in this.expecting.classNames){
			this.expecting.classNames[name].isSet=true;
		}
		return this;
	}

	/**
	 * Sets the main container element to host the component.
	 * @param {HTMLElement} element Host element.
	 * @returns {Component} Returns itself for chaining.
	 */
	setMainContainer(element){
		this.mainContainer=element;
		return this;
	}

	/**
	 * Sets main container element by searching document for it's ID.
	 * @param {string} id ID to find eleme.
	 * @returns {Component} Returns itself for chaining.
	 */
	setMainContainerById(id){
		this.mainContainer=document.getElementById(id);
		return this;
	}
}