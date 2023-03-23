"use strict";
export class CircuitClass {
    constructor(gerber) {
        this.c = {};
        this.r = {};
        this.o = {};
        this.p = {};
        this.m = {};
        let obj = gerber.obj;
        let keys = Object.keys(obj);
        keys.forEach(el => {
            this[el] = obj[el];
        });
    }
}
