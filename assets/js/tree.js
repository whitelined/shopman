class TreeView{
	constructor(containerElement,dataFunctions,options){
		this.containerElement=containerElement;
		this.dataFunctions=dataFunctions;
		this.containerElement=containerElement;
		this.ulClass=('ulClass' in options)?options.ulClass:'treeul';
		this.liClass=('liClass' in options)?options.liClass:'treeli';
		this.folderSelected=('folderSelected' in options)?options.folderSelected:'folderselected';
		this.fileSelected=('fileSelected' in options)?options.fileSelected:'fileselected';
		this.rootId=('rootId' in options)?options.rootId:0;
		this.folderStates={};
		this.selected=new Array();
		this.selectedElements={};
		this.multiSelect=false;
		this.callbacks=[];
	}

	setData(data){
		this.data=data;
	}
	
	addCallback(callback){
		this.callbacks.push(callback);
	}

	render(){
		DH.clearChildNodes(this.containerElement);
		let root=this.createUL();
		this.containerElement.appendChild(root);
		this.renderNodes(root,this.data);
	}

	renderNodes(containerElement,data){
		for(var i=0;i<data.length;i++){
			let li=this.createLI();
			li.dataset.id=data[i].id;
			data[i]
			if(data[i].children){
				this.createFolder(li,data[i]);
			}
			else{
				this.createFile(li,data[i]);
			}
			containerElement.appendChild(li);
		}
	}

	createLI(){
		let e=document.createElement('li');
		e.className=this.liClass;
		return e;
	}

	createUL(){
		let e=document.createElement('ul');
		e.className=this.ulClass;
		return e;
	}

	createFolder(liElement,data){
		let closed=true;
		if(data.id in this.folderStates){
			closed=this.folderStates[data.id];
		}
		else{
			this.folderStates[data.id]=closed;
		}
		let clicker=DH.newWithText('span',(closed)?'[+]':'[-]');
		clicker.addEventListener('click',e=>{this.clickExpand(e,this)});
		let d=document.createElement('div');
		d.addEventListener('click',e=>{this.clickFolder(e,this)});
		d.appendChild(clicker);
		DH.appendNewWithText(d,'span',data.title);
		d.dataset.closed=closed;
		liElement.appendChild(d);
		let cli=DH.appendNew(liElement,'ul');
		if(!closed){
			cli.style.display='block';
		}
		else{
			cli.style.display='none';
		}
		this.renderNodes(cli,data.children);
	}

	createFile(liElement,data){
		DH.appendText(liElement,data.title);
		liElement.addEventListener('click',e=>{this.clickFile(e,this)});
	}

	getSelected(){
		return this.selected;
	}

	unselectItems(except){
		let remove=new Array();
		for(let i=0;i<this.selected.length;i++){
			if(this.selected[i]!=except){
				remove.push(this.selected[i]);
				if(this.selected[i] in this.selectedElements){
				if(this.selectedElements[this.selected[i]].type=='folder'){
					this.selectedElements[this.selected[i]].e.
						childNodes[1].classList.remove(this.folderSelected);
				}
				else{
					this.selectedElements[this.selected[i]].e.
						className=this.liClass;
				}
				delete this.selectedElements[this.selected[i]];
				}
			}
			else{
				//alert('ok!');
			}
		}
		for(let i=0;i<remove.length;i++){
			this.selected.splice(this.selected.indexOf(remove[i]),1);
		}
	}
	
	sendCallbacks(){
		this.callbacks.forEach(cb=>{
			cb(this.selected);
		});
	}

	//events

	clickFile(e,obj){
		let i=this.selected.indexOf(e.target.dataset.id);
		if(i>-1){
			e.target.classList.remove(this.fileSelected);
			e.target.className=this.liClass;
			this.selected.splice(i,1);
			delete this.selectedElements[e.target.dataset.id];
		}
		else{
			e.target.className=this.fileSelected;
			this.selected.push(e.target.dataset.id);
			this.selectedElements[e.target.dataset.id]={type:'file',e:e.target};
			if(!this.multiSelect)
				this.unselectItems(e.target.dataset.id);
		}
		this.sendCallbacks();
	}

	clickFolder(e, obj){
		let t;
		if(e.target.tagName.toLowerCase()=='span')
			t=e.target.parentNode;
		else
			t=e.target;
		let i=this.selected.indexOf(t.parentNode.dataset.id);
		if(i>-1){
			t.childNodes[1].classList.remove(this.folderSelected);
			this.selected.splice(i,1);
			delete this.selectedElements[t.parentNode.dataset.id];
		}
		else{
			t.childNodes[1].className=this.folderSelected;
			this.selected.push(t.parentNode.dataset.id);
			this.selectedElements[t.parentNode.dataset.id]={type:'folder',e:t};
			if(!this.multiSelect)
				this.unselectItems(t.parentNode.dataset.id);
		}
		this.sendCallbacks();
	}

	clickExpand(e, obj){
		let closeit=true;
		if(e.target.parentNode.dataset.closed=='true')
			closeit=false;
		e.stopPropagation();
		e.target.parentNode.nextSibling.style.display=
			closeit?'none':'block';
		e.target.textContent=closeit?'[+]':'[-]';
		e.target.parentNode.dataset.closed=closeit?true:false;
		this.folderStates[e.target.parentNode.parentNode.dataset.id]=closeit?true:false;
	}
}
