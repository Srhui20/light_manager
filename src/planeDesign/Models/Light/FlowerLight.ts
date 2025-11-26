/*
 * @Author: ddlu ludd@mail.ustc.edu.cn
 * @Date: 2023-05-29 20:10:06
 * @LastEditors: ddlu ludd@mail.ustc.edu.cn
 * @LastEditTime: 2023-05-29 20:24:45
 * @FilePath: \GreenRice\src\classlibs\light\FlowerLight.ts
 * @Class: FlowerLight
 * @Description: 花灯
 */
import { Vector3 } from 'three';
import { Light } from './Light';

export class FlowerLight extends Light {
    constructor(pos: Vector3) {
        super();
        this.name = 'FlowerLight';
    }

    draw(ctx: CanvasRenderingContext2D, opt: {}): void {
        throw new Error('Method not implemented.');
    }
}
