/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-05 11:07:21
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-15 10:28:59
 * @FilePath: \green-rice\src\planeDesign\models\light\LightFactory.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { Vector3 } from 'three';
import { SpotLight } from './SpotLight';
import { DownLight } from './DownLight';
import { CeilingLight } from './CeilingLight';
import { StripLight } from './StripLight';
import { DoubleHeadDownLight } from './DoubleHeadDownLight';
import { FlowerLight } from './FlowerLight';

export enum LightType {
    Spot,
    Down,
    Ceiling,
    Strip,
    DoubleHeadDown,
    Flower
}

export class LightFactory {
    center: Vector3;
    constructor(p: Vector3) {
        this.center = p.clone();
    }
    createLight(type: number) {
        switch (type) {
            case LightType.Spot:
                return new SpotLight(this.center);
            case LightType.Down:
                return new DownLight(this.center);
            case LightType.Ceiling:
                return new CeilingLight(this.center);
            case LightType.Strip:
                return new StripLight(this.center);
            case LightType.DoubleHeadDown:
                return new DoubleHeadDownLight(this.center);
            case LightType.Flower:
                return new FlowerLight(this.center);
        }
    }
}
