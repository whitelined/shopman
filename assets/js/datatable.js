import {DH} from './dh.js';
import {Component} from './component.js';
import * as C from './constants.js';
import {DataProperties} from './dataproperties.js';
const DEFAULT_SELECT_SEARCH_VALUE='..search..';
const SEARCH_DELAY=300;

export const COLUMN_TEXT='text';
export const COLUMN_EDIT='edit';
export const COLUMN_SELECT='select';
export const COLUMN_CHECK='check';
export const COLUMN_LINK='link';

export class DataTable extends Component{
	/**
	 * @param {dp} dp
	 * @param {DataProperties} controller
	 */
	constructor(dp,controller){
		super();
		this.dp=dp;
		this.controller=controller;
		this.columns=[];
		this.currentSort=null;
		this.currentDirection=null;
		this.viewSize=20;
		this.viewOffset=0;
		this.previousRow=2;
		this.selectedRows=[];
		this.toolbarItems=[];
		this.searches={};
		this.waiting=false;

		this.expectingElement('thead','Table Head',true,null)
			.expectingElement('tbody','Table body',true,null)
			.expectingElement('tfoot','Table foot',true,null)
			.expectingClassName('titleClass','',false,'search-button')
			.expectingClassName('row1','Row 1 style.',false,'datatable row1')
			.expectingClassName('row2','Row 2 style.',false,'datatable row2')
			.expectingClassName('row1Selected','Row 1 style selected.',false,'datatable row1 selected')
			.expectingClassName('row2Selected','Row 2 style selected.',false,'datatable row2 selected');
	}

	setSort(name,direction){
		this.currentSort=name;
		this.currentDirection=direction;
		this.columns.forEach(e=>{
			if(e.getName()!=name){
				e.setSort(false,direction);
			}
		});
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
			let dataName=this.dp.getDataName(k);
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
	 * Adds a item to the toolbar.
	 * @param {DataTableToolbarItem} item Adds toolbar item.
	 */
	addToolbarItem(item){
		item.attachToTable(this);
		this.toolbarItems.push(item);
		return this;
	}

	/**
	 * Finds and returns toolbar item.
	 * @param {string} name Name of toolbar item.
	 * @returns {DataTableToolbarItem}
	 */
	getToolbarItem(name){
		for(let i=0;i<this.toolbarItems.length;i++){
			if(this.toolbarItems[i].getName()==name){
				return this.toolbarItems[i];
			}
		}
		return null;
	}

	//Add Column types

	/**
	 * 
	 * @param {DataTableColumn} column Adds column to table
	 */
	addColumn(column){
		column.attachToTable(this);
		this.columns.push(column);
		return this;
	}

	/**
	 * Gets column definition
	 * @param {string} name 
	 * @returns {DataTableColumn}
	 */
	getColumn(name){
		for(let i=0;i<this.columns.length;i++){
			if(this.columns[i].getName()==name){
				return this.columns[i];
			}
		}
		return null;
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
		tr.addEventListener('click',e=>{this.eventClickRow(e)});
		tr.dataset.id=id;
		this.columns.forEach(e=>{
			let td=DH.appendNew(tr,'td');
			let value=data[this.dp.getDataName(e.getName())];
			td.dataset.value=value
			e.renderCell(td,value);
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

	renderColumnHeaders(tr){
		this.columns.forEach(e=>{
			let th=DH.appendNew(tr,'td');
			e.renderHeader(th);
		});
	}

	renderToolbar(tr){
		let th=DH.appendNew(tr,'th');
		th.colSpan=this.columns.length;
		this.toolbarItems.forEach(e=>{
			e.render(th);
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
		this.selectedRows=[];
		DH.clearChildNodes(this.elements.tbody);
	}


	//Utilities

	updateFilters(){
		let filters=[];
		this.columns.forEach(e=>{
			let f={};
			f.name=e.getName();
			f.value=e.getFilterValue();
			if(f.value!=null)
				filters.push(f);
		});
		this.controller.setFilters(filters);
	}

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
			tr.className=this.classNames.row1;
			tr.dataset.row=1;
		}
		else if(row==2&&!selected){
			tr.className=this.classNames.row2;
			tr.dataset.row=2;
		}
		else if(row==1&&selected){
			tr.className=this.classNames.row1Selected;
			tr.dataset.row=1;
		}
		else{
			tr.className=this.classNames.row2Selected;
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
		this.selectedRows=[];
		let trs=this.elements.tbody.getElementsByTagName('tr');
		for(let i=0;i<trs.length;i++){
			this.selectRow(trs[i].dataset.id);
			this.changeRow(trs[i],trs[i].dataset.row,true);
		}
	}

	async refresh(){
		await this.controller.refresh();
	}

	async changeCellValue(id,name,value){
		if(this.getColumn(name).isMultiEdit&&this.selectedRows.length>1&&
			this.isRowSelected(id)){
			await this.controller.changeMultipleCellValue(this.selectedRows,name,value);
		}
		else{
			await this.controller.changeCellValue(id,name,value);
		}
	}

	async createRow(){
		await this.controller.createRow();
	}

	async deleteRows(){
		await this.controller.deleteRows(this.selectedRows);
	}

	clickLink(id,name){
		this.controller.clickLink(id,name);
	}

	clickToolbarButton(name){
		this.controller.clickToolbarButton(name);
	}

	changeToolbarSelect(name,value){
		this.controller.changeToolbarSelect(name,value);
	}

	//events
	eventClickPage(e){
		e.preventDefault();
		this.viewOffset=parseInt(e.target.dataset.viewOffset);
		this.controller.setView(this.viewSize,this.viewOffset);
		this.controller.refresh();
	}
	
	eventClickRow(e){
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
}

export class DataTableController extends Component{
	constructor(){
		super();
		this.view={};
		this.sort={};
		this.filters=[];
	}

	async refresh(){
		alert('not implemented');
	}

	async changeCellValue(id,name,value){
		alert('changeCellValue not implemented');
	}

	async changeMultipleCellValue(iDs,name,value){
		alert('changeMultipleCellValue not implemented');
	}

	async createRow(){
		alert('createRow not implemented');
	}

	async deleteRows(ids){
		alert('deleteRows not implemented');
	}

	clickToolbarButton(name){
		alert('clickToolbarButton not implemented');
	}

	changeToolbarSelect(name,value){
		alert('changeToolbarSelect not implemented');
	}

	clickLink(name,id){
		alert('clickLink not implemented');
	}

	async setFilters(filters){
		this.filters=filters;
		await this.refresh();
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

export class DataTableColumn extends Component{
	constructor(name,dp,sort=true,filter=true,multiEdit=false){
		super();
		this.name=name;
		this.dp=dp;
		this.sort=sort;
		this.filter=filter;
		this.multiEdit=multiEdit;
		this.currentFilter=null;
		this.currentSort=false;
		this.currentSortDirection=C.DIRECTION_UP;
		this.expectingElement('up','Sort up arrow.',false,DH.newWithText('span','\u21E7'))
		.expectingElement('down','Sort down arrow.',false,DH.newWithText('span','\u21E9'))
		.expectingElement('search','Search.',false,DH.newWithText('span',String.fromCodePoint(0x1F50D)))
		.expectingClassName('searchButton','',false,'search-button')
		.expectingClassName('searchOutline','',false,'search-outline')
		.expectingClassName('titleClass','',false,'search-button');
	}

	getRowId(from){
		let c=0;
		let r=from;
		while(r=r.parentNode){
			if(r.tagName.toLowerCase()=='tr'){
				return r.dataset.id;
			}
			c++;
			if(c>5){
				//this should never happen?
				throw "Gone too deep in finding rowId";
			}
		}
	}

	/**
	 * Gets name of column
	 * @returns {string} Name of column
	 */
	getName(){
		return this.name;
	}

	/**
	 * Checks if column allows multi row changes.
	 * @returns {boolean} True if you can edit multiple rows.
	 */
	isMultiEdit(){
		return this.multiEdit;
	}

	/**
	 * Attaches data table.
	 * @param {DataTable} table 
	 */
	attachToTable(table){
		this.table=table;
	}

	renderCell(container,value){

	}

	renderHeader(container){
		if(this.filter){
			let div=DH.appendNew(container,'div');
			div.className=this.classNames.searchButton;
			div.appendChild(this.elements.search.cloneNode(true));
			let sdiv=DH.appendNew(div,'div');
			sdiv.className=this.classNames.searchOutline;
			sdiv.dataset.name=this.name;
			this.renderFilter(sdiv);
		}
		let sp=DH.appendNewWithText(container,'span',
			this.dp.getPrompt(this.name));
		if(this.sort){
			sp.addEventListener('click',e=>{this.eventClickHeader(e)})
		}
		if(this.currentSort){
			if(this.currentSortDirection==C.DIRECTION_UP){
				container.appendChild(this.elements.up.cloneNode(true));
			}
			else{
				container.appendChild(this.elements.down.cloneNode(true));
			}
		}
	}

	renderFilter(container){
		
	}

	getFilterValue(){
		return this.currentFilter;
	}

	setFilterValue(value){
		this.currentFilter=value;
	}

	updateFilter(){
		this.table.updateFilters();
	}

	setSort(current,direction){
		this.currentSort=current;
		this.currentSortDirection=direction;
	}

	//events

	eventClickHeader(e){
		if(this.currentSort==true){
			if(this.currentSortDirection==C.DIRECTION_UP){
				this.currentSortDirection=C.DIRECTION_DOWN;
			}
			else{
				this.currentSortDirection=C.DIRECTION_UP;
			}
		}
		this.currentSort=true;
		this.table.setSort(this.name,this.currentSortDirection);
	}
}

export class DataTableColumnLink extends DataTableColumn{
	constructor(name,dp,sort=false,filter=false){
		super(name,dp,sort,filter,false);
	}

	renderCell(container,value){
		let a=DH.appendNewWithText(container,'a',value);
		a.href='#';
		a.addEventListener('click',e=>this.clickLink(e));
	}

	//events

	clickLink(e){
		this.table.clickLink(this.name,this.getRowId(e.target.parentNode));
	}
}

export class DataTableColumnSelect extends DataTableColumn{
	/**
	 * 
	 * @param {string} name Name of column
	 * @param {DataProperties} dp DataProperties
	 * @param {boolean} sort Column can be sorted.
	 * @param {boolean} filter Column can be filtered
	 * @param {boolean} multiEdit Column edit over multiple rows.
	 */
	constructor(name,dp,sort=true,filter=true,multiEdit=false,readOnly=false){
		super(name,dp,sort,filter,multiEdit);
		this.readOnly=readOnly;
		this.currentOptions=[];
	}

	/**
	 * Adds a select option - this overrides dp.
	 * @param {string} value value of option.
	 * @param {string} text text of option.
	 */
	addOption(value,text){
		if(!this.currentOptions){
			this.currentOptions=[];
		}
		this.currentOptions.push({
			value:value,
			text:text
		});
	}

	findOptionByValue(value){
		for(let i=0;i<this.currentOptions.length;i++){
			if(this.currentOptions[i].value==value){
				return i;
			}
		}
		return -1;
	}

	deleteOption(value){
		let i=this.findOptionByValue(value);
		if(i==-1)
			return;
		this.currentOptions.splice(i,1);
	}

	deleteAllOptions(){
		this.currentOptions=[];
	}

	makeSelect(container){
		let select=DH.appendNew(container,'select');
		this.currentOptions.forEach(e=>{
			let o=DH.appendNewWithText(select,'option',e.text);
			o.value=e.value;
		});
		return select;
	}

	renderCell(container,value){
		if(this.readOnly){
			let i=this.findOptionByValue(value);
			DH.appendText(container,this.currentOptions[i].text);
		}
		else{
			let select=this.makeSelect(container);
			select.value=value;
			select.addEventListener('change',e=>this.eventChangeCellSelect(e));
		}
	}

	renderFilter(container){
		let select=this.makeSelect(container);
		let def=DH.firstNewWithText(select,'option','--Search--');
		def.value='--Search--';
		select.addEventListener('change',e=>this.eventChangeFilterSelect(e));
		let button=DH.appendNewWithText(container,'button',C.UI_DELETE_GLYPH);
		button.type=button;
		button.addEventListener('click',e=>this.eventClickRemoveFilterButton(e));
	}

	//events

	eventChangeCellSelect(e){
		this.table.changeCellValue(this.getRowId(e.target),this.name,e.target.value);
	}

	eventChangeFilterSelect(e){
		if(e.target.value=='--Search--'){
			this.currentFilter=null;
		}
		else{
			this.currentFilter=e.target.value;
		}
		this.updateFilter();
	}

	eventClickRemoveFilterButton(e){
		e.target.parentNode.firstChild.value='--Search--';
		this.currentFilter=null;
		this.updateFilter();
	}
}

export class DataTableColumnText extends DataTableColumn{
	constructor(name,dp,sort=true,filter=true){
		super(name,dp,sort,filter,false);
	}

	renderCell(container,value){
		DH.appendText(container,value);
	}

	renderFilter(container){
		let input=this.dp.generateFormElement(this.name);
		container.appendChild(input);
		input.addEventListener('input',e=>this.eventInputFilter(e))
		let button=DH.appendNewWithText(container,'button',C.UI_DELETE_GLYPH);
		button.type=button;
		button.addEventListener('click',e=>this.eventClickRemoveFilterButton(e));
	}

	//events	
	timeoutTriggerFilter(){
		this.waiting=false;
		this.updateFilter();
	}

	eventClickRemoveFilterButton(e){
		e.target.previousSibling.value='';
		this.currentFilter=null;
		this.updateFilter();
	}

	eventInputFilter(e){
		if(e.target.value.length==0){
			this.currentFilter=null;
			window.setTimeout(()=>this.timeoutTriggerFilter(),SEARCH_DELAY);
			return;
		}
		if(!this.waiting){
			this.currentFilter=e.target.value;
			window.setTimeout(()=>this.timeoutTriggerFilter(),SEARCH_DELAY);
			this.waiting=true;
		}
	}
}

export class DataTableColumnEdit extends DataTableColumnText{
	constructor(name,dp,sort=true,filter=true,multiEdit=false){
		super(name,dp,sort,filter,false);
		this.multiEdit=multiEdit;
	}

	renderCell(container,value){
		let sp=DH.appendNewWithText(container,'span',value);
		sp.addEventListener('dblclick',e=>{this.eventDoubleClickText(e)});
	}

	//events
	eventDoubleClickText(e){
		let value=e.target.parentNode.dataset.value;
		let td=e.target.parentNode;
		DH.clearChildNodes(td);
		let input=this.dp.generateFormElement(this.name);
		td.appendChild(input);
		input.focus();
		input.value=value;
		this.blurIgnore=false;
		input.addEventListener('blur',e2=>{this.eventBlurTextEdit(e2)});
		input.addEventListener('keyup',e3=>{this.eventKeyupTextEdit(e3)});
	}

	async eventFinishEdit(e){
		await this.table.changeCellValue(this.getRowId(e.target),
			this.dp.getDataName(this.name),
			e.target.value).then(()=>{
				let td=e.target.parentNode;
				DH.clearChildNodes(td);
				td.dataset.value=e.target.value;
				this.renderCell(td,td.dataset.value);
				})
			.catch(()=>this.eventCancelEdit(e));
	}

	eventCancelEdit(e){
		let td=e.target.parentNode;
		DH.clearChildNodes(td);
		this.renderCell(td,td.dataset.value);
	}

	eventBlurTextEdit(e){
		if(!this.blurIgnore)
			this.eventFinishEdit(e);
	}

	eventKeyupTextEdit(e){
		if(e.key=='Enter'){
			this.blurIgnore=true;
			e.preventDefault();
			this.eventFinishEdit(e);
		}
		else if(e.key=='Escape'){
			this.blurIgnore=true;
			e.preventDefault();
			this.eventCancelEdit(e);
		}
	}
}


export class DataTableToolbarItem extends Component{
	/**
	 * 
	 * @param {string} name Name of component
	 */
	constructor(name){
		super();
		this.name=name;
		this.expectingClassName('spanContainer',
			'Span to hold toolbar item',false,'table-toolbar-span');
	}

	getName(){
		return this.name;
	}

	/**
	 * Attaches data table.
	 * @param {DataTable} table 
	 */
	attachToTable(table){
		this.table=table;
	}

	makeSpan(container){
		let sp=DH.appendNew(container,'span');
		sp.className=this.classNames.spanContainer;
		return sp;
	}

	/**
	 * renders item and appends to container.
	 * @param {HTMLElement} container 
	 */
	render(container){
		let sp=this.makeSpan(container);
		DH.appendText('DataTableToolbarItem class not designed to be directly used.');
	}
}

export class DataTableToolbarSelectRows extends DataTableToolbarItem{
	/**
	 * Creates select buttons
	 * @param {string} name Name of toolbar item.
	 * @param {boolean} none Select none/unselect all button.
	 * @param {boolean} all Select all button.
	 * @param {boolean} invert Invert selection *Not implemented yet*
	 */
	constructor(name,none,all,invert){
		super(name);
		this.none=none;
		this.all=all;
		this.invert=invert;
	}

	render(container){
		let sp=this.makeSpan(container);
		if(this.all){
			let all=DH.appendNewWithText(sp,'button',C.UI_SELECTALL_GLYPH);
			all.type='button';
			all.addEventListener('click',e=>this.clickAllButton(e));
		}
		if(this.none){
			let none=DH.appendNewWithText(sp,'button',C.UI_UNSELECTALL_GLYPH);
			none.type='button';
			none.addEventListener('click',e=>this.clickNoneButton(e));
		}
	}

	//events

	clickAllButton(e){
		this.table.selectAllRows();
	}
	clickNoneButton(e){
		this.table.unselectAllRows();
	}
}

export class DataTableToolbarNewDelete extends DataTableToolbarItem{
	/**
	 * Creates select buttons
	 * @param {string} name Name of toolbar item.
	 * @param {boolean} newRow New/create button.
	 * @param {boolean} deleteRow Delete button.
	 */
	constructor(name,newRow=true,deleteRow=true){
		super(name);
		this.newRow=newRow;
		this.deleteRow=deleteRow;
	}

	render(container){
		let sp=this.makeSpan(container);
		if(this.newRow){
			let newRow=DH.appendNewWithText(sp,'button',C.UI_CREATE_GLYPH);
			newRow.type='button';
			newRow.addEventListener('click',e=>this.clickCreateButton(e));
		}
		if(this.deleteRow){
			let deleteRow=DH.appendNewWithText(sp,'button',C.UI_DELETE_GLYPH);
			deleteRow.type='button';
			deleteRow.addEventListener('click',e=>this.clickDeleteButton(e));
		}
	}

	//events

	clickCreateButton(e){
		this.table.createRow();
	}
	clickDeleteButton(e){
		this.table.deleteRows();
	}
}

export class DataTableToolbarButtons extends DataTableToolbarItem{
	/**
	 * Creates buttons
	 * @param {string} name Name of toolbar item.
	 */
	constructor(name){
		super(name);
		this.buttons=[];
	}

	/**
	 * 
	 * @param {string} name Name of button to find
	 * @returns {number} Returns index of button;
	 */
	findButton(name){
		for(let i=0;i<this.buttons.length;i++){
			if(this.buttons[i].name==name)
				return i;
		}
	}

	/**
	 * Adds a button to this group.
	 * @param {string} name Name of button
	 * @param {string} prompt Label/text for button.
	 * @param {Function} callback Callback for button press.
	 * @returns {DataTableToolbarButtons} Returns this for chaining.
	 */
	addButton(name,prompt){
		this.buttons.push({
			name:name,
			prompt:prompt
		});
		return this;
	}

	/**
	 * removes a button, and refreshes table unless requested not to.
	 * @param {*} name Name of button to remove.
	 * @param {*} refresh Refresh the table if true, false otherwise.
	 */
	removeButton(name,refresh=true){
		let i=this.findButton(name);
		this.buttons.splice(i,1);
		if(refresh)
			this.table.renderHead();
	}

	render(container){
		let sp=this.makeSpan(container);
		this.buttons.forEach(e=>{
			let b=DH.appendNewWithText(sp,'button',e.prompt);
			b.type='button';
			b.dataset.name=e.name;
			b.addEventListener('click',e=>this.eventClickButton(e));
		});
	}

	//events

	eventClickButton(e){
		e.preventDefault();
		this.table.clickToolbarButton(e.target.dataset.name);
	}
}

export class DataTableToolbarSelect extends DataTableToolbarItem{
	/**
	 * Creates buttons
	 * @param {string} name Name of toolbar item.
	 * @param {Function} callback callback for when select changes, sends value of selected option.
	 * @param {string} prompt Prompt text, optional.
	 */
	constructor(name,prompt=null){
		super(name);
		this.prompt=null;
		this.options=[];
		this.select=null;
	}

	findOption(value){
		for(let i=0;i<this.options.length;i++){
			if(this.options[i].value==value)
				return i;
		}
		return -1;
	}

	addOption(value,text){
		this.options.push({
			value:value,
			text:text
		});
		if(this.select){
			this.renderOption(value,text);
		}
	}

	removeOption(value){
		let i=this.findOption(value);
		if(i==-1)
			return;
		this.options.splice(i,1);
		if(this.select){
			for(let j=0;j<this.select.childNodes.length;j++){
				if(this.select.childNodes[j].value==i){
					this.select.removeChild(this.select.childNodes[j]);
				}
			}
		}
	}

	removeAllOptions(){
		let v=this.options;
		v.forEach(e=>{
			this.removeOption(e.value);
		});
	}

	renderOption(value,text){
		let o=DH.appendNewWithText(this.select,'option',text);
		o.value=value;
	}

	render(container){
		let sp=this.makeSpan(container);
		if(this.prompt)
			DH.appendText(sp,this.prompt);
		this.select=DH.appendNew(sp,'select');
		this.select.addEventListener('change',e=>this.eventChangeSelect(e));
		this.options.forEach(e=>{
			this.renderOption(e.value,e.text);
		});
	}


	//events

	eventChangeSelect(e){
		this.table.changeToolbarSelect(this.name,e.target.value);
	}
}