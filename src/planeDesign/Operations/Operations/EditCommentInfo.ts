/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-14 22:37:26
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-14 22:38:52
 * @FilePath: \green-rice\src\planeDesign\Operations\Operations\EditCommentInfo.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { Vector3 } from 'three';
import { TOperationInfo } from '../TOperationInfo';
import { EditManager } from '../../EditManager';
import { Comment } from '../../Models/Comment';
import { OperationManager } from '../OperationManager';

export class EditCommentInfo extends TOperationInfo {
    _src_points: Vector3[];
    _dst_points: Vector3[];
    _src_text: string;
    _dst_text: string;
    _comment: Comment;
    constructor(manager: EditManager) {
        super(manager);
        this._comment = null;
        this._src_points = [];
        this._dst_points = [];
    }
    setComment(comment: Comment) {
        this._comment = comment;
        this.recordSrc();
        this.recordDst();
    }

    applyPoints(points: Vector3[]) {
        if (points.length < 2) return;
        if (!this._comment) return;
        this._comment._point0 = points[0];
        this._comment._point1 = points[1];
    }
    applyText(text: string) {
        if (!this._comment) return;
        this._comment._text = text;
    }
    recordSrc() {
        if (this._comment) {
            this._src_points = [this._comment._point0.clone(), this._comment._point1.clone()];
            this._src_text = this._comment._text;
        }
    }
    recordDst() {
        if (this._comment) {
            this._dst_points = [this._comment._point0.clone(), this._comment._point1.clone()];
            this._dst_text = this._comment._text;
        }
    }

    undo(operation_manager?: OperationManager): boolean {
        this.applyPoints(this._src_points);
        this.applyText(this._src_text);
        return true;
    }
    redo(operation_manager?: OperationManager): boolean {
        this.applyPoints(this._dst_points);
        this.applyText(this._dst_text);
        return true;
    }
    pop(operation_manager?: OperationManager): void {
        this._comment = null;
        this._src_points = [];
        this._dst_points = [];
    }
    information(): string {
        return 'Edit Comments';
    }
}
