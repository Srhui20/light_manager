/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-04 11:58:15
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-16 09:54:13
 * @FilePath: \green-rice\src\planeDesign\editMode\LayoutModeHandler.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { EditManager, I_MouseEvent, MouseButtonsNum } from '../EditManager';
import { CommandEnterState, CommandLeaveState } from '../Utils/CommandInput';
import { EditModeHandler, MouseTarget } from './EditModeHandler';
import { AddCommentSubHandler } from './Handlers/AddCommentSubHandler';
import { AddLightHandler } from './Handlers/AddLightSubHandler';

export class LayoutModeHandle extends EditModeHandler {
    constructor(manager: EditManager) {
        super(manager, 'layout');
        this._menu_commands['灯'] = [
            {
                name: 'SpotLight',
                ui_name: '射灯',
                img: '../../../assets/images/射灯.png'
            },
            {
                name: 'DownLight',
                ui_name: '筒灯',
                img: '../../../assets/images/筒灯.png'
            },
            {
                name: 'CeilingLight',
                ui_name: '吸顶灯',
                img: '../../../assets/images/吸顶灯.png'
            },
            {
                name: 'StripLight',
                ui_name: '灯带',
                img: '../../../assets/images/灯带.png'
            },
            {
                name: 'DoubleHeadDownLight',
                ui_name: '双头筒灯',
                img: '../../../assets/images/双头筒灯.png'
            },
            {
                name: 'FlowerLight',
                ui_name: '花灯',
                img: '../../../assets/images/花灯.png'
            }
        ];

        this._command_sub_handlers['SpotLight'] = new AddLightHandler(this, 'SpotLight');
        this._command_sub_handlers['DownLight'] = new AddLightHandler(this, 'DownLight');
        this._command_sub_handlers['CeilingLight'] = new AddLightHandler(this, 'CeilingLight');
        this._command_sub_handlers['StripLight'] = new AddLightHandler(this, 'StripLight');
        this._command_sub_handlers['DoubleHeadDownLight'] = new AddLightHandler(this, 'DoubleHeadDownLight');
        this._command_sub_handlers['AddFlowerLight'] = new AddLightHandler(this, 'FlowerLight');
        this._command_sub_handlers['Comment'] = new AddCommentSubHandler(this);

        // this.registerMouseCommand(MouseButtonsNum.LeftButton, 'Comment', [MouseTarget.Vertex], true);
        this.registerMouseCommand(MouseButtonsNum.LeftButton, 'Comment', [MouseTarget.Comment], true);
        this.registerMouseCommand(MouseButtonsNum.LeftButton, 'EditLight', [MouseTarget.Light], true);
    }

    public initHtml() {
        let scope = this;

        for (let cate in this._menu_commands) {
            this._menu_commands[cate].forEach((command_action) => {
                const light_item = document.createElement('div');
                light_item.classList.add('light_item');
                const light_item_img = document.createElement('img');
                light_item_img.src = command_action.img;
                light_item.appendChild(light_item_img);
                const light_name = document.createElement('div');
                light_name.classList.add('light_name');
                light_name.classList.add(command_action.name);
                light_name.innerHTML = command_action.ui_name;
                light_item.appendChild(light_name);
                light_item.onclick = () => {
                    if (command_action.callback) {
                        command_action.callback();
                    } else {
                        scope.runCommand(command_action.name);
                    }
                };
                this._edit_manager._light_area_list.appendChild(light_item);
            });
        }
    }

    public drawCanvas(): void {
        let plane = this.plane;
        plane.drawContents();
    }

    public runCommand(name: string, enter_state: number = CommandEnterState.Default) {
        super.runCommand(name, enter_state);
    }

    oncommand_ok() {
        if (this._active_sub_handler) {
            this._active_sub_handler.runCommand('confirm');
            this._active_sub_handler.leave(CommandLeaveState.Default);
        }
    }
    oncommand_cancel() {
        if (this._active_sub_handler) {
            this._active_sub_handler.runCommand('Delete');
            this._active_sub_handler.leave(CommandLeaveState.CloseBtn);
        }
    }
}
