import * as DP from './dataproperties.js';

const QUERY_OK=0;
const QUERY_INSERT_FAIL_DUPLICATE=1;
const QUERY_UPDATE_NOTHING_CHANGED=2;
const QUERY_DELETE_NOTHING_DELETE=3;

let queryErrors={
	0: 'Fine',
	1: 'Duplicate value exists in column.',
	2: 'Value was not changed.',
	3: 'Nothing deleted.'
};

export class CommonDataInterface{
	constructor(name,objectUrl){
		this.name=name;
		this.objectUrl=objectUrl;
		this.currentData=null;
	}

	insert(){
		this.currentQuery={action:'insert'};
		return this;
	}

	update(){
		this.currentQuery={action:'update',set:[]};
		return this;
	}

	get(){
		this.currentQuery={action:'get',parameters:[]};
		return this;
	}

	delete(){
		this.currentQuery={action:'delete'};
		return this;
	}

	set(parameter,value){
		this.currentQuery.set.push([parameter,value]);
		return this;
	}

	parameters(p){
		if(p instanceof Array){
			this.currentQuery.parameters.concat(p);
		}
		else if(typeof p==='string'&&p!='*'){
			this.currentQuery.parameters.push(p);
		}
		else{
			this.currentQuery.parameters='*';
		}
		return this;
	}

	values(values){
		if('values' in this.currentQuery===false){
			this.currentQuery.values=[];
		}
		this.currentQuery.values.push(values);
		return this;
	}

	filters(filters,dp,callback=null){
		for(let i=0;i<filters.length;i++){
			let type=dp.getType(filters[i].name);
			let comp;
			let operator;
			if(type==DP.TYPE_INT){
				comp=filters[i].value;
				operator='=';
			}
			else{
				comp='%'+filters[i].value+'%';
				operator='ILIKE';
			}
			this.filter(filters[i].name,operator,comp);
		}
		return this;
	}

	filter(name,operator,comparison){
		if(!this.currentQuery.filters){
			this.currentQuery.filters=[];
		}
		let filter=[];
		filter.push(name);
		filter.push(operator);
		filter.push(comparison);
		this.currentQuery.filters.push(filter);
		return this;
	}

	sort(by,direction='ASC'){
		if(!this.currentQuery.sort){
			this.currentQuery.sort=[];
		}
		this.currentQuery.sort.push([by,direction]);
		return this;
	}

	limit(limit=null,offset=null){
		if(limit!=null){
			this.currentQuery.limit=limit;
		}
		if(offset!=null){
			this.currentQuery.offset=offset;
		}
		return this;
	}

	/**
	 * Gets the data from the last send request.
	 * @returns {object} Data returned, or false if non.
	 */
	getData(){
		if(!this.currentData.data)
			return false;
		return this.currentData.data;
	}

	/**
	 * Gets the size of the data from the last send request.
	 * @returns {int} Size of data, or false if non.
	 */
	getDataSize(){
		if(!this.currentData.size)
			return false;		
		return this.currentData.size;
	}

	/**
	 * Gets the total size of the data source from the last send request.
	 * @returns {int} Size of source data, or false if non.
	 */
	getTotalSize(){
		if(!this.currentData.totalSize)
			return false;		
		return this.currentData.totalSize;
	}

	async send(){
		this.currentData=null;
		try{
			let r=await fetch(this.objectUrl,
			{method:'post',headers:{'Content-Type':'application/json'},
			body:JSON.stringify(this.currentQuery)});
			if(!r.ok)
				throw r.statusText;
			let d=await r.json();
			if(!d.ok){
				throw this.systemError(d.code,d.text);
			}
			if(d.queryResponseCode!==QUERY_OK){
				throw this.queryError(d.queryResponseCode);
			}
			this.currentData=d;
			return this.currentData.data;
		}
		catch(e){
			console.log(e);
			alert('Exception: '+e);
			throw e;
		}
	}

	systemError(code,message){
		if(code>=1000){
			return 'System Error: Server error ('+code+'): '+message;
		}
		else{
			return 'System Error: Client error ('+code+'): '+message;
		}
	}

	queryError(code){
		return 'Query error: Query did not complete ('+code+'): '+queryErrors[code];
	}
}