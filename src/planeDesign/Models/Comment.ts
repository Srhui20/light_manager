import { Vector3 } from 'three';

export class Comment {
    _point0: Vector3;
    _point1: Vector3;
    _text: string;
    _font_size: number;
    _nor: Vector3;

    _font_color: number[]
    constructor(p0?: Vector3, p1?: Vector3) {
        this._point0 = p0 ? p0.clone() : new Vector3();
        this._point1 = p1 ? p1.clone() : new Vector3();
        this._text = '';
        this._font_size = 10;
        this._font_color = [255,255,255]
        this.updateNor();
    }

    updateNor() {
        if (this._point1.y < this._point0.y) {
            this._nor = new Vector3(0, -1, 0);
        } else {
            this._nor = new Vector3(0, 1, 0);
        }
    }
}
