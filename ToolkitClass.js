"use strict";
import { debug } from 'console';
import * as ap from './aperture.js';
import { CoordinateClass } from "./CoordinateClass.js";
export const APERTURE_MAX = 9999;
export const UNIT_MM = "MM";
export const UNIT_IN = "const";
;
export class ToolkitClass {
    constructor() {
        this._currentId = -1;
        this._apertureDictionary = {};
        this._templateDictionary = {};
        //coordinateFormat = "Absolute";
        this.coordinateFormat = { X: -1, Y: -1, I: -1, J: -1 };
        this._currentCoordinate = new CoordinateClass(0, 0);
        this._newCoordinate = {};
        this.region = undefined;
        this._unit = UNIT_MM;
        this.polarity = "C";
        this.interpolationMode = "Linear";
    }
    get currentCoordinate() { return this._currentCoordinate; }
    set unit(value) {
        if (value != UNIT_MM || value != UNIT_MM) {
            debug(`ToolkitClass.set.unit: unknown unit value: ${value}`);
        }
        this._unit = value;
    }
    ;
    get unit() { return this._unit; }
    ;
    get regionMode() { return this.region != undefined; }
    ;
    addAperture(id, name, param) {
        let token = name.split(",");
        if (token.length > 1) {
            let aperture;
            switch (token[0]) {
                case "C":
                    aperture = new ap.CircleApertureClass(id, token[1]);
                    break;
                case "O":
                    aperture = new ap.ObroundApertureClass(id, token[1]);
                    break;
                case "P":
                    aperture = new ap.RegularPolygonApertureClass(id, token[1]);
                    break;
                case "R":
                    aperture = new ap.RectangleApertureClass(id, token[1]);
                    break;
                default:
                    debug(`ToolkitClass.addAperture: found unknown aperture: ${name}`);
                    return null;
            }
            this._apertureDictionary[id] = aperture;
            return aperture;
        }
        else {
            if (this._templateDictionary[name] != undefined) {
                let aperture = new ap.MacroApertureClass(id, this._templateDictionary[name]);
                this._apertureDictionary[id] = aperture;
                return aperture;
            }
            else {
                debug(`ToolkitClass.addAperture: unknown macro aperture: ${name}`);
                return null;
            }
        }
    }
    addMacro(name, param) {
        this._templateDictionary[name] = param;
    }
    beginRegion() {
        //debug("ToolkitClass.beginRegion: begin region statement");
        this.region = new ap.RigionApertureClass(0);
    }
    addRegionPoint(current, mode) {
        if (this.region == undefined) {
            debug("ToolkitClass.addRegionPoint: unset region!");
            return;
        }
        this.region.addPoint(current, mode);
    }
    endRegion() {
        if (this.region == undefined) {
            debug("ToolkitClass.endRegion: unset region!");
            return;
        }
        let result = this.region.flash();
        this.region = undefined;
        return result;
    }
    selectAperture(id) {
        if (id < 10 || id > APERTURE_MAX || this._apertureDictionary[id] == undefined) {
            debug("ToolkitClass.selectAperture: aperture is empty!");
            this._currentId = -1;
        }
        this._currentId = id;
    }
    get currentAperture() {
        let currentAperture = this._apertureDictionary[this._currentId];
        if (currentAperture == undefined) {
            debug("ToolkitClass.currentAperture: is empty!");
        }
        return currentAperture;
    }
    setLAFormat(FS_array) {
        FS_array.forEach(el => {
            this.coordinateFormat[el.id] = 1 / Math.pow(10, el.pow);
        });
        if (this.coordinateFormat["I"] === -1)
            this.coordinateFormat["I"] = this.coordinateFormat["X"];
        if (this.coordinateFormat["J"] === -1)
            this.coordinateFormat["J"] = this.coordinateFormat["Y"];
    }
    setNewCoordinates(D_array) {
        this._newCoordinate = this._currentCoordinate.copy();
        D_array.forEach(el => {
            this._newCoordinate[el.id] = el.value * this.coordinateFormat[el.id];
        });
        return this._newCoordinate;
    }
    applyNewCoordinates() {
        this._currentCoordinate = this._newCoordinate;
    }
    line() {
        let currentAperture = this.currentAperture;
        if (currentAperture == undefined)
            return { type: undefined, date: [] };
        return {
            obj: currentAperture,
            data: currentAperture.line(this._currentCoordinate, this._newCoordinate)
        };
    }
    flash() {
        let currentAperture = this.currentAperture;
        if (currentAperture == undefined)
            return { type: undefined, date: [] };
        return {
            obj: currentAperture,
            data: currentAperture.flash(this._newCoordinate)
        };
    }
}
