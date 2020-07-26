const colSplit=true;
const rowSplit=false;

class SplitContainer
{
	constructor(containerElement,type,options){
		this.type=type;
		this.container=containerElement;
		this.cells=new Array();
		this.splitterLength=
			('splitterLength' in options)?options.splitterLength:10;
		this.col=('colClass' in options)?options.colClass:'colsplit';
		this.row=('rowClass' in options)?options.rowClass:'rowsplit';
		this.calcContainerLength();
		this.events={mousemove:(e)=>{this.mouseMoveEvent(e,this);}};
	}

	calcContainerLength(){
		this.containerLength=(this.type==colSplit)?this.container.offsetHeight:
			this.container.offsetWidth;
	}

	calcContentLength(){
		if(this.cells.length>0)
		{
			this.contentLength=this.containerLength-
				(this.cells.length-1)*this.splitterLength;
		}
		else
			this.contentLength=this.containerLength;
	}
	
	calcCellPercentageWidths(){
		let percent=100/this.contentLength;
		let left=100;
		//let output='Percentages: ';
		for(let i=0;i<this.cells.length;i++)
		{
			if((i+1)<this.cells.length){
				this.cells[i].percentageLength=
					percent*this.cells[i].currentLength;
				left-=this.cells[i].percentageLength;
			}
			else
				this.cells[i].percentageLength=left;
			//output+=i+':'+this.cells[i].percentageLength+' ';
		}
		//console.log(output);
	}

	addCell(contentElement,minLength,percentageLength){
		this.cells.push({
			contentElement:contentElement,
			minLength:minLength,
			percentageLength:percentageLength,
			currentLength:0
		});
	}

	generate(){
		this.calcContentLength();
		if(this.cells.length<2)
			throw 'Insufficient cell number: '+this.cells.length;
		this.container.style.display="flex";
		if(this.type==colSplit)
		{
			this.container.style.flexDirection="column";
		}
		else
		{
			this.container.style.flexDirection="row";
		}
		window.addEventListener('resize',e=>this.resizeEvent(e,this));
		for(let i=0;i<this.cells.length;i++)
		{
			if((i+1)<this.cells.length)
			{
				this.container.appendChild(this.cells[i].contentElement);
				this.container.appendChild(this.makeSplitter(i,(i+1)));
			}
			else
			{
				this.container.appendChild(this.cells[i].contentElement);
			}
		}
		this.resizeElements();
	}
	
	resizeElements(){
		var left=this.contentLength;
		var percent=this.contentLength/100;
		for(let i=0;i<this.cells.length;i++)
		{
			if((i+1)<this.cells.length)
			{
				let k=Math.floor(this.cells[i].percentageLength*percent);
				this.cells[i].contentElement.style.flexBasis=k+'px';
				left-=k;
				this.cells[i].currentLength=k;
				this.cells[i].contentElement.style.flexBasis=k+'px';
			}
			else
			{
				this.cells[i].currentLength=left;
				this.cells[i].contentElement.style.flexBasis=left+'px';
			}
		}
	}

	clearContainer(){
		DH.clearChildNodes(this.container);
	}

	makeSplitter(before, after){
		var e=document.createElement('div');
		e.className=(this.type==colSplit)?this.col:this.row;
		e.dataset.before=before;
		e.dataset.after=after;
		e.addEventListener('mousedown',e=>this.mouseDownEvent(e,this),
			{once:true});
		return e;
	}
	

	resizeEvent(e,obj){
		obj.calcContainerLength();
		obj.calcContentLength();
		obj.resizeElements();
	}

	mouseMoveEvent(e,obj){
		e.stopPropagation();
		let diff=0;
		let before=obj.events.targetSplit.dataset.before;
		let after=obj.events.targetSplit.dataset.after;
		if(obj.type==colSplit)
			diff=Math.floor(obj.events.mousePrev.y-e.screenY);
		else
			diff=Math.floor(obj.events.mousePrev.x-e.screenX);
		if(diff>0)//up/left
		{
			let beforeLength=
				obj.cells[before].currentLength-diff;
			if(beforeLength<obj.cells[before].minLength){
				beforeLength=obj.cells[before].minLength;
			}
			obj.cells[after].currentLength=
			obj.cells[after].currentLength+
			obj.cells[before].currentLength-
				beforeLength;
			obj.cells[before].currentLength=beforeLength;
			obj.cells[before].contentElement.style.flexBasis=
				obj.cells[before].currentLength+'px';
			obj.cells[after].contentElement.style.flexBasis=
				obj.cells[after].currentLength+'px';
		}
		else if(diff<0)//down/right
		{
			let afterLength=
				obj.cells[after].currentLength+diff;
			if(afterLength<obj.cells[after].minLength){
				afterLength=obj.cells[after].minLength;
			}
			obj.cells[before].currentLength=
			obj.cells[before].currentLength+
			obj.cells[after].currentLength-
				afterLength;
			obj.cells[after].currentLength=afterLength;
			obj.cells[after].contentElement.style.flexBasis=
				obj.cells[after].currentLength+'px';
			obj.cells[before].contentElement.style.flexBasis=
				obj.cells[before].currentLength+'px';
		}
		else{

		}
		obj.events.mousePrev={x:e.screenX,y:e.screenY};
		this.calcCellPercentageWidths();
	}
	
	mouseUpEvent(e,obj){
		e.stopPropagation();
		window.removeEventListener('mousemove',obj.events.mousemove);
		obj.events.targetSplit.addEventListener('mousedown',
			e=>this.mouseDownEvent(e,this),{once:true});
	}

	mouseDownEvent(e,obj){
		e.stopPropagation();
		obj.events.mousePrev={x:e.screenX,y:e.screenY};
		obj.events.targetSplit=e.target;
		window.addEventListener('mousemove',obj.events.mousemove);
		window.addEventListener('mouseup',e2=>{obj.mouseUpEvent(e2,obj);});
	}
}
