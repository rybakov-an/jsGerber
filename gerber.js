"use strict";

import { fileURLToPath } from 'url';
import { dirname, sep } from 'path';
import fs from 'fs';
import * as gc from './GerberClass.js';
import {CircuitClass} from './CircuitClass.js';

console.time('process');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let arhiveFile = "ЛТ-687263015-04.7z";
let gerberFile = "ЛТ-687263015-04 gerber.GTL"; 
//let gerberFile = "ЛТ-687263015-04 gerber.GM2"; 

let gerberPath = __dirname + sep + "temp" + sep + arhiveFile + sep + "Gerber" + sep + gerberFile;
console.timeLog('process');
const fileStream = fs.createReadStream(gerberPath);

function getJSON(obj) {
    let json = JSON.stringify(obj);
    const re = /(\.\d+?)00+\d+/g;
    return json.replace(re, '$1');
}

async function parse() {
    let gerber = new gc.GerberClass(fileStream);
    console.timeLog('process');
    let cnt = await gerber.parse();
    let result = gerber.sorted_by_key();
    console.timeLog('process');
    let circuit = new CircuitClass(result);
    console.log(circuit);
    console.log(cnt);

    let json = getJSON(result);
    fs.writeFileSync("out.json", json);
 }

//debug(fileContent[0]);

parse();



