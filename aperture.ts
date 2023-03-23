"use strict";
import { CoordinateClass } from "./CoordinateClass";
import { IAperture, IApertureParams } from './interfaces.js';

abstract class CustomApertureClass implements IAperture {

    id: number;
    name: string = "";
    type: string = "-";

    constructor(id: number, param?: any){
        this.id = id;
    }

    get params() { return <IApertureParams>{}; }
    
    line(previous: CoordinateClass, current: CoordinateClass): any {
        return null;
    }

    flash(current?: CoordinateClass): any {
        return null;
    }

}

export class CircleApertureClass extends CustomApertureClass {
    
    declare id: number;
    declare name: string;
    readonly type: string = "c";
    readonly diametr: number;
    readonly radius: number;

    constructor(id: number, param: string){
        super(id, param);
        this.diametr = parseFloat(param.split("X")[0]);
        this.radius = this.diametr / 2;
        this.name = this.radius.toFixed(3);
    }

    get params() { 
        return { 
            t: this.type, 
            n: this.name, 
            r: this.radius 
        }; 
    }

    line(previous: CoordinateClass, current: CoordinateClass) {
        return [
            current.X, 
            current.Y,
            previous.X, 
            previous.Y
        ];
    }

    flash(current: CoordinateClass) {
        return [
            current.X, 
            current.Y
        ];
    }

}

export class RectangleApertureClass extends CustomApertureClass {
    
    declare id: number;
    declare name: string;
    readonly type: string = "r";
    readonly sizes: number[];

    constructor(id: number, param: string){
        super(id, param);
        this.sizes = param.split("X").map(el => parseFloat(el));
        this.name = this.sizes.map(el => el.toFixed(3)).join("x");
    }

    get params() { 
        return { 
            t: this.type, 
            n: this.name, 
            s: this.sizes 
        }; 
    }

    flash(current: CoordinateClass) {
        return [
            current.X, 
            current.Y
        ];
    }

}

export class ObroundApertureClass extends CustomApertureClass {
    
    declare id: number;
    declare name: string;
    readonly type: string = "o";
    readonly sizes: number[];

    constructor(id: number, param: string){
        super(id, param);
        this.sizes = param.split("X").map(el => parseFloat(el));
        this.name = this.sizes.map(x => x.toFixed(3)).join("x");
    }

    get params() { 
        return { 
            t: this.type, 
            n: this.name, 
            s: this.sizes 
        }; 
    }

    flash(current: CoordinateClass) {
        return [
            current.X, 
            current.Y
        ];
    }

}

export class RegularPolygonApertureClass extends CustomApertureClass {
    
    declare id: number;
    declare name: string;
    readonly type: string = "p";
    readonly sizes: number[];

    constructor(id: number, param: string){
        super(id, param);
        this.sizes = param.split("X").map(el => parseFloat(el));
        this.name = this.sizes.map(x => x.toFixed(3)).join("x");
    }

    get params() { 
        return { 
            t: this.type, 
            n: this.name, 
            s: this.sizes 
        }; 
    }

   flash(current: CoordinateClass) {
        return [
            current.X, 
            current.Y
        ];
    }

}

export class MacroApertureClass extends CustomApertureClass {
    
    declare id: number;
    declare name: string;
    readonly type: string = "m";
    readonly content: number[][];

    constructor(id: number, param: Array<string>){
        super(id, param);
        this.content = param.map(str => {
            return str.slice(0,-1).split(",").map(el => { 
                return parseFloat(el);
            });
        });
        this.name = "M" + this.id.toString();
    }

    get params() { 
        return { 
            t: this.type, 
            n: this.name, 
            c: this.content 
        }; 
    }

    flash(current: CoordinateClass) {
        return [
            current.X, 
            current.Y
        ];
    }

}

export class RigionApertureClass extends CustomApertureClass {
    
    declare id: number;
    declare name: string;
    readonly type: string = "g";
    readonly content: any;

    constructor(id: number){
        super(id);
    }

    get params() { 
        return { 
            t: this.type, 
            n: this.name, 
            c: this.content 
        }; 
    }

    addPoint(current: CoordinateClass, mode: any) {
        //console.log("default addPoint");
    }

}

