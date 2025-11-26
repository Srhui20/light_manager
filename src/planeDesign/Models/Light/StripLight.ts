/*
 * @Author: ddlu ludd@mail.ustc.edu.cn
 * @Date: 2023-05-29 20:10:06
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-16 14:43:25
 * @FilePath: \GreenRice\src\classlibs\light\StripLight.ts
 * @Class: StripLight
 * @Description: 灯带等
 */
import { Vector3 } from 'three';
import { Light } from './Light';
import { FILTER } from '../../EditManager';
import { Painter } from '../../Painter';
import { PVertex } from '../PVertex';

export class StripLight extends Light {
    center: Vector3;
    // lightWidth: number;
    // lightHeight: number;
    _offset: number;

    _lineWidth: number;
    // color: number[];

    constructor(pos: Vector3) {
        super();
        this.center = pos.clone();
        this.name = 'StripLight';
        this.lightWidth = 130;
        this.lightHeight = 170;
        this._offset = 2;
        this._lineWidth = 2;
        this._light_color = [160, 160, 160, Math.round(255 * 0.5)]
        this.updateVertices();
        this.description = `${this.name} ${this.lightWidth}*${this.lightHeight}`;
    }

   

    get lightWidth (){
        return this._light_width
    }

    set lightWidth(val){
        this._light_width = val
    }

    get lightHeight(){
        return this._light_height
    }
    set lightHeight(val){
        this._light_height = val
    }

    get offset() {
        return this._offset * this._light_intensity;
    }

    set offset(val) {
        this._offset = val * this._light_intensity;
    }

    get x() {
        return this.center.x;
    }
    get y() {
        return this.center.y;
    }

    setLightWidth(width: number) {
        this.lightWidth = width;
    }
    setLightHeight(height: number) {
        this.lightHeight = height;
    }


    updateVertices() {
        let v1: PVertex = { pos: new Vector3(this.center.x, this.center.y - this.lightHeight / 2, 0), _attached_model: this };
        let v2: PVertex = { pos: new Vector3(this.center.x - this.lightWidth / 2, this.center.y, 0), _attached_model: this };
        let v3: PVertex = { pos: new Vector3(this.center.x, this.center.y + this.lightHeight / 2, 0), _attached_model: this };
        let v4: PVertex = { pos: new Vector3(this.center.x + this.lightWidth / 2, this.center.y, 0), _attached_model: this };
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
        // throw new Error("Method not implemented.");

        if (this._light_intensity !== 0) {
            const imgData = ctx.getImageData(this.center.x - this.lightWidth / 2 - this.offset, this.center.y - this.lightHeight / 2 - this.offset, this.offset * 2 + this.lightWidth, this.offset * 2 + this.lightHeight);
            for (let i = 0; i < this.lightHeight + this.offset * 2; i++) {
                for (let j = 0; j < this.lightWidth + this.offset * 2; j++) {
                    if (2 * this.offset <= i && i <= this.lightHeight && 2 * this.offset <= j && j <= this.lightWidth) {
                        continue;
                    }

                    let idx = i * (this.lightWidth + this.offset * 2) * 4 + j * 4;

                    //使用两次线性插值法来使得随着离矩形灯框的距离的增大，光的rgb值减小
                    let red = imgData.data[idx];
                    let green = imgData.data[idx + 1];
                    let blue = imgData.data[idx + 2];
                    let alpha = imgData.data[idx + 3];

                    if (red === 0 && green === 0 && blue === 0) continue;

                    let startRed = this.color[0];
                    let startGreen = this.color[1];
                    let startBlue = this.color[2];

                    let midRed = Math.round(((startRed - FILTER[0]) * 1) / 5) + FILTER[0];
                    let midGreen = Math.round(((startGreen - FILTER[1]) * 1) / 5) + FILTER[1];
                    let midBlue = Math.round(((startBlue - FILTER[2]) * 1) / 5) + FILTER[2];

                    let minLength = 10000;

                    if (i >= this.offset && i <= this.lightHeight + this.offset) {
                        minLength = Math.min(Math.abs(j - this.offset), Math.abs(j - this.lightWidth - this.offset), minLength);
                    }
                    if (j >= this.offset && j <= this.lightWidth + this.offset) {
                        minLength = Math.min(Math.abs(i - this.offset), Math.abs(i - this.lightHeight - this.offset), minLength);
                    }

                    if (true) {
                        minLength = Math.min(Painter.distance(j, i, this.offset, this.offset), Painter.distance(j, i, this.offset, this.lightHeight + this.offset), Painter.distance(j, i, this.lightWidth + this.offset, this.offset), Painter.distance(j, i, this.lightWidth + this.offset, this.lightHeight + this.offset), minLength);
                    }

                    if (minLength >= this.offset) continue;
                    //haloLen以内rgb不变，从haloLen到midLen和从midLen到offset分别进行了线性插值法
                    let haloLen = this.offset / 4;
                    let midLen = (3 * this.offset) / 4;
                    if (minLength < haloLen) {
                        imgData.data[idx] = Math.min(255, startRed + red - FILTER[0]);
                        imgData.data[idx + 1] = Math.min(255, startGreen + green - FILTER[1]);
                        imgData.data[idx + 2] = Math.min(255, startBlue + blue - FILTER[2]);
                    } else if (minLength < midLen) {
                        let tempRed = startRed + ((minLength - haloLen) * (midRed - startRed)) / (midLen - haloLen);
                        let tempGreen = startGreen + ((minLength - haloLen) * (midGreen - startGreen)) / (midLen - haloLen);
                        let tempBlue = startBlue + ((minLength - haloLen) * (midBlue - startBlue)) / (midLen - haloLen);
                        imgData.data[idx] = Math.min(255, tempRed + red - FILTER[0]);
                        imgData.data[idx + 1] = Math.min(255, tempGreen + green - FILTER[1]);
                        imgData.data[idx + 2] = Math.min(255, tempBlue + blue - FILTER[2]);
                    } else if (minLength < this.offset) {
                        let tempRed = midRed + ((minLength - midLen) * (FILTER[0] - midRed)) / (this.offset - midLen);
                        let tempGreen = midGreen + ((minLength - midLen) * (FILTER[1] - midGreen)) / (this.offset - midLen);
                        let tempBlue = midBlue + ((minLength - midLen) * (FILTER[2] - midBlue)) / (this.offset - midLen);
                        imgData.data[idx] = Math.min(255, tempRed + red - FILTER[0]);
                        imgData.data[idx + 1] = Math.min(255, tempGreen + green - FILTER[1]);
                        imgData.data[idx + 2] = Math.min(255, tempBlue + blue - FILTER[2]);
                    }

                    // imgData.data[idx] = 255
                    // imgData.data[idx + 1] = 255
                    // imgData.data[idx + 2] = 255
                }
            }
            ctx.putImageData(imgData, this.center.x - this.lightWidth / 2 - this.offset, this.center.y - this.lightHeight / 2 - this.offset);
        }
        // ctx.save();
        ctx.translate(this.center.x - this.lightWidth / 2, this.center.y - this.lightHeight / 2);

        ctx.lineWidth = this._lineWidth;
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)';

        // ctx.shadowBlur = 10;
        // ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        ctx.strokeRect(0, 0, this.lightWidth, this.lightHeight);
        ctx.translate(-this.center.x + this.lightWidth / 2, -this.center.y + this.lightHeight / 2);
        ctx.lineWidth = 1;
        // ctx.restore();

        if (this._is_checked) {
            ctx.beginPath();
            ctx.strokeStyle = '#00FFFF';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;
            ctx.rect(this.center.x - this.lightWidth / 2 - 1, this.center.y - this.lightHeight / 2 - 1, this.lightWidth + 2, this.lightHeight + 2);
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
        let minX = this.center.x - (this.lightWidth) / 2;
        let minY = this.center.y - (this.lightHeight) / 2;
        let maxX = this.center.x + (this.lightWidth) / 2;
        let maxY = this.center.x + (this.lightHeight) / 2;

        if ((Math.abs(minX - x) <= 5 || Math.abs(maxX - x) <= 5) && y >= minY - 5 && y <= maxY + 5) return true;
        if ((Math.abs(minY - y) <= 5 || Math.abs(maxY - y) <= 5) && x >= minX - 5 && x <= maxX + 5) return true;

        return false;
    }
    _copy(stripLight: StripLight): StripLight {
        this.center = stripLight.center.clone();
        this.offset = stripLight.offset;
        this.lightWidth = stripLight.lightWidth;
        this.lightHeight = stripLight.lightHeight;
        return this;
    }
    _clone(): StripLight {
        return new StripLight(new Vector3())._copy(this);
    }
}
