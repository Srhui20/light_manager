import { EditManager } from '../../EditManager';
import { Light } from '../../Models/Light/Light';
import { OperationManager } from '../OperationManager';
import { TOperationInfo } from '../TOperationInfo';

/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-04 17:34:47
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-04 20:12:12
 * @FilePath: \green-rice\src\planeDesign\operations\operations\EditLightInfo.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export class EditLightInfo extends TOperationInfo {
    _light: Light;
    _src_record: Light;
    _dst_record: Light;

    constructor(manager: EditManager) {
        super(manager);
        this._light = null;
        this._src_record = null;
        this._dst_record = null;
    }
    get light() {
        return this._light;
    }
    set light(l: Light) {
        this._light = l;
    }

    recordSrc() {
        if (!this._light) return;
        this._src_record = this._light._clone();
    }
    recordDst() {
        if (!this._light) return;
        if (!this._dst_record) {
            this._dst_record = this._light._clone();
        } else {
            this._dst_record._copy(this._light);
        }
    }
    applyRecord(light_record: Light) {
        if (light_record && this._light) {
            this._light._copy(light_record);
        }
    }


    undo(operation_manager?: OperationManager): boolean {
        this.applyRecord(this._src_record);
        return true;
    }
    redo(operation_manager?: OperationManager): boolean {
        this.applyRecord(this._dst_record);
        return true;
    }
    pop(operation_manager?: OperationManager): void {
        this._src_record = null;
        this._dst_record = null;
        this._light = null;
    }

    information(): string {
        return 'Edit Light';
    }
}
