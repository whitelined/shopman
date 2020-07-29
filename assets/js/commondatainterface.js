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
		this.currentQuery={action:'update',set:{}};
		return this;
	}

	get(){
		this.currentQuery={action:'get'};
		return this;
	}

	delete(){
		this.currentQuery={action:'delete'};
		return this;
	}

	set(column,value){
		this.currentQuery.set[column]=value;
		return this;
	}

	columns(columns){
		if(columns instanceof Array){
			this.currentQuery.columns=columns;
		}
		else if(typeof columns==='string'){
			this.currentQuery.columns=[columns];
		}
		else{
			this.currentQuery.columns=[];
		}
		return this;
	}

	values(values){
		let v=values;
		if(!(values in this.currentQuery)){
			this.currentQuery.values=[];
		}
		let remove=[];
		for(const k in v){
			if(this.currentQuery.columns.find(e=>k==e)===undefined)
				remove.push(k);
		}
		remove.forEach(e=>{delete v[e]});
		this.currentQuery.values.push(v);
		return this;
	}

	where(name,comparison,operator=null){
		if(!this.currentQuery.filters){
			this.currentQuery.filters={};
		}
		let filter={};
		filter.comparison=comparison;
		if(operator!=null)
			filter.operator=operator;
		this.currentQuery.filters[name]=filter;
		return this;
	}

	order(by,direction='ASC'){
		if(!this.currentQuery.order){
			this.currentQuery.order=[];
		}
		this.currentQuery.order.push({by:by,direction:direction});
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
		try{
			let r=await fetch(this.objectUrl,
			{method:'post',headers:{'Content-Type':'application/json'},
			body:JSON.stringify(this.currentQuery)});
			if(!r.ok)
				throw new Error(r.statusText);
			let d=await r.json();
			if(!d.ok){
				this.systemError(d.code,d.text);
				return false;
			}
			if(d.queryResponseCode!==QUERY_OK){
				this.queryError(d.queryResponseCode);
				return false;
			}
			this.currentData=d;
		}
		catch(e){
			console.log(e);
			alert('Exception: '+e);
			throw e;
		}
	}

	systemError(code,message){
		let msg;
		if(code>=1000){
			msg='Server error ('+code+'): '+message;
		}
		else{
			msg='Client error ('+code+'): '+message;
		}
		console.log(msg);
		alert(msg);
	}

	queryError(code){
		let msg='Query did not complete ('+code+'): '+queryErrors[code];
		console.log(msg);
		alert(msg);
	}
}