export class Component{
	static currentMessageGroup='default';
	static messageGroups={};
	static stack=1;
	static showClass='blankout show';
	static hideClass='blankout';

	constructor(autoAdd=true,aliasFor=null){
		this.messageRoutes={};
		this.messageGroup='default';
		this.mainContainer=null;
		this.elements={};
		this.classNames={};
		this.expecting={elements:{},classNames:{}};
		this.addToMessageGroup(null,aliasFor);
	}

	hideComponent(){
		this.mainContainer.className=Component.hideClass;
	}
	
	showComponent(){
		this.mainContainer.className=Component.showClass;
	}

	static setShowClass(showClass){
		Component.showClass=showClass;
	}

	static setHideClass(hideClass){
		Component.hideClass=hideClass;
	}

	/**
	 * Adds this object to a message group
	 * @param {string} name The name of the message group if set, or uses currently set one.
	 * @param {string} asAlias Add it as this alias if set, or uses this name.
	 */
	addToMessageGroup(name=null,asAlias=null){
		let n=name;
		if(!n)
			n=Component.currentMessageGroup;
		if(n in Component.messageGroups==false){
			Component.messageGroups[n]={}
		}
		this.messageGroup=n;
		Component.messageGroups[n][(asAlias=null)?this.constructor.name:asAlias]=this;
		return this;
	}

	/**
	 * Routes a component request from this object to another
	 * @param {string} from The component this object requests.
	 * @param {string} to The name of component to route to.
	 */
	routeComponent(from,to){
		this.messageRoutes[from]=to;
		return this;
	}

	/**
	 * Returns named component for communication.
	 * @param {string} name 
	 * @returns {Component}
	 */
	wire(name){
		let n=name;
		if(n in this.messageRoutes){
			n=this.messageRoutes[n];
		}
		return Component.messageGroups[this.messageGroup][n];
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