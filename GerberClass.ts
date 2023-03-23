"use strict";

import * as fs from 'fs';
import * as readline from 'readline';
import { once } from 'events';
import { debug } from 'console';
import * as tc from './ToolkitClass.js';
import {IGerber} from './interfaces.js';

export class GerberClass {

    toolkit = new tc.ToolkitClass();
    size = { X1: 0, Y1: 0, X2: 0, Y2: 0 };
    rs274x: tc.TRS274X = [];

    readonly input: NodeJS.ReadableStream;

    count = 0;
    result: IGerber = <IGerber>{};

    constructor(input: NodeJS.ReadableStream) {
        this.input = input;
        this.input.setEncoding("utf-8");
        
        this.result = {
            obj: {
                c: {},
                r: {},
                o: {},
                p: {},
                m: {}
            }
        };

    }

    async parse() {

        let cnt = 0;

        let rl = readline.createInterface({
            input: this.input,
            crlfDelay: Infinity,
        });
        rl.on("line", (line) => {
            if (line === "") return;
            if (this.rs274x.length > 0) {
                this.parse_rs274x(line);
                return;
            }
            switch (line[0]) {
                case "%": {
                    this.parse_rs274x(line);
                    break;
                }
                case "G": {
                    this.parse_G_code(line);
                    break;
                }
                case "M":
                    this.parse_M_code(line);
                    break;
                default:{
                    this.parse_D_code(line);
                    break;
                }
            }    
            cnt++;    
        })

        await once(rl, "close");
        debug("GerberClass.parse: file closed!");

        return cnt;
    }

    sorted_by_key() {
        let arr: {} = this.result;
        type keyObjType = keyof typeof arr;
        const ordered = Object.keys(arr).sort().reduce(
            (obj, key) => {
                obj[key as keyObjType] = arr[key as keyObjType];
                return obj;
            },
            {}
        );
        return ordered;
    }

    parse_rs274x(str: string) {
        //debug(`parse_rs274x: ${str}`);
        let fullCmd: string;

        if (str.slice(-1) !== "%") {
            this.rs274x.push(str);
            return;    
        }
        if (this.rs274x.length === 0) {
            fullCmd = str.slice(0,-1);
        } else {
            const tmpCmd = this.rs274x.shift();
            const lastLine = str.slice(0,-1);
            if (lastLine !== "") this.rs274x.push(lastLine);
            if (tmpCmd == undefined) {
                debug("GerberClass.parse_rs274x: cmd not found!");
                return;
            };
            fullCmd = tmpCmd;
        }
        const cmd = fullCmd.slice(1, 3);
        
        //debug(`parse_rs274x: ${fullCmd}`);
        //debug(`parse_rs274x: ${cmd}`);

        let func = this.macroSwitcher[cmd];
        if (func == undefined) func = this.macroSwitcher["-"]; 
        func(fullCmd.slice(3));
        this.rs274x = [];
    }

    macroSwitcher: {[id: string]: any} = {
        "AD": (param: string) => { this.parse_rs274x_AD(param); },
        "AM": (param: string) => { this.parse_rs274x_AM(param); },
        "FS": (param: string) => { this.parse_rs274x_FS(param); },
        "LP": (param: string) => { this.parse_rs274x_LP(param); },
        "MO": (param: string) => { this.parse_rs274x_MO(param); },
        "-": (param: string) => { this.parse_rs274x_default(param); },
    }

    parse_rs274x_AD(param: string) {
        //debug(`parse_rs274x_AD: ${this.rs274x}`);
        const re = /^D(\d+)/g;
        let D_code = re.exec(param);
        if (D_code == null) {
            debug("GerberClass.parse_rs274x_AD: invalid D-code!");
            return;
        }
        this.toolkit.addAperture(
            parseInt(D_code[1]), 
            param.slice(D_code[0].length, -1), 
            this.rs274x
        );
    }

    parse_rs274x_AM(param: string) {
        //debug(`parse_rs274x_AM: ${this.rs274x}`);
        this.toolkit.addMacro(param.slice(0, -1), this.rs274x);
    }

    parse_rs274x_FS(param: string) {
        //debug(`parse_rs274x_FS: ${this.rs274x}`);
        const re = /(LA)|([XYIJ][0-9]+)/g;
        let LA_code = param.match(re);//re.exec(param);
        if (LA_code == null || LA_code.shift() != "LA") {
            debug("GerberClass.parse_rs274x_FS: invalid FS!");
            return;
        }
        let map = LA_code.map(el => { return {
            id: el[0], 
            pow: parseInt(el[2])
        }});
        this.toolkit.setLAFormat(map);
    }

    parse_rs274x_LP(param: string) {
        //debug(`parse_rs274x_LP: ${this.rs274x}`);
        this.toolkit.polarity = param[2];
    }

    parse_rs274x_MO(param: string) {
        //debug(`parse_rs274x_MO: ${this.rs274x}`);
        this.toolkit.unit = param.slice(0, 2);
    }

    parse_rs274x_default(param: string) {
        debug(`parse_rs274x_default: ${[param, this.rs274x]}`);
    }

    parse_G_code(G_code: string) {
        //debug(`parse_G_code: ${G_code}`);
        
        const re = /^G(\d+)/g;
        let G_array = re.exec(G_code);
        if (G_array == null) {
            debug("GerberClass.parse_G_code: invalid G-code!");
            return;
        }

        //let G_text = G_code.slice(G_array[0].length, -1);
        
        switch (G_array[1]) {
            //Move
            case "00":
                break;

            //Comment Data Block
            case "04":
                break;

            //Interpolation Mode;
            case "01":
            case "02":
            case "03":
            case "74":
            case "75":
                this.toolkit.interpolationMode = G_array[1];
                break;

            //Region mode
            case "36":
                this.toolkit.beginRegion();
                break;
            case "37":
                this.toolkit.endRegion();
                break;

            //Set unit
            case "70":
                this.toolkit.unit = tc.UNIT_IN;
                break;
            case "71":
                this.toolkit.unit = tc.UNIT_MM;
                break;

            default:
                debug(`GerberClass.parse_G_code: encountered unknown G code ${G_code}`);
                break;
        }
    }

    parse_D_code(D_code: string) {
        //debug(`parse_D_code: ${D_code}`);
        
        const re = /([XYIJD]-*[0-9]+)/g;
        let D_array = D_code.match(re);
        if (D_array == null) {
            debug("GerberClass.parse_D_code: invalid D code!");
            return;
        }

        let cmd = D_array.pop();
        if (cmd == undefined || cmd[0] != "D") {
            debug("GerberClass.parse_D_code: unknown D code!");
            return;
        }
        let map = D_array.map(el => { return {
            id: el[0], 
            value: parseInt(el.slice(1))
        }});

        cmd = cmd.slice(1);
        switch (cmd) {

            //Intarpolate
            case "01":
                this.toolkit.setNewCoordinates(map);
                if (!this.toolkit.regionMode) {
                    const {obj, data} = this.toolkit.line();
                    if (obj != undefined) {
                        let type_obj = this.result.obj[obj.type];
                        if (type_obj[obj.name] == undefined) {
                            type_obj[obj.name] = [obj.params, []];
                        }
                        type_obj[obj.name][1].push(data);
                        this.count++;
                    }
                }
                this.toolkit.applyNewCoordinates();
                this.updateSize();
                break;

            //Move
            case "02":
                //console.log("D02");
                this.toolkit.setNewCoordinates(map);
                if (this.toolkit.regionMode) {
                    //this.toolkit.addRegionPoint(null, "MoveTo");  
                }
                this.toolkit.applyNewCoordinates();
                this.updateSize();
                break;

            //Flash
            case "03":
                //console.log("D03");
                this.toolkit.setNewCoordinates(map);
                if (!this.toolkit.regionMode) {
                    const {obj, data} = this.toolkit.flash();
                    if (obj != undefined) {
                        let type_obj = this.result.obj[obj.type];
                        if (type_obj[obj.name] == undefined) {
                            type_obj[obj.name] = [obj.params, []];
                        }
                        type_obj[obj.name][1].push(data);
                        this.count++;
                    }
                }
                this.toolkit.applyNewCoordinates();
                this.updateSize();
                break;

            case "04":
            case "05":
            case "06":
            case "07":
            case "08":
            case "09":
                debug(`GerberClass.parse_D_code: reserved D code ${D_code}!`);
                break;

            default:{
                this.toolkit.selectAperture(parseInt(cmd));
                break;
            }
        }

    }

    parse_M_code(M_code: string) {
        debug(`parse_M_code: ${M_code}`);
    }

    updateSize() {
        this.size.X1 = this.size.X1 == undefined ? this.toolkit.currentCoordinate.X : (this.size.X1 > this.toolkit.currentCoordinate.X ? this.toolkit.currentCoordinate.X : this.size.X1);
        this.size.Y1 = this.size.Y1 == undefined ? this.toolkit.currentCoordinate.Y : (this.size.Y1 > this.toolkit.currentCoordinate.Y ? this.toolkit.currentCoordinate.Y : this.size.Y1);
        this.size.X2 = this.size.X2 == undefined ? this.toolkit.currentCoordinate.X : (this.size.X2 < this.toolkit.currentCoordinate.X ? this.toolkit.currentCoordinate.X : this.size.X2);
        this.size.Y2 = this.size.Y2 == undefined ? this.toolkit.currentCoordinate.Y : (this.size.Y2 < this.toolkit.currentCoordinate.Y ? this.toolkit.currentCoordinate.Y : this.size.Y2);
    }
}
