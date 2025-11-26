/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-04 10:16:20
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-16 11:29:47
 * @FilePath: \green-rice\src\planeDesign\Painter.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { Vector3 } from 'three';
import { Comment } from './Models/Comment';

export class Painter {
    _canvas: HTMLCanvasElement;
    _context: CanvasRenderingContext2D;

    _p_center: { x: number; y: number };
    _p_sc: number;

    constructor(canvas: HTMLCanvasElement) {
        this._context = canvas.getContext('2d') as CanvasRenderingContext2D;
        this._canvas = canvas;

        this._p_sc = 0.2;
        this._p_center = { x: 0, y: 0 };
    }
    canvas2world(v0: { x: number; y: number }) {
        let x = (v0.x * this._canvas.width) / this._canvas.clientWidth;
        let y = (v0.y * this._canvas.height) / this._canvas.clientHeight;

        // console.log(x, y);

        return this.upproject2D({
            x: x - this._canvas.width / 2,
            y: y - this._canvas.height / 2
        });
    }

    worldToCanvas(v0: { x: number; y: number }) {
        let p1 = this.project2D(v0);
        let x = ((p1.x + this._canvas.width / 2) * this._canvas.clientWidth) / this._canvas.width;
        let y = ((p1.y + this._canvas.height / 2) * this._canvas.clientHeight) / this._canvas.height;
        return { x: x, y: y };
    }

    upproject2D(v0: { x: number; y: number }) {
        return {
            // 没明白p_center
            // x: v0.x / this._p_sc + this._p_center.x,
            // y: v0.y / this._p_sc + this._p_center.y,
            x: v0.x / this._p_sc + 79503.51,
            y: v0.y / this._p_sc + 75063.01999999997
        };
    }
    project2D(v0: { x: number; y: number }) {
        return {
            x: (v0.x - this._p_center.x) * this._p_sc,
            y: (v0.y - this._p_center.y) * this._p_sc
        };
    }

    static distance(vec1: Vector3, vec2: Vector3): number;
    static distance(v0: { x: number; y: number }, v1: { x: number; y: number }): number;
    static distance(x1: number, y1: number, x2: number, y2: number): number;
    static distance(v0: any, v1: any, v2?: number, v3?: number): number {
        if (v0 instanceof Vector3) {
            return Math.sqrt((v0.x - v1.x) * (v0.x - v1.x) + (v0.y - v1.y) * (v0.y - v1.y) + (v0.z - v1.z) * (v0.z - v1.z));
        } else {
            if (v2) {
                return Math.sqrt((v0 - v2) * (v0 - v2) + (v1 - v3) * (v1 - v3));
            } else {
                return Math.sqrt((v0.x - v1.x) * (v0.x - v1.x) + (v0.y - v1.y) * (v0.y - v1.y));
            }
        }
    }

    static clearArc(context: CanvasRenderingContext2D, x: number, y: number, radius: number, stepClear = 1) {
        //圆心(x,y)，半径radius
        let calcWidth = radius - stepClear;
        let calcHeight = Math.sqrt(radius * radius - calcWidth * calcWidth);

        let posX = x - calcWidth;
        let posY = y - calcHeight;

        let widthX = 2 * calcWidth;
        let heightY = 2 * calcHeight;

        if (stepClear <= radius) {
            context.clearRect(posX, posY, widthX, heightY);
            stepClear += 1;
            this.clearArc(context, x, y, radius, stepClear);
        }
    }

    static computeRGB(sourceRGB: number, destinationRGB: number, radius: number, length: number) {
        if (length > radius + 1) return 0;
        let k = 2 * (sourceRGB - destinationRGB);
        let b = 2 * destinationRGB - sourceRGB;
        radius = radius * radius;
        length = length * length;
        return (k * radius) / (length + radius) + b;
    }

    drawEdge(beginPath: Vector3, endPath: Vector3, lineStyle: number = 0) {
        let ctx = this._context;
        ctx.beginPath();
        if (lineStyle === 0) {
            ctx.setLineDash([8, 4]);
        }

        ctx.strokeStyle = '#00FFFF';

        ctx.moveTo(beginPath.x, beginPath.y);
        ctx.lineTo(endPath.x, endPath.y);

        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawText(text: string, v: Vector3, font_size: number = 10, angle0: number = 0) {
        // let pos = this.project2D(v);
        let pos = v;
        this._context.translate(pos.x, pos.y);

        if (Math.abs(angle0) > 0.01) {
            this._context.rotate(angle0);
        }

        font_size = Math.round(font_size * (this._p_sc / 0.15) * 10) / 10;
        this._context.font = font_size + 'px arial 宋体';

        if (text.indexOf('\n') >= 0) {
            let tlist = text.split('\n');
            let theight = -1;
            for (let i = 0; i < tlist.length; i++) {
                let measure = this._context.measureText(tlist[i]);
                let t_width = measure.width;
                if (theight < 0) {
                    theight = measure.actualBoundingBoxAscent;
                }
                this._context.fillText(tlist[i], -t_width / 2, theight + (theight + 10) * (i - tlist.length / 2));
            }
        } else {
            let measure = this._context.measureText(text);
            let t_width = measure.width;
            let t_height = measure.actualBoundingBoxAscent;
            this._context.fillText(text, -t_width / 2, t_height / 2);
        }

        if (Math.abs(angle0) > 0.01) {
            this._context.rotate(-angle0);
        }
        this._context.translate(-pos.x, -pos.y);
    }

    drawComment(comment: Comment) {
        comment.updateNor();
        let src_p = comment._point0;
        let dist_p = comment._point1;
        let mid_p = new Vector3(dist_p.x, src_p.y, 0);
        if (Math.abs(src_p.y - dist_p.y) > Math.abs(src_p.x - dist_p.x)) {
            mid_p = new Vector3(src_p.x, dist_p.y);
        }
        // let flag1 = dist_p.x > src_p.x ? true : false;
        // let flag2 = dist_p.y > src_p.y ? true : false;
        let ctx = this._context;

        this.drawEdge(src_p, mid_p);
        this.drawEdge(mid_p, dist_p);

        let p1 = dist_p.clone().add(comment._nor.clone().multiplyScalar(20));
        this._context.fillStyle = `rgb(${comment._font_color.join(',')})`;
        this.drawText(comment._text, p1, comment._font_size);
    }
}
