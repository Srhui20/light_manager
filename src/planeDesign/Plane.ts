/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-04 16:16:36
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-15 19:16:53
 * @FilePath: \green-rice\src\planeDesign\Plane.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Painter } from './Painter';
import { Model } from './Models/Model';
import { Vector3 } from 'three';
import { Light } from './Models/Light/Light';
import { SpotLight } from './Models/Light/SpotLight';
import { FILTER } from './EditManager';
import { Comment } from './Models/Comment';

export class Plane {
    models: Model[];
    comments: Comment[];
    painter: Painter;
    _plane_timestamp: number;

    constructor(painter: Painter) {
        this.models = [];
        this.comments = [];
        this.painter = painter;
        this._plane_timestamp = 0;

        // this.models.push(new SpotLight(new Vector3(100, 100, 0)));
        // this.drawContents();
        // let cm = new Comment();
        // cm._point0 = new Vector3(100, 100, 0);
        // cm._point1 = new Vector3(200, 200, 0);
        // cm._text = "hello";
        // this.comments.push(cm);
    }

    get canvas() {
        return this.painter._canvas;
    }
    get context() {
        return this.painter._context;
    }

    addModel(model: Model) {
        if (this.models.indexOf(model) >= 0) return;
        this.models.push(model);
    }

    removeModel(model: Model) {
        let index = this.models.indexOf(model);
        if (index < 0) return;
        this.models.splice(index, 1);
    }

    addComment(comment: Comment) {
        if (this.comments.indexOf(comment) >= 0) return;
        this.comments.push(comment);
    }
    removeComment(comment: Comment) {
        let index = this.comments.indexOf(comment);
        if (index < 0) return;
        this.comments.splice(index, 1);
    }

    drawContents() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = `rgba(${FILTER[0]}, ${FILTER[1]}, ${FILTER[2]}, ${FILTER[3]})`;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // this.context.globalCompositeOperation = 'source-over';
        // for (let model of this.models) {
        //     if (model instanceof Light) {
        //         model.makeHaloArea(this.context);
        //     }
        // }
        for (let model of this.models) {
            model.draw(this.context, {});
        }
        // console.log(this.comments.length);

        for (let comment of this.comments) {
            this.painter.drawComment(comment);
        }
    }
}
