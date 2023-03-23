"use strict";
class CustomApertureClass {
    constructor(id, param) {
        this.name = "";
        this.type = "-";
        this.id = id;
    }
    get params() { return {}; }
    line(previous, current) {
        return null;
    }
    flash(current) {
        return null;
    }
}
export class CircleApertureClass extends CustomApertureClass {
    constructor(id, param) {
        super(id, param);
        this.type = "c";
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
    line(previous, current) {
        return [
            current.X,
            current.Y,
            previous.X,
            previous.Y
        ];
    }
    flash(current) {
        return [
            current.X,
            current.Y
        ];
    }
}
export class RectangleApertureClass extends CustomApertureClass {
    constructor(id, param) {
        super(id, param);
        this.type = "r";
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
    flash(current) {
        return [
            current.X,
            current.Y
        ];
    }
}
export class ObroundApertureClass extends CustomApertureClass {
    constructor(id, param) {
        super(id, param);
        this.type = "o";
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
    flash(current) {
        return [
            current.X,
            current.Y
        ];
    }
}
export class RegularPolygonApertureClass extends CustomApertureClass {
    constructor(id, param) {
        super(id, param);
        this.type = "p";
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
    flash(current) {
        return [
            current.X,
            current.Y
        ];
    }
}
export class MacroApertureClass extends CustomApertureClass {
    constructor(id, param) {
        super(id, param);
        this.type = "m";
        this.content = param.map(str => {
            return str.slice(0, -1).split(",").map(el => {
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
    flash(current) {
        return [
            current.X,
            current.Y
        ];
    }
}
export class RigionApertureClass extends CustomApertureClass {
    constructor(id) {
        super(id);
        this.type = "g";
    }
    get params() {
        return {
            t: this.type,
            n: this.name,
            c: this.content
        };
    }
    addPoint(current, mode) {
        //console.log("default addPoint");
    }
}
