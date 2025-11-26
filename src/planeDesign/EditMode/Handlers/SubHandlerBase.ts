import { CommandHandler } from '../../Utils/CommandHandler';
import { I_CommandInput } from '../../Utils/CommandInput';
import { EditModeHandler } from '../EditModeHandler';

/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-04 10:23:21
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-04 11:22:29
 * @FilePath: \green-rice\src\planeDesign\EditMode\Handlers\SubHandlerBase.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export class SubHandlerBase extends CommandHandler {
    _handler: EditModeHandler;
    constructor(
        handler: EditModeHandler,
        name: string,
        command_inputs: I_CommandInput[] = []
    ) {
        super(name, command_inputs);
        this._handler = handler;
    }

    get manager() {
        return this._handler._edit_manager;
    }

    get plane() {
        return this.manager.plane;
    }
}
