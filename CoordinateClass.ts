"use strict";

import { ICoordinate } from './interfaces.js';

export class CoordinateClass implements ICoordinate {

    X: number;
    Y: number;
    
    constructor(X: number, Y: number) {
        this.X = X;
        this.Y = Y;
    }

    copy(): CoordinateClass {
        return new CoordinateClass(this.X, this.Y);
    }

}
