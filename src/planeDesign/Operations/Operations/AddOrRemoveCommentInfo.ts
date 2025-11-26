import { EditManager } from '../../EditManager';
import { Comment } from '../../Models/Comment';
import { OperationManager } from '../OperationManager';
import { AddOrRemoveType, TOperationInfo } from '../TOperationInfo';

/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-14 22:40:57
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-14 22:46:07
 * @FilePath: \green-rice\src\planeDesign\Operations\Operations\AddOrRemoveCommentInfo.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export class AddOrRemoveCommentInfo extends TOperationInfo {
    _mode: AddOrRemoveType;
    _comment: Comment;
    constructor(mode: AddOrRemoveType, manager: EditManager) {
        super(manager);
        this._mode = mode;
        this._comment = null;
    }
    get comment() {
        return this._comment;
    }
    set comment(comment: Comment) {
        this._comment = comment;
    }
    apply() {
        if (!this.comment) return;
        if (this._mode === AddOrRemoveType.Add) {
            this.plane.addComment(this.comment);
        } else {
            this.plane.removeComment(this.comment);
        }
    }
    unapply() {
        if (!this.comment) return;
        if (this._mode === AddOrRemoveType.Remove) {
            this.plane.addComment(this.comment);
        } else {
            this.plane.removeComment(this.comment);
        }
    }

    redo(operation_manager?: OperationManager): boolean {
        this.apply();
        return true;
    }
    undo(operation_manager?: OperationManager): boolean {
        this.unapply();
        return true;
    }
    pop(operation_manager?: OperationManager): void {
        this.comment = null;
    }
    information(): string {
        return `${this._mode} Comment`;
    }
}
