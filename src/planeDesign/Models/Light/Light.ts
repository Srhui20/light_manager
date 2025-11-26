/*
 * @Author: ddlu ludd@mail.ustc.edu.cn
 * @Date: 2023-05-29 19:56:53
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-15 18:40:08
 * @FilePath: \GreenRice\src\classlibs\light\Light.ts
 * @Class: Light
 * @Description: 灯类的基类
 */

//@ts-nocheck
import { Vector3 } from 'three';
import { Model } from '../Model';
import { CeilingLight } from './CeilingLight';
import { PVertex } from '../PVertex';

export class Light extends Model {

    _light_intensity: number

    // _light_size: number;
    _pickup_arc_radius: number;
    vertices: PVertex[];

    _is_checked: boolean;

    _light_width: number
    _light_height: number

    _light_color: number[]

    constructor() {
        super();
        this.vertices = [];
        this._pickup_arc_radius = 15;
        // this._light_size = 1;
        this._is_checked = false;
        this._light_intensity = 10;
        
    }

    get color (){
        return this._light_color
    }

    set color(val){
        this._light_color = [...val, Math.round(255 * 0.5)]
    }

    draw(ctx: CanvasRenderingContext2D, opt: {}): void {}
    get x() {
        return this.center.x;
    }
    get y() {
        return this.center.y;
    }
    set x(val) {
        this.center.x = val;
    }
    set y(val) {
        this.center.y = val;
    }

    isPickable(x: number, y: number): boolean {}
    // _copy(light: Light): Light{return new Light()};
    // _clone(): Light {return new Light()._copy(this)}
    _copy(light: any): any {}
    _clone(): any {}
    makeHaloArea(ctx: CanvasRenderingContext2D);
}
