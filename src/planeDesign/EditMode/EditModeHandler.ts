/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-04 11:58:15
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-16 11:36:03
 * @FilePath: \green-rice\src\planeDesign\editMode\EditModeHandler.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Vector3 } from 'three';
import { EditManager, I_MenuCommandAction, I_MouseEvent, MouseButtonsNum } from '../EditManager';
import { Comment } from '../Models/Comment';
import { Plane } from '../Plane';
import { CommandHandler } from '../Utils/CommandHandler';
import { CommandEnterState, CommandLeaveState } from '../Utils/CommandInput';
import { Painter } from '../Painter';
import { Light } from '../Models/Light/Light';
import { PVertex } from '../Models/PVertex';

export enum MouseTarget {
    Vertex = 'Vertex',
    OnlineVertex = 'OnlineVertex',
    Edge = 'Edge',
    TableTop = 'TableTop',
    PatchEdge = 'PatchEdge',
    Basin = 'Basin',
    Dimension = 'Dimension',
    Comment = 'Comment',
    OtherPlate = 'OtherPlate',
    HangonPlate = 'HangonPlate',
    Light = 'Light'
}

export interface I_RegisterMouseCommand {
    button?: number;
    dbclick?: boolean;
    targets?: MouseTarget[];
    command_name?: string;
}

export class EditModeHandler {
    _edit_manager: EditManager;
    _active_sub_handler: CommandHandler;

    _menu_commands: { [key: string]: I_MenuCommandAction[] };
    _command_sub_handlers: { [key: string]: CommandHandler };
    _command_name_dict: { [key: string]: string };

    protected _register_mouse_commands: I_RegisterMouseCommand[];

    constructor(manager: EditManager, name: string = '') {
        this._menu_commands = {};
        this._command_sub_handlers = {};

        this._edit_manager = manager;
        this._edit_manager._handlers[name] = this;
        this._active_sub_handler = null;

        this._register_mouse_commands = [];
    }

    initHtml() {}

    get plane(): Plane {
        return this._edit_manager.plane;
    }

    public drawCanvas() {
        let plane = this.plane;
        // painter.clean();

        // painter.enter_drawpoly();

        // painter.leave_drawpoly();
        plane.drawContents();
    }

    registerMouseCommand(button: number, command_name: string, targets: MouseTarget[] = [], dbclick: boolean = false) {
        this._register_mouse_commands.push({
            button: button,
            command_name: command_name,
            dbclick: dbclick,
            targets: targets
        });
    }

    public runCommand(name: string, enter_state: number = CommandEnterState.Default) {
        // console.log(this.);

        // 如果有active_sub_handler离开后新建
        if (this._active_sub_handler) {
            this._active_sub_handler.leave(CommandLeaveState.Default);
            this._active_sub_handler = null;
        }
        if (this._command_sub_handlers[name] !== undefined) {
            this._active_sub_handler = this._command_sub_handlers[name];
            if (this._active_sub_handler.widget_div === null) {
                this._active_sub_handler.initWidget();
            }
            this._active_sub_handler.command_name = name;
            // this._active_sub_handler.command_ui_name = this._command_name_dict[name] || name;
            this._active_sub_handler.enter(enter_state);
        }
    }

    public leaveSubHandler() {
        if (this._active_sub_handler) {
            this._active_sub_handler.leave();
            this._active_sub_handler = null;
        }
    }

    selectCommentByMouse(x: number, y: number): Comment;
    selectCommentByMouse(ev: I_MouseEvent): Comment;
    selectCommentByMouse(ev: any, y?: any, t_dist: number = 20): Comment {
        let ans_comment: Comment = null;
        let min_dist = t_dist;
        let px = 0,
            py = 0;
        if (typeof ev === 'number') {
            px = ev;
            py = y;
        } else {
            px = ev._ev.offsetX - this._edit_manager._canvas.offsetLeft;
            py = ev._ev.offsetY - this._edit_manager._canvas.offsetTop;
        }
        for (let comment of this.plane.comments) {
            let dist = Painter.distance(px, py, comment._point1.x, comment._point1.y);
            if (dist < min_dist) {
                min_dist = dist;

                ans_comment = comment;
            }
        }
        return ans_comment;
    }

    selectLightByMouse(x: number, y: number) {
        let ans_light: Light = null;
        let models = this._edit_manager.plane.models;
        for (let model of models) {
            if (model instanceof Light) {
                if (model.isPickable(x, y)) {
                    ans_light = model;
                    break;
                }
            }
        }
        return ans_light;
    }

    selectVertexByMouse(x: number, y: number) {
        let p = new Vector3(x, y, 0);
        let ans_vertex: PVertex = null;
        let models = this._edit_manager.plane.models;
        for (let model of models) {
            if (model instanceof Light) {
                for (let vertex of model.vertices) {
                    if (p.distanceTo(vertex.pos) < 3) {

                        ans_vertex = vertex;
                        break;
                    }
                }
            }
        }
        return ans_vertex;
    }

    selectTarget(
        ev: I_MouseEvent,
        targets: MouseTarget[]
    ): {
        vertex?: PVertex;
        comment?: Comment;
        light?: Light;
    } {
        for (let target of targets) {
            if (target === MouseTarget.Vertex) {
                let res = this.selectVertexByMouse(ev.posX, ev.posY);
                if (res) {
                    return { vertex: res };
                }
            }
            if (target === MouseTarget.Comment) {
                let res = this.selectCommentByMouse(ev);
                if (res) {
                    return { comment: res };
                }
            }
            if (target === MouseTarget.Light) {
                let res = this.selectLightByMouse(ev.posX, ev.posY);
                if (res) {
                    return { light: res };
                }
            }
        }

        return null;
    }

    onkeydown(ev: KeyboardEvent) {
        if (this._active_sub_handler) {
            return this._active_sub_handler.onkeydown(ev);
        }
        return true;
    }

    onmousedown(ev: I_MouseEvent) {
        if (this._active_sub_handler) {
            this._active_sub_handler.onmousedown(ev);
        }
    }

    onmousemove(ev: I_MouseEvent) {
        if (this._active_sub_handler) {
            // if (ev.buttons === 0 && !this._active_sub_handler._is_tracking_mouse) {
            this._active_sub_handler.onmousemove(ev);
            // }
        }
    }

    onmouseup(ev: I_MouseEvent) {
        if (this._active_sub_handler) {
            this._active_sub_handler.onmouseup(ev);
        }
    }

    ondbclick(ev: I_MouseEvent) {
        if (this._active_sub_handler) {
            ev.buttons = 1;
            this._active_sub_handler.ondbclick(ev);
            return;
        }
        let command_name = null;

        for (let register_command of this._register_mouse_commands) {
            if (register_command.button != MouseButtonsNum.LeftButton) continue;
            if (!register_command.dbclick) continue;
            // console.log(register_command.targets);

            let res = this.selectTarget(ev, register_command.targets);

            if (res) {
                // console.log(res);
                //由于每个灯的name都不一样，而获取到的register_command.command_name都一样，故这里需要分开处理
                if (res.light) {
                    command_name = res.light.name;
                } else {
                    command_name = register_command.command_name;
                }
                break;
            }
        }
        if (command_name) {
            this.runCommand(command_name);
        } else {
            if (this._active_sub_handler) {
                this._active_sub_handler.leave(CommandLeaveState.Default);
                this._active_sub_handler = null;
            }
        }

        if (this._active_sub_handler) {
            ev.buttons = 1;
            this._active_sub_handler.ondbclick(ev);
            return;
        }
    }
    oncontextmenu(ev: I_MouseEvent) {}

    onwheel(ev: WheelEvent) {}

    update() {
        this._edit_manager.update();
    }

    oncommand_ok() {
        if (this._active_sub_handler) {
            this._active_sub_handler.leave(CommandLeaveState.Default);
            this._active_sub_handler = null;
        }
    }
    oncommand_cancel() {
        if (this._active_sub_handler) {
            this._active_sub_handler.leave(CommandLeaveState.CloseBtn);
            this._active_sub_handler = null;
        }
    }
}
