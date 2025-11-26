import { Vector3 } from "three";

export class Model {
    center: Vector3;
    name: string;
    _is_checked: boolean;
    description: string;

    constructor() {}

    draw(ctx: CanvasRenderingContext2D, opt: {}): void {}
    _copy(model: any): any {}
    _clone(): any {}
}
