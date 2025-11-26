import { EditManager } from '../../EditManager';
import { Light } from '../../Models/Light/Light';
import { OperationManager } from '../OperationManager';
import { AddOrRemoveType, TOperationInfo } from '../TOperationInfo';

/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-04 16:47:11
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-04 19:50:16
 * @FilePath: \green-rice\src\planeDesign\operations\operations\AddOrRemoveLightInfo.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export class AddOrRemoveLightInfo extends TOperationInfo {
    _mode: AddOrRemoveType;
    _light: Light;

    constructor(mode: AddOrRemoveType, edit_manager: EditManager) {
        super(edit_manager);
        this._mode = mode;
        this._light = null;
    }
    get light() {
        return this._light;
    }
    set light(light: Light) {
        this._light = light;
    }
    apply() {
        if (!this.light) return;
        if (this._mode === AddOrRemoveType.Add) {
            this.plane.addModel(this.light);
        } else {
            this.plane.removeModel(this.light);
        }
    }
    unapply() {
        if (!this.light) return;
        if (this._mode === AddOrRemoveType.Remove) {
            this.plane.addModel(this.light);
        } else {
            this.plane.removeModel(this.light);
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
        this.light = null;
    }
    information(): string {
        return `${this._mode} Light`;
    }
}
