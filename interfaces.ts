"use strict";

export interface ICoordinate {
    X: number;
    Y: number;
    copy(): ICoordinate;
}

export interface IApertureParams {
    t: string;
    n: string;
    [key: string]: any
}

export interface IAperture {
    readonly id: number;
    readonly name: string;
    readonly type: string;
    get params(): IApertureParams;
    line(previous: ICoordinate, current: ICoordinate): any;
    flash(current?: ICoordinate): any;
}

export interface IGerberAperture {
    [key: string]: [IApertureParams, any[][]]
}

interface IGerberGroup {
    [key: string]: IGerberAperture
}

export interface IGerber {
    obj: IGerberGroup
}

