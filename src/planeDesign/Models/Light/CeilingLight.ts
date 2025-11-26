/*
 * @Author: ddlu ludd@mail.ustc.edu.cn
 * @Date: 2023-05-29 20:10:06
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-29 09:32:56
 * @FilePath: \GreenRice\src\classlibs\light\CeilingLight.ts
 * @Class: CeilingLight
 * @Description: 吸顶灯
 */
import { Vector3 } from 'three';
import { Light } from './Light';
import { Painter } from '../../Painter';
import { FILTER } from '../../EditManager';
import { PVertex } from '../PVertex';

export class CeilingLight extends Light {
    center: Vector3;
    _grad_radius: number;

    constructor(pos: Vector3) {
        super();
        this.center = pos.clone();
        this.name = 'CeilingLight';
        this._light_width = this._light_height = 15;
        this._grad_radius = 13;
        this._light_color = [255, 255, 255, Math.round(255 * 0.5)];

        this.updateVertices();
        this.description = `${this.name} ${this._light_width}*${this._light_height}`;
    }

    get gradRadius() {
        return this._grad_radius * this._light_intensity;
    }

    set gradRadius(val) {
        this._grad_radius = val * this._light_intensity;
    }

    get x() {
        return this.center.x;
    }
    get y() {
        return this.center.y;
    }

    updateVertices() {
        let v1: PVertex = { pos: new Vector3(this.center.x, this.center.y - this._light_width, 0), _attached_model: this };
        let v2: PVertex = { pos: new Vector3(this.center.x - this._light_width, this.center.y, 0), _attached_model: this };
        let v3: PVertex = { pos: new Vector3(this.center.x, this.center.y + this._light_width, 0), _attached_model: this };
        let v4: PVertex = { pos: new Vector3(this.center.x + this._light_width, this.center.y, 0), _attached_model: this };

        if (this.vertices.length === 0) {
            this.vertices.push(v1);
            this.vertices.push(v2);
            this.vertices.push(v3);
            this.vertices.push(v4);
        } else {
            this.vertices[0].pos = v1.pos;
            if (this.vertices[0]._attached_comment) {
                this.vertices[0]._attached_comment._point0 = this.vertices[0].pos;
            }
            this.vertices[1].pos = v2.pos;
            if (this.vertices[1]._attached_comment) {
                this.vertices[1]._attached_comment._point0 = this.vertices[1].pos;
            }
            this.vertices[2].pos = v3.pos;
            if (this.vertices[2]._attached_comment) {
                this.vertices[2]._attached_comment._point0 = this.vertices[2].pos;
            }
            this.vertices[3].pos = v4.pos;
            if (this.vertices[3]._attached_comment) {
                this.vertices[3]._attached_comment._point0 = this.vertices[3].pos;
            }
        }
    }

    setLightSize(size: number) {
        this._light_width = this._light_height = size;
    }

    setGradRadius(radius: number) {
        this.gradRadius = radius;
    }

    draw(ctx: CanvasRenderingContext2D, opt: {}): void {
        if (this.gradRadius !== 0) {
            const imgData = ctx.getImageData(this.x - this.gradRadius, this.y - this.gradRadius, this.gradRadius * 2, this.gradRadius * 2);

            for (let x = 0; x < this.gradRadius * 2; x++) {
                for (let y = 0; y < this.gradRadius * 2; y++) {
                    let length = Painter.distance(x, y, this.gradRadius, this.gradRadius);

                    if (length >= this.gradRadius + 1) continue;
                    let idx = x * (this.gradRadius * 2) * 4 + y * 4;

                    //使用两次线性插值法来使得随着距离的增大，光的rgb值减小
                    let red = imgData.data[idx];
                    let green = imgData.data[idx + 1];
                    let blue = imgData.data[idx + 2];
                    let alpha = imgData.data[idx + 3];
                    let startRed = this.color[0];
                    let startGreen = this.color[1];
                    let startBlue = this.color[2];
                    let midRed = Math.round(((startRed - FILTER[0]) * 2) / 3) + FILTER[0];
                    let midGreen = Math.round(((startGreen - FILTER[1]) * 2) / 3) + FILTER[1];
                    let midBlue = Math.round(((startBlue - FILTER[2]) * 2) / 3) + FILTER[2];
                    if (red == 0 && green == 0 && blue == 0) {
                        continue;
                    }
                    if (length < this.gradRadius / 2) {
                        let tempRed = startRed + (length * (midRed - startRed)) / (this.gradRadius / 2);
                        let tempGreen = startGreen + (length * (midGreen - startGreen)) / (this.gradRadius / 2);
                        let tempBlue = startBlue + (length * (midBlue - startBlue)) / (this.gradRadius / 2);
                        let tempAlpha = (255 * FILTER[3] * length) / this.gradRadius + (255 * 0.7 * (this.gradRadius - length)) / this.gradRadius;
                        imgData.data[idx] = Math.min(255, tempRed + red - FILTER[0]);
                        imgData.data[idx + 1] = Math.min(255, tempGreen + green - FILTER[1]);
                        imgData.data[idx + 2] = Math.min(255, tempBlue + blue - FILTER[2]);
                        imgData.data[idx + 3] = Math.max(alpha, tempAlpha);
                    } else {
                        let tempRed = midRed + ((length - this.gradRadius / 2) * (FILTER[0] - midRed)) / (this.gradRadius / 2);
                        let tempGreen = midGreen + ((length - this.gradRadius / 2) * (FILTER[1] - midGreen)) / (this.gradRadius / 2);
                        let tempBlue = midBlue + ((length - this.gradRadius / 2) * (FILTER[2] - midBlue)) / (this.gradRadius / 2);
                        let tempAlpha = (255 * FILTER[3] * length) / this.gradRadius + (255 * 0.7 * (this.gradRadius - length)) / this.gradRadius;
                        imgData.data[idx] = Math.min(255, tempRed + red - FILTER[0]);
                        imgData.data[idx + 1] = Math.min(255, tempGreen + green - FILTER[1]);
                        imgData.data[idx + 2] = Math.min(255, tempBlue + blue - FILTER[2]);
                        imgData.data[idx + 3] = Math.max(alpha, tempAlpha);
                    }
                }
            }

            ctx.putImageData(imgData, this.x - this.gradRadius, this.y - this.gradRadius);
        }

        ctx.translate(this.x - this._light_width, this.y - this._light_height);
        ctx.fillStyle = '#000';
        // ctx.fillStyle = 'rgba(100, 0, 0, 0)';
        ctx.fillRect(0, 0, this._light_width * 2, this._light_height * 2);
        ctx.translate(-this.x + this._light_width, -this.y + this._light_height);

        // ctx.restore();
        if (this._is_checked) {
            ctx.beginPath();
            ctx.strokeStyle = '#00FFFF';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;
            ctx.rect(this.center.x - this._light_width - 1, this.center.y - this._light_width - 1, this._light_width * 2 + 2, this._light_width * 2 + 2);
            ctx.stroke();

            ctx.fillStyle = 'red';
            this.updateVertices();
            for (let vertex of this.vertices) {
                ctx.beginPath();
                ctx.arc(vertex.pos.x, vertex.pos.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.setLineDash([]);
        }
    }

    isPickable(x: number, y: number): boolean {
        let beginX = this.center.x - this._light_width;
        let beginY = this.center.y - this._light_height;

        let endX = this.center.x + this._light_width;
        let endY = this.center.y + this._light_height;

        if (beginX <= x && endX >= x && beginY <= y && endY >= y) return true;
        return false;
    }

    _copy(ceilingLight: CeilingLight): CeilingLight {
        this.center = ceilingLight.center.clone();
        this._light_width = this._light_height = ceilingLight._light_width;
        this.gradRadius = ceilingLight.gradRadius;
        return this;
    }
    _clone(): CeilingLight {
        return new CeilingLight(new Vector3())._copy(this);
    }
}
