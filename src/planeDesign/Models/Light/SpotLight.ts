/*
 * @Author: ddlu ludd@mail.ustc.edu.cn
 * @Date: 2023-05-29 20:10:06
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-29 09:34:06
 * @FilePath: \GreenRice\src\classlibs\light\SpotLight.ts
 * @Class: SpotLight
 * @Description: 射灯
 */
import { Vector3 } from 'three';
import { Light } from './Light';
import { FILTER } from '../../EditManager';
import { PVertex } from '../PVertex';

export class SpotLight extends Light {
    center: Vector3;
    _offset1: number;
    _offset2: number;
    rotate: number;

    lightWidth: number;
    lightHeight: number;
    lightSize: number;

    // _light_ctx: CanvasRenderingContext2D | undefined;

    constructor(pos: Vector3) {
        super();
        this.center = pos.clone();
        this.name = 'SpotLight';
        this._offset1 = 1.5;
        this._offset2 = 3;
        this.rotate = 0;

        this.lightWidth = 15;
        this.lightHeight = 7;
        this.lightSize = 10;
        this._light_color = [200, 200, 170, Math.round(255 * 0.5)];

        this.updateVertices();
        this.description = `${this.name} 矩形灯罩${this.lightWidth}*${this.lightHeight} 正方形灯罩${this.lightSize}*${this.lightSize}`;
    }

    get offset1() {
        return this._offset1 * this._light_intensity;
    }

    set offset1(val) {
        this._offset1 = val * this._light_intensity;
    }

    get offset2() {
        return this._offset2 * this._light_intensity;
    }

    set offset2(val) {
        this._offset2 = val * this._light_intensity;
    }

    updateVertices() {
        let v1: PVertex = { pos: new Vector3(this.center.x + (this.lightSize / Math.sqrt(2) - this.lightWidth) / 2, this.center.y - this.lightHeight, 0), _attached_model: this };
        let v2: PVertex = { pos: new Vector3(this.center.x - this.lightWidth, this.center.y, 0), _attached_model: this };
        let v3: PVertex = { pos: new Vector3(this.center.x + (this.lightSize / Math.sqrt(2) - this.lightWidth) / 2, this.center.y + this.lightHeight, 0), _attached_model: this };
        let v4: PVertex = { pos: new Vector3(this.center.x + this.lightSize / Math.sqrt(2), this.center.y, 0), _attached_model: this };
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

    draw(ctx: CanvasRenderingContext2D, opt: {}): void {
        if (this._light_intensity !== 0) {
            //rgb(160,160,145)

            const imgData = ctx.getImageData(this.center.x - this.offset1 * 2 - this.lightWidth, this.center.y - this.offset2 * 2, this.offset1 * 4, this.offset2 * 4);

            for (let i = 0; i < this.offset2 * 4; i++) {
                for (let j = 0; j < this.offset1 * 4; j++) {
                    let length = Math.pow((j - this.offset1 * 2) / this.offset1, 2) + Math.pow((i - this.offset2 * 2) / this.offset2, 2);
                    let limit = 2 * Math.sqrt(2);
                    let idx = i * this.offset1 * 4 * 4 + j * 4;
                    if (length >= limit) continue;

                    let red = imgData.data[idx];
                    let green = imgData.data[idx + 1];
                    let blue = imgData.data[idx + 2];
                    // let alpha = imgData.data[idx + 3];

                    let startRed = this.color[0];
                    let startGreen = this.color[1];
                    let startBlue = this.color[2];
                    let midRed = Math.round(((startRed - FILTER[0]) * 1) / 5) + FILTER[0];
                    let midGreen = Math.round(((startGreen - FILTER[1]) * 1) / 5) + FILTER[1];
                    let midBlue = Math.round(((startBlue - FILTER[2]) * 1) / 5) + FILTER[2];
                    if (red == 0 && green == 0 && blue == 0) {
                        continue;
                    }
                    let midLen = limit / Math.sqrt(2);

                    if (length < limit) {
                        if (length > midLen) {
                            let tempRed = midRed + ((length - midLen) * (FILTER[0] - midRed)) / (limit - midLen);
                            let tempGreen = midGreen + ((length - midLen) * (FILTER[1] - midGreen)) / (limit - midLen);
                            let tempBlue = midBlue + ((length - midLen) * (FILTER[2] - midBlue)) / (limit - midLen);

                            imgData.data[idx] = Math.min(255, tempRed + red - FILTER[0]);
                            imgData.data[idx + 1] = Math.min(255, tempGreen + green - FILTER[1]);
                            imgData.data[idx + 2] = Math.min(255, tempBlue + blue - FILTER[2]);
                            // imgData.data[idx + 3] = Math.max(alpha, tempAlpha);
                        } else {
                            let tempRed = startRed + (length * (midRed - startRed)) / midLen;
                            let tempGreen = startGreen + (length * (midGreen - startGreen)) / midLen;
                            let tempBlue = startBlue + (length * (midBlue - startBlue)) / midLen;

                            imgData.data[idx] = Math.min(255, tempRed + red - FILTER[0]);
                            imgData.data[idx + 1] = Math.min(255, tempGreen + green - FILTER[1]);
                            imgData.data[idx + 2] = Math.min(255, tempBlue + blue - FILTER[2]);
                            // imgData.data[idx + 3] = Math.max(alpha, tempAlpha);
                        }
                    }

                    midLen /= 2 * Math.sqrt(2);
                    limit /= 2 * Math.sqrt(2);
                    red = imgData.data[idx];
                    green = imgData.data[idx + 1];
                    blue = imgData.data[idx + 2];
                    if (length < limit) {
                        if (length > midLen) {
                            let tempRed = midRed + ((length - midLen) * (FILTER[0] - midRed)) / (limit - midLen);
                            let tempGreen = midGreen + ((length - midLen) * (FILTER[1] - midGreen)) / (limit - midLen);
                            let tempBlue = midBlue + ((length - midLen) * (FILTER[2] - midBlue)) / (limit - midLen);
                            // let tempAlpha = (255 * FILTER[3] * length) / limit + (255 * 0.7 * (limit - length)) / limit;
                            imgData.data[idx] = Math.min(255, tempRed + red - FILTER[0]);
                            imgData.data[idx + 1] = Math.min(255, tempGreen + green - FILTER[1]);
                            imgData.data[idx + 2] = Math.min(255, tempBlue + blue - FILTER[2]);
                            // imgData.data[idx + 3] = Math.max(alpha, tempAlpha);
                        } else {
                            let tempRed = startRed + (length * (midRed - startRed)) / midLen;
                            let tempGreen = startGreen + (length * (midGreen - startGreen)) / midLen;
                            let tempBlue = startBlue + (length * (midBlue - startBlue)) / midLen;
                            // let tempAlpha = (255 * FILTER[3] * length) / limit + (255 * 0.7 * (limit - length)) / limit;
                            imgData.data[idx] = Math.min(255, tempRed + red - FILTER[0]);
                            imgData.data[idx + 1] = Math.min(255, tempGreen + green - FILTER[1]);
                            imgData.data[idx + 2] = Math.min(255, tempBlue + blue - FILTER[2]);
                            // imgData.data[idx + 3] = Math.max(alpha, tempAlpha);
                        }
                    }
                }
            }
            ctx.putImageData(imgData, this.center.x - this.offset1 * 2 - this.lightWidth, this.center.y - this.offset2 * 2);
        }
        ctx.save();

        ctx.translate(this.center.x - this.lightWidth, this.center.y);
        ctx.beginPath();
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillRect(0, -this.lightHeight / 2, this.lightWidth, this.lightHeight);
        ctx.translate(this.lightWidth, 0);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-this.lightSize / 2, -this.lightSize / 2, this.lightSize, this.lightSize);
        // ctx.rotate(-Math.PI / 4);
        // ctx.translate(-this.lightWidth, 0);
        // ctx.translate(-this.center.x + this.lightWidth, this.center.y);
        ctx.restore();

        if (this._is_checked) {
            ctx.beginPath();
            ctx.strokeStyle = '#00FFFF';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;
            ctx.rect(this.center.x - this.lightWidth - 1, this.center.y - this.lightHeight - 1, this.lightWidth + this.lightSize / Math.sqrt(2) + 2, this.lightHeight * 2 + 2);
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
        let distance = Math.sqrt(Math.pow(x - this.center.x, 2) + Math.pow(y - this.center.y, 2));
        let radius = this.lightWidth + this.lightSize  * Math.sqrt(0.5);

        if (distance <= radius) return true;
        return false;
    }

    _copy(spotLight: SpotLight): SpotLight {
        this.center = spotLight.center.clone();
        this.offset1 = spotLight.offset1;
        this.offset2 = spotLight.offset2;
        this.rotate = spotLight.rotate;

        this.lightWidth = spotLight.lightWidth;
        this.lightHeight = spotLight.lightHeight;
        this.lightSize = spotLight.lightSize;
        return this;
    }
    _clone(): SpotLight {
        return new SpotLight(new Vector3())._copy(this);
    }
}
