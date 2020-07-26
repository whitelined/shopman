import {Typer} from './typer.js';
import * as CON from './constants.js'

export class PostageTyper{
	constructor(){
		this.typer=new Typer();
		this.typer.addInteger(CON.POSTAGE_ID,0,'Postage ID',
			null);
		this.typer.addString(CON.POSTAGE_NAME,'-','Postage Name','Must be 2-100 characters',2,100)
	}

	/**
	 * @returns {Typer} Returns typer.
	 */
	getTyper(){
		
	}
}