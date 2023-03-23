"use strict";

import * as gc from './GerberClass.js';
import {IGerber, IGerberAperture} from './interfaces.js';

export class CircuitClass {

    c: IGerberAperture = <IGerberAperture>{};
    r: IGerberAperture = <IGerberAperture>{};
    o: IGerberAperture = <IGerberAperture>{};
    p: IGerberAperture = <IGerberAperture>{};
    m: IGerberAperture = <IGerberAperture>{};

    constructor(gerber: IGerber) {

        let obj = gerber.obj;
        let keys = Object.keys(obj);
        keys.forEach(el => {
            this[el as keyof CircuitClass] = obj[el];
        });

        
    }

}