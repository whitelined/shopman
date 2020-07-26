class Tabs{
	constructor(containerElement,options){
		this.containerElement=containerElement;
		this.options={};
		this.options.selectedTabClass=('selectedTabClass' in options)?
			options.selectedTabClass:'tabselected';
		this.options.tabClass=('tabClass' in options)?
			options.tabClass:'tabnormal';
		this.tabs=new Array();
		this.callbacks=new Array();
	}

	addTab(title,id){
		this.tabs.push({title:title,id:id,element:null});
	}

	removeTab(id){
		let sp;
		for(let i=0;i<this.tabs.length;i++){
			if(this.tabs[i].id==id)
				sp=i;
		}
		this.tabs.splice(sp,1);
		this.render();
	}

	addCallback(callback){
		this.callbacks.push(callback);
	}

	setDefault(id){
		this.selected=id;
	}

	render(){
		DH.clearChildNodes(this.containerElement);
		for(let i=0;i<this.tabs.length;i++){
			let t=DH.appendNewWithText(this.containerElement,'div',
				this.tabs[i].title);
			t.dataset.id=this.tabs[i].id;
			this.tabs[i].element=t;
			t.addEventListener('click',e=>{this.clickTab(e);});
			if(this.tabs[i].id==this.selected)
				t.className=this.options.selectedTabClass;
			else
				t.className=this.options.tabClass;
		}
	}

	//events
	clickTab(e){
		this.selected=e.target.dataset.id;
		this.render();
		this.callbacks.forEach(cb=>{
			cb(this.selected);
		});
	}
}
