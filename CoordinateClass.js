"use strict";
export class CoordinateClass {
    constructor(X, Y) {
        this.X = X;
        this.Y = Y;
    }
    copy() {
        return new CoordinateClass(this.X, this.Y);
    }
}
