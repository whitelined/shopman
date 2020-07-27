import {DH} from './dh.js';
import * as T from './typer.js';
const DEFAULT_SELECT_SEARCH_VALUE='..search..';
const SEARCH_DELAY=300;

export const COLUMN_TEXT='text';
export const COLUMN_EDIT='edit';
export const COLUMN_SELECT='select';
export const COLUMN_CHECK='check';
export const COLUMN_LINK='link';

export class DataTable{
	/**
	 * 
	 * @param {Typer} typer 
	 * @param {Object} elements 
	 * @param {Object} classes 
	 */
	constructor(controller,typer,elements,classes={}){
		this.controller=controller;
		this.typer=typer;
		this.elements=elements;
		this.columns=[];
		this.currentSort=null;
		this.currentDirection=null;
		this.viewSize=20;
		this.viewOffset=0;
		this.classes=classes;
		this.previousRow=2;
		this.selectedRows=[];
		this.toolbarItems=[];
		this.searches={};
		this.waiting=false;

		if('up' in this.elements===false){
			this.elements.up=DH.newWithText('span','\u21E7');
		}
		if('down' in this.elements===false){
			this.elements.down=DH.newWithText('span','\u21E9');
		}
		if('search' in this.elements===false){
			this.elements.search=DH.newWithText('span',String.fromCodePoint(0x1F50D));
		}
		if('searchButton' in this.classes===false){
			this.classes.searchButton='search-button';
		}
		if('searchOutline' in this.classes===false){
			this.classes.searchOutline='search-outline';
		}
		if('titleClass' in this.classes===false){
			this.classes.titleClass='datatable-title';
		}
		if('searchForm' in this.classes===false){
			this.classes.titleClass='datatable-search-form';
		}
		if('row1' in this.classes===false){
			this.classes.row1='datatable row1';
		}
		if('row2' in this.classes===false){
			this.classes.row2='datatable row2';
		}
		if('row1Selected' in this.classes===false){
			this.classes.row1Selected='datatable row1 selected';
		}
		if('row2Selected' in this.classes===false){
			this.classes.row2Selected='datatable row2 selected';
		}
	}

	setSort(name,direction){
		this.currentSort=name;
		this.currentDirection=direction;
		this.controller.setSort(name,direction);
		this.renderHead();
		this.controller.refresh();
	}

	setViewSize(size){
		this.viewSize=size;
		this.controller.setView(this.viewSize,this.viewOffset);
	}

	setFilters(){
		let filters={};
		for(const k in this.searches){
			let dataName=this.typer.getDataName(k);
			let c=this.findColumn(k);
			switch(c.type){
				case COLUMN_TEXT:
				case COLUMN_EDIT:
					let val='%'+this.searches[k].currentValue+'%';
					filters[dataName]={
						operator:'ILIKE',
						comparison: val
					};
					break;
				case COLUMN_SELECT:
					filters[dataName]={
						operator:'=',
						comparison:this.searches[k].currentValue
					};
					break;
			}
		}
		this.controller.setFilters(filters);
		this.controller.refresh();
	}

	/**
	 * Sets a toolbar select list's options
	 * @param {string} name Name of toolbar select element.
	 * @param {array} options Array of objects containing 'value' and COLUMN_TEXT.
	 * @param {string} name Name of value to be selected.
	 */
	setToolbarSelectList(name,options,selected=null){
		let r=this.toolbarItems.findIndex(e=>e.name==name)
		if(r===undefined)
			throw 'Unable to set select list for '+name;
		this.toolbarItems[r].options=options;
		if(selected)
			this.toolbarItems[r].selected=selected;
	}

	/**
	 * Adds a item to the toolbar.
	 * @param {string} type 
	 * @param {string} prompt 
	 * @param {string} name 
	 */
	addToolbarItem(type,prompt,name=null){
		this.toolbarItems.push({
			type:type,
			prompt:prompt,
			name:name});
		return this;
	}

	//Add Column types

	/**
	 * 
	 * @param {string} name Name of column, to be found in supplied Typer.
	 * @param {boolean} sortable Is column sortable.
	 * @param {boolean} searchable Is column searchable.
	 */
	addColumn(name,sortable=true,searchable=true){
		if(!this.typer.typeExists(name)){
			throw 'Typer does not contain "'+name+'"';
		}
		if(this.findColumn(name))
			throw 'Column "'+name+'" already exists';
		let t=this.typer.getType(name);
		switch(t){
			case T.TYPE_INT:
			case T.TYPE_REGEX:
			case T.TYPE_STRING:
				if(this.typer.isReadOnly(name)){
					this.addTextColumn(name,t,sortable,searchable);
				}
				else{
					this.addEditColumn(name,t,sortable,searchable);
				}
				break;
			case T.TYPE_LIST:
				this.addSelectColumn(name,t,sortable,searchable);
				break;
		}
		return this;
	}
	
	addLinkColumn(name){
		if(this.findColumn(name))
			throw 'Column "'+name+'" already exists';
		this.columns.push({
			name:name,
			sortable:false,
			searchable:false,
			type:COLUMN_LINK,
			dataType:null
		});
		return this;
	}

	addTextColumn(name,dataType,sortable=true,searchable=true){
		this.columns.push({
			name:name,
			sortable:sortable,
			searchable:searchable,
			type:COLUMN_TEXT,
			dataType:dataType
		});
		return this;
	}

	addEditColumn(name,dataType,sortable=true,searchable=true){
		this.columns.push({
			name:name,
			sortable:sortable,
			searchable:searchable,
			type:COLUMN_EDIT,
			dataType:dataType
		});
		return this;
	}

	addSelectColumn(name,dataType,sortable=true,searchable=true){
		if(!this.typer.typeExists(name))
			throw 'Typer does not contain "'+name+'"';
		if(this.findColumn(name))
			throw 'Column "'+name+'" already exists';
		this.columns.push({
			name:name,
			sortable:sortable,
			type:COLUMN_SELECT,
			searchable:searchable,
			dataType:dataType
		});
		return this;
	}

	addCheckColumn(name,sortable=true,searchable=true){
		if(!this.typer.typeExists(name))
			throw 'Typer does not contain "'+name+'"';
		if(this.findColumn(name))
			throw 'Column "'+name+'" already exists';
		this.columns.push({
			name:name,
			sortable:sortable,
			type:COLUMN_CHECK
		});
		return this;
	}


	//Add rows


	addTextRow(text){
		let tr=DH.appendNew(this.elements.tbody,'tr');
		let td=DH.appendNewWithText(tr,'td',text);
		td.colSpan=this.columns.length;
	}

	addRow(id,data){
		let tr=DH.appendNew(this.elements.tbody,'tr');
		if(this.previousRow==2){
			this.changeRow(tr,1,this.isRowSelected(id));
			this.previousRow=1;
		}
		else{
			this.changeRow(tr,2,this.isRowSelected(id));
			this.previousRow=2;
		}
		tr.addEventListener('click',e=>{this.eventSelectRow(e)});
		tr.dataset.id=id;
		this.columns.forEach(c=>{
			let dataName=this.typer.getDataName(c.name);
			let td=DH.appendNew(tr,'td');
			td.dataset.id=id;
			td.dataset.name=c.name;
			td.dataset.value=data[c.name];
			switch(c.type){
				case COLUMN_TEXT:
					this.renderText(td,data[dataName]);
					break;
				case COLUMN_EDIT:
					this.renderEdit(td,data[dataName]);
					break;
				case COLUMN_SELECT:
					this.renderSelect(td,c.name,data[dataName]);
					break;
				case COLUMN_LINK:
					this.renderLink(td,data[c.name]);
					break;
			}
		});
	}

	//Render elements


	renderHead(){
		DH.clearChildNodes(this.elements.thead);
		let tr=DH.appendNew(this.elements.thead,'tr');
		this.renderToolbar(tr);
		tr=DH.appendNew(this.elements.thead,'tr');
		this.renderColumnHeaders(tr);
	}

	renderSearch(column,th){
		let div=DH.appendNew(th,'div');
		div.className=this.classes.searchButton;
		div.appendChild(this.elements.search.cloneNode(true));
		let sdiv=DH.appendNew(div,'div');
		sdiv.className=this.classes.searchOutline;
		sdiv.dataset.name=column.name;
		switch(column.type){
			case COLUMN_TEXT:
			case COLUMN_EDIT:
				let input=DH.appendNew(sdiv,'input');
				input.type='search';
				input.placeholder='Search...';
				input.addEventListener('input',e=>this.eventInputSearch(e));
				break;
			case COLUMN_SELECT:
				let select=this.typer.generateFormElement(column.name);
				let first=DH.firstNewWithText(select,'option','Search...');
				first.value=DEFAULT_SELECT_SEARCH_VALUE;
				select.value=DEFAULT_SELECT_SEARCH_VALUE;
				sdiv.appendChild(select);
				let reset=DH.appendNewWithText(sdiv,'button','\u274C');
				select.addEventListener('change',e=>this.eventChangeSearchSelect(e));
				reset.addEventListener('click',e=>this.eventClickSearchCancel(e));
		}
	}

	renderColumnHeaders(tr){
		this.columns.forEach(c=>{
			let th=DH.appendNew(tr,'td');
			th.dataset.name=c.name;
			if(c.searchable){
				this.renderSearch(c,th);
			}
			let t=DH.appendNewWithText(th,'span',this.typer.getPrompt(c.name));
			t.addEventListener('click',e=>{this.eventClickTitle(e)});
			t.className=this.classes.titleClass;
			if(c.name==this.currentSort){
				if(this.currentDirection=='ASC'){
					th.appendChild(this.elements.up.cloneNode(true));
				}
				else{
					th.appendChild(this.elements.down.cloneNode(true));
				}
			}
		});
	}

	renderToolbar(tr){
		let th=DH.appendNew(tr,'th');
		th.colSpan=this.columns.length;
		let b;
		this.toolbarItems.forEach(ti=>{
			switch(ti.type){
				case 'selectAll':
					b=DH.appendNewWithText(th,'button',ti.prompt);
					b.addEventListener('click',e=>this.eventSelectAll(e));
					break;
				case 'selectNone':
					b=DH.appendNewWithText(th,'button',ti.prompt);
					b.addEventListener('click',e=>this.eventSelectNone(e));
					break;
				case 'delete':
					b=DH.appendNewWithText(th,'button',ti.prompt);
					b.addEventListener('click',e=>this.eventDelete(e));
					break;
				case 'custom':
					b=DH.appendNewWithText(th,'button',ti.prompt);
					b.dataset.name=ti.name;
					b.addEventListener('click',e=>this.eventCustomButton(e));
					break;
				case COLUMN_SELECT:
					let span=DH.appendNewWithText(th,span,ti.prompt);
					let s=DH.appendNew(span,COLUMN_SELECT);
					if('options' in ti){
						ti.options.forEach(e=>{
							let op=DH.appendNewWithText(s,'option',e.text);
							op.value=e.value;
						});
					}
					if('selected' in ti)
						s.value=ti.selected;
					if(ti.handler)
						s.addEventListener('change',
							e=>this.eventToolbarSelectChange(e,ti.handler));
					break;
			}
		});
	}

	renderFoot(size){
		DH.clearChildNodes(this.elements.tfoot);
		let td=DH.appendNew(this.elements.tfoot,'td');
		td.colSpan=this.columns.length;
		let pages=Math.ceil(size/this.viewSize);
		for(let i=0,k=1;i<pages;i++,k++){
			if(i!=this.viewOffset){
				let a=DH.appendNewWithText(td,'a',k);
				a.dataset.viewOffset=i;
				a.addEventListener('click',e=>this.eventClickPage(e));
			}
			else{
				DH.appendText(td,k);
			}
			if(k!=pages)
				DH.appendText(td,', ');
		}
	}

	clearBody(){
		DH.clearChildNodes(this.elements.tbody);
	}

	renderLink(td,value){
		let a=DH.appendNewWithText(td,a,value);
		a.addEventListener('click',e=>{this.eventClickLink(e)});
	}

	renderText(td,value){
		DH.appendText(td,value);
	}

	renderEdit(td,value){
		let sp=DH.appendNewWithText(td,'span',value)
		sp.addEventListener('dblclick',e=>{this.eventDoubleClickText(e)});
	}

	renderSelect(td,name,value){
		let select=this.typer.generateFormElement(name,false);
		td.appendChild(select);
		select.value=value;
		select.addEventListener('change',e=>{this.eventChangeSelect(e)});
	}


	//Utilities


	findColumn(name){
		let r=null;
		this.columns.forEach(e=>{
			if(e.name==name)
				r=e;
		});
		return r;
	}

	isRowSelected(id){
		if(this.selectedRows.find(e=>e==id)!==undefined)
			return true;
		return false;
	}

	unselectRow(id){
		let r=this.selectedRows.findIndex(e=>e==id);
		if(r!==undefined){
			this.selectedRows.splice(r,1);
		}
	}

	selectRow(id){
		this.selectedRows.push(id);
	}

	changeRow(tr,row,selected){
		if(row==1&&!selected){
			tr.className=this.classes.row1;
			tr.dataset.row=1;
		}
		else if(row==2&&!selected){
			tr.className=this.classes.row2;
			tr.dataset.row=2;
		}
		else if(row==1&&selected){
			tr.className=this.classes.row1Selected;
			tr.dataset.row=1;
		}
		else{
			tr.className=this.classes.row2Selected;
			tr.dataset.row=2;
		}
	}

	unselectAllRows(){
		this.selectedRows=[];
		let trs=this.elements.tbody.getElementsByTagName('tr');
		for(let i=0;i<trs.length;i++){
			this.changeRow(trs[i],trs[i].dataset.row,false);
		}
	}

	selectAllRows(){
		let trs=this.elements.tbody.getElementsByTagName('tr');
		for(let i=0;i<trs.length;i++){
			this.selectRow(trs[i].dataset.id);
			this.changeRow(trs[i],trs[i].dataset.row,true);
		}
	}


	//timeouts

	timeoutTriggerSearch(){
		this.setFilters();
		this.waiting=false;
	}

	//events

	eventClickLink(e,handler){
		e.preventDefault();
		let d=e.target.parentNode.dataset;
		this.controller.clickLink(d.name,d.id,d.value);
	}

	eventInputSearch(e){
		let n=e.target.parentNode.dataset.name;
		if(e.target.value.length==0){
			delete this.searches[n];
			window.setTimeout(()=>this.timeoutTriggerSearch(),SEARCH_DELAY);
			return;
		}
		if(!(n in this.searches)){
			this.searches[n]={currentValue:e.target.value};
		}
		else{
			this.searches[n].currentValue=e.target.value;
		}
		if(!this.waiting){
			window.setTimeout(()=>this.timeoutTriggerSearch(),SEARCH_DELAY);
			this.waiting=true;
		}
	}


	eventCustomButton(e){
		this.controller.clickCustomButton(e.target.dataset.name);
	}

	eventToolbarSelectChange(e,handler){
		handler(e.target.value);
	}

	eventDelete(e){
		this.controller.delete(this.selectedRows);
	}

	eventSelectNone(e){
		this.unselectAllRows();
	}

	eventSelectAll(e){
		this.selectAllRows();
	}

	eventSelectRow(e){
		console.log(this.selectedRows);
		if(e.target&&e.target.tagName.toLowerCase()=='td'){
			let tr=e.target.parentNode;
			let id=tr.dataset.id;
			let row=parseInt(tr.dataset.row);
			if(this.isRowSelected(id)){	
				this.unselectRow(id);
				this.changeRow(tr,row,false);
			}
			else{
				this.selectRow(id);
				this.changeRow(tr,row,true);
			}
		}
	}

	eventChangeSearchSelect(e){
		let n=e.target.parentNode.dataset.name;
		if(n in this.searches&&e.target.value==DEFAULT_SELECT_SEARCH_VALUE){
			delete this.searches[n];
			this.timeoutTriggerSearch();
			return;
		}
		if(!(n in this.searches)){
			this.searches[n]={};
		}
		this.searches[n].currentValue=e.target.value;
		this.setFilters();
	}

	async eventChangeSelect(e){
		let td=e.target.parentNode;
		let old=td.dataset.value;
		let nv=e.target.value;
		try{
			let r=await this.controller.change(td.dataset.id,
				this.typer.getDataName(td.dataset.name),nv);
		}
		catch(err){
			alert('Error: '+err);
			e.target.value=old;
			return;
		}
	}

	eventClickSearchCancel(e){
		e.target.parentNode.firstChild.value=DEFAULT_SELECT_SEARCH_VALUE;
		delete this.searches[e.target.parentNode.dataset.name];
		this.setFilters();
	}

	eventClickTitle(e){
		let n=e.target.parentNode.dataset.name;
		let direction;
		if(this.currentDirection=='ASC'){
			direction='DESC';
		}
		else{
			direction='ASC';
		}
		this.renderHead();
		this.setSort(n,direction);
	}

	eventClickPage(e){
		e.preventDefault();
		this.viewOffset=parseInt(e.target.dataset.viewOffset);
		this.controller.view(this.viewSize,this.viewOffset);
		this.controller.refresh();
	}

	eventDoubleClickText(e){
		let p=e.target.parentNode;
		let id=p.dataset.id;
		let name=p.dataset.name;
		let value=p.dataset.value;
		DH.clearChildNodes(p);
		let input=this.typer.generateFormElement(name);
		p.appendChild(input);
		input.focus();
		input.value=value;
		input.addEventListener('blur',e2=>{this.eventBlurTextEdit(e2)});
		input.addEventListener('keyup',e3=>{this.eventKeyupTextEdit(e3)});
	}

	async eventFinishEdit(e){
		let td=e.target.parentNode;
		let nv=e.target.value;
		try{
			let r=await this.controller.change(td.dataset.id,
				this.typer.getDataName(td.dataset.name),nv);
			if(typeof r==='string'){
				e.target.setCustomValidity(r);
				e.target.focus();
				return;
			}
		}
		catch(error){
			alert('Error: '+error);
			this.eventCancelEdit(e);
			return;
		}
		DH.clearChildNodes(td);
		td.dataset.value=nv;
		this.renderEdit(td,nv);
	}

	eventCancelEdit(e){
		let td=e.target.parentNode;
		console.log(td);
		let nv=e.target.value;
		DH.clearChildNodes(td);
		this.renderEdit(td,td.dataset.value);
	}

	eventBlurTextEdit(e){
		this.eventFinishEdit(e);
	}

	eventKeyupTextEdit(e){
		if(e.key=='Enter'){
			e.preventDefault();
			this.eventFinishEdit(e);
		}
		else if(e.key=='Escape'){
			e.preventDefault();
			this.eventCancelEdit(e);
		}
	}
}

export class DataTableController{
	constructor(){
		this.view={};
		this.sort={};
	}

	async refresh(){
		alert('not implemented');
	}

	async change(rowId,name,value){
		alert('change not implemented');
	}

	async delete(ids){
		alert('delete not implemented');
	}

	clickCustomButton(name){
		alert('clickCustomButton not implemented');
	}

	clickLink(name,id,value){
		alert('clickLink not implemented');
	}

	setFilters(filters){
		this.filters=filters;
	}

	setSort(name,direction){
		this.sort.name=name;
		this.sort.direction=direction;
	}

	setView(size,offset){
		this.view.size=size;
		this.view.offset=offset;
	}
}