export class DH
{
	static appendClone(e,c){
		let n=c.cloneNode(true);
		e.appendChild(n);
		return n;
	}

	static newSelect(options){
		let n=document.createElement('select');
		for(let i in options){
			let op=DH.appendNewWithText(n,'option',options[i]);
			op.value=i;
		}
		return n;
	}

	static appendNewSelect(e,options){
		return e.appendChild(DH.newSelect(options));
	}

	static clearChildNodes(e){
		while(e.firstChild){
			e.removeChild(e.firstChild);
		}
		return e;
	}

	static appendNewWithFormattedText(e,tag,text){
		let n=document.createElement(tag);
		let l=text.split('\n');
		for(let i=0,j=1;i<l.length;i++,j++){
			n.appendChild(document.createTextNode(l[i]));
			if(j!=l.length)
				n.appendChild(document.createElement('br'));
		}
		e.appendChild(n);
		return n;
	}

	static newWithFormattedText(tag,text){
		let n=document.createElement(tag);
		let l=text.split('\n');
		for(let i=0,j=1;i<l.length;i++,j++){
			n.appendChild(document.createTextNode(l[i]));
			if(j!=l.length)
				n.appendChild(document.createElement('br'));
		}
		return n;
	}

	static newWithText(tag,text){
		let n=document.createElement(tag);
		n.appendChild(document.createTextNode(text));
		return n;
	}

	/**
	 * Creates new element as firstChild of parent.
	 * @param {HTMLElement} e Parent element to put new element in.
	 * @param {string} tag Name of new element to create.
	 * @returns {HTMLElement} Returns new element.
	 */
	static firstNew(e,tag){
		let n=document.createElement(tag);
		e.insertBefore(n,e.firstChild);
		return n;
	}

	/**
	 * Creates new element, with text, as firstChild of parent.
	 * @param {HTMLElement} e Parent element to put new element in.
	 * @param {string} tag Name of new element to create.
	 * @returns {HTMLElement} Returns new element.
	 */
	static firstNewWithText(e,tag,text){
		let n=document.createElement(tag);
		n.appendChild(document.createTextNode(text));
		e.insertBefore(n,e.firstChild);
		return n;
	}

	static appendNewBefore(e,tag,b){
		let n=document.createElement(tag);
		e.insertBefore(n,b);
		return n;
	}

	static appendNew(e,tag){
		let n=document.createElement(tag);
		e.appendChild(n);
		return n;
	}

	static appendNewWithText(e,tag,text){
		let n=document.createElement(tag);
		n.appendChild(document.createTextNode(text));
		e.appendChild(n);
		return n;
	}

	static appendText(e,text){
		e.appendChild(document.createTextNode(text));
		return e;
	}

	static toJson(...vars){
		let obj={};
		let s=false;
		let key;
		for(let i=0;i<vars.length;i++){
			if(!s){
				if(typeof vars[i]==='object'){
					for(let k in vars[i]){
						obj[k]=vars[i][k];
					}
				}
				else{
					s=true;
					key=vars[i];
				}
			}
			else{
				obj[key]=vars[i];
				s=false;
				key=false;
			}
		}
		return JSON.stringify(obj);
	}

}
