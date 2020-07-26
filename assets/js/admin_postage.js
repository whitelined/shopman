import {CommonDataInterface as CDI, CommonDataInterface} from './commondatainterface.js';
import {PostageTyper} from './postagetyper.js';
import {PostageTable} from './postagetable.js';

let pCDI=new CommonDataInterface('Postage','/api/Postage');
let pTyper=new PostageTyper();
let pTable=new PostageTable(pTyper,pCDI);