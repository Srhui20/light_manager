/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-05 14:48:09
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-16 15:08:42
 * @FilePath: \green-rice\src\planeDesign\EditMode\Handlers\AddLightSubHandler.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-04 11:03:50
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-12 18:10:05
 * @FilePath: \green-rice\src\planeDesign\EditMode\Handlers\AddSpotLightSubHandler.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { I_MouseEvent } from '../../EditManager';
import { SpotLight } from '../../Models/Light/SpotLight';
import { EditModeHandler } from '../EditModeHandler';
import { Vector3 } from 'three';
import { SubHandlerBase } from './SubHandlerBase';
import { AddOrRemoveLightInfo } from '../../Operations/Operations/AddOrRemoveLightInfo';
import { AddOrRemoveType } from '../../Operations/TOperationInfo';
import { EditLightInfo } from '../../Operations/Operations/EditLightInfo';
import { Light } from '../../Models/Light/Light';
import { LightFactory, LightType } from '../../Models/Light/LightFactory';
import { CMDInputType } from '../../Utils/CommandInitWidgetFun';
import { CommandInput } from '../../Utils/CommandInput';

const light_command_inputs = [
    [
        {
            name: 'size',
            ui_name: '尺寸',
            type: CMDInputType.Integer,
            default_values: [1],
        },
        {
            name: 'x',
            ui_name: 'x坐标',
            type: CMDInputType.Integer,
            default_values: [100],
            width_level: 1,
        },
        {
            name: 'y',
            ui_name: 'y坐标',
            type: CMDInputType.Integer,
            default_values: [100],
            width_level: 1,
        },
    ],
    [
        {
            name: 'x',
            ui_name: 'x坐标',
            type: CMDInputType.Integer,
            default_values: [100],
            width_level: 1,
        },
        {
            name: 'y',
            ui_name: 'y坐标',
            type: CMDInputType.Integer,
            default_values: [100],
            width_level: 1,
        },
    ],
    [
        {
            name: 'x',
            ui_name: 'x坐标',
            type: CMDInputType.Integer,
            default_values: [0, 0, 0],
            width_level: 1,
        },
        {
            name: 'y',
            ui_name: 'y坐标',
            type: CMDInputType.Integer,
            default_values: [0, 0, 0],
            width_level: 1,
        },
    ],
    [
        {
            name: 'x',
            ui_name: 'x坐标',
            type: CMDInputType.Integer,
            default_values: [0, 0, 0],
            width_level: 1,
        },
        {
            name: 'y',
            ui_name: 'y坐标',
            type: CMDInputType.Integer,
            default_values: [0, 0, 0],
            width_level: 1,
        },
    ],
    [
        {
            name: 'x',
            ui_name: 'x坐标',
            type: CMDInputType.Integer,
            default_values: [0, 0, 0],
            width_level: 1,
        },
        {
            name: 'y',
            ui_name: 'y坐标',
            type: CMDInputType.Integer,
            default_values: [0, 0, 0],
            width_level: 1,
        },
    ],
    [
        {
            name: 'x',
            ui_name: 'x坐标',
            type: CMDInputType.Integer,
            default_values: [0, 0, 0],
            width_level: 1,
        },
        {
            name: 'y',
            ui_name: 'y坐标',
            type: CMDInputType.Integer,
            default_values: [0, 0, 0],
            width_level: 1,
        },
    ],
];

const AddLightMap = {
    ['SpotLight']: LightType.Spot,
    ['DownLight']: LightType.Down,
    ['CeilingLight']: LightType.Ceiling,
    ['StripLight']: LightType.Strip,
    ['DoubleHeadDownLight']: LightType.DoubleHeadDown,
    ['FlowerLight']: LightType.Flower,
};

export class AddLightHandler extends SubHandlerBase {
    _light: Light;

    _pose_changed_info: EditLightInfo;
    _last_pos: Vector3;

    _is_add_mode: boolean;
    _is_first_movein: boolean;
    _is_movable: boolean;

    constructor(handler: EditModeHandler, name: string) {
        super(handler, name, [
            {
                name: 'x',
                ui_name: 'x坐标',
                type: CMDInputType.Integer,
                default_values: [0, 0, 0],
                width_level: 1,
            },
            {
                name: 'y',
                ui_name: 'y坐标',
                type: CMDInputType.Integer,
                default_values: [0, 0, 0],
                width_level: 1,
            },
            { name: 'width', ui_name: '宽', type: CMDInputType.Integer, width_level: 1, minval: 90, maxval: 200 },
            { name: 'height', ui_name: '高', type: CMDInputType.Integer, width_level: 1, minval: 90, maxval: 200 },
            { name: 'trunOffLight', ui_name: '是否关灯', type: CMDInputType.CheckBox, width_level: 1 },
            { name: 'light_color', ui_name: '颜色', type: CMDInputType.Color, width_level: 1 },
            { name: 'lightIntensity', ui_name: '灯光大小', type: CMDInputType.Slider, width_level: 2 },
        ]);

        this._light = null;
        this._pose_changed_info = null;
        this._last_pos = new Vector3();

        this._is_add_mode = false;
        this._is_first_movein = false;
        this._is_movable = false;

        let scope = this;

        this.command_inputs['x'].update_callback = function (cmd) {
            scope.changePosition();
        };
        this.command_inputs['y'].update_callback = function (cmd) {
            scope.changePosition();
        };

        this.command_inputs['lightIntensity'].update_callback = function (cmd) {
            scope.changeLightIntensity();
        };

        this.command_inputs['width'].update_callback = function (cmd) {
            scope.changeSize();
        };
        this.command_inputs['height'].update_callback = function (cmd) {
            scope.changeSize();
        };
        this.command_inputs['light_color'].update_callback = function (cmd) {
            scope.changeColor();
        };
        this.command_inputs['trunOffLight'].update_callback = function (cmd) {
            scope.openLight();
        };
    }
    get x() {
        return this.getValue('x');
    }
    set x(val: number) {
        this.setValue('x', val);
    }

    get y() {
        return this.getValue('y');
    }
    set y(val: number) {
        this.setValue('y', val);
    }

    get width() {
        return this.getValue('width');
    }
    set width(val) {
        this.setValue('width', val);
    }

    get height() {
        return this.getValue('height');
    }
    set height(val) {
        this.setValue('height', val);
    }

    // 灯光强弱
    get intensity() {
        return this.getValue('lightIntensity');
    }
    set intensity(val) {
        this.setValue('lightIntensity', val);
    }

    get color() {
        return this.getStringSelected('light_color');
    }

    set color(val) {
        this.setStringSelected('light_color', val);
    }

    get trunOffLight() {
        return this.getValue('trunOffLight');
    }
    set trunOffLight(val) {
        this.setValue('trunOffLight', val);
    }

    getWidgetLightInfo() {
        this.x = this._light.x;
        this.y = this._light.y;
        this.intensity = this._light._light_intensity;
        this.width = this._light._light_width;
        this.height = this._light._light_height;

        this.intensity === 0 ? (this.trunOffLight = 1) : (this.trunOffLight = 0);
        const [r, g, b] = this._light._light_color;
        const R = r.toString(16).toUpperCase();
        const G = g.toString(16).toUpperCase();
        const B = b.toString(16).toUpperCase();

        this.color = '#' + (R === '0' ? '00' : R) + (G === '0' ? '00' : G) + (B === '0' ? '00' : B);

        this.name = this._light.name;
    }

    // 改变位置
    changePosition() {
        this._light.center.set(this.x, this.y, 0);
        this._pose_changed_info.light = this._light;

        this._handler.update();
    }

    // 改变灯光强弱
    changeLightIntensity() {
        this._light._light_intensity = this.intensity;
        this._pose_changed_info.light = this._light;
        if (this.intensity === 0) this.trunOffLight = 1;
        else this.trunOffLight = 0;
        this._handler.update();
    }

    // 改变灯光大小（只有灯带可以）
    changeSize() {
        this._light._light_width = this.width;
        this._light._light_height = this.height;
        this._pose_changed_info.light = this._light;
        this._handler.update();
    }

    // 改变颜色
    changeColor() {
        const r = parseInt(this.color.slice(1, 3), 16);
        const g = parseInt(this.color.slice(3, 5), 16);
        const b = parseInt(this.color.slice(5, 7), 16);

        const colorArr = [r, g, b];
        this._light._light_color = colorArr;
        this._pose_changed_info.light = this._light;
        this._handler.update();
    }

    // 开关灯
    openLight() {
        // 关灯
        if (this.trunOffLight) {
            this.intensity = 0;
        } else {
            // 开灯
            this.intensity = 10;
        }
        this.changeLightIntensity();
    }

    enter(state?: number): void {
        // 点击画灯入口
        super.enter(state);
        if (!this._light) {
            this._is_first_movein = true;
        }
    }
    leave(state?: number): void {
        this._light = null;
        super.leave(state);
        this._handler._active_sub_handler = null;
        this._handler.update();
    }

    onmousedown(ev: I_MouseEvent): void {
        // 点击事件，让两个灯信息里的checked取消
        if (this._light) this._light._is_checked = false;
        if (this._pose_changed_info && this._pose_changed_info._light) this._pose_changed_info._light._is_checked = false;

        let scope = this;
        let p: Vector3 = new Vector3(ev.posX, ev.posY, 0);
        let vertex = this._handler.selectVertexByMouse(p.x, p.y);
        if (vertex) {
            this._handler.runCommand('Comment');
            return;
        }
        if (this._is_add_mode) {
            this._is_movable = false;
        } else {
            let ans_light: Light = null;
            this._is_movable = true;

            // 遍历灯中所有模型
            for (let light of this.manager.plane.models) {
                if (light instanceof Light) {
                    // 鼠标在canvas中坐标
                    let ox = ev._ev.offsetX - this.manager._canvas.offsetLeft;
                    let oy = ev._ev.offsetY - this.manager._canvas.offsetTop;
                    // 坐标是否在灯上
                    if (light.isPickable(ox, oy)) {
                        ans_light = light;
                        break;
                    }
                }
            }
            // 如果在灯上执行下面操作
            if (ans_light) {
                this._light = ans_light;
                super.show(false, this._light.name);
                if (!this._is_add_mode) this._pose_changed_info = new EditLightInfo(this.manager);

                this.getWidgetLightInfo();

                // this.size = Math.ceil((this._light._light_size - 1 + 0.1) * 10);
                this._pose_changed_info.light = this._light;

                this._light._is_checked = true;
                this._pose_changed_info._light._is_checked = true;
                this._pose_changed_info.recordSrc();
                this._pose_changed_info.recordDst();
            } else {
                this._light = null;
            }
        }

        this._last_pos.copy(p);
        this._handler.update();
    }

    onmousemove(ev: I_MouseEvent): void {
        let p = new Vector3(ev.posX, ev.posY, 0);
        if (this._is_first_movein) {
            if (!this._light) {
                let factory = new LightFactory(new Vector3(p.x, p.y, 0));
                this._light = factory.createLight(AddLightMap[this.command_name]);
                let info = new AddOrRemoveLightInfo(AddOrRemoveType.Add, this.manager);
                this.getWidgetLightInfo();
                info._light = this._light;
                info.apply();
                this.manager.appendOperationInfo(info);
                for (let light of this.manager.plane.models) {
                    if (light instanceof Light) {
                        light._is_checked = false;
                    }
                }
                this._light._is_checked = true;

                this._is_add_mode = true;
                this._is_first_movein = false;
                this._is_movable = true;

                this._handler.update();
                this._pose_changed_info = new EditLightInfo(this.manager);
            }
            // 移动
        } else if (this._light && this._is_movable) {
            this.x = this._light.x;
            this.y = this._light.y;

            let center = this._light.center;
            center.sub(this._last_pos.clone().sub(p));

            this._light.center = center;

            if (!this._is_add_mode) {
                this._pose_changed_info.light = this._light;
                this._pose_changed_info.recordDst();
                this.manager.appendOperationInfo(this._pose_changed_info);
            }
            this._handler.update();
            this.alignLight();
        }
        this._last_pos.copy(p);
    }

    alignLight() {
        // 有没有在一条线上的
        // if (this.manager.plane.models.length > 1) {
        let max_x_position: Vector3 = null;
        let max_y_position: Vector3 = null;
        let min_x_position: Vector3 = null;
        let min_y_position: Vector3 = null;
        let mv_x = this._light.center.x;
        let mv_y = this._light.center.y;

        for (let light of this.manager.plane.models) {
            let md_x = light.center.x;
            let md_y = light.center.y;

            if (light !== this._light) {
                if (Math.abs(mv_x - md_x) < 3) {
                    this._light.center.x = light.center.x;

                    // // 没有max_x,min_x直接赋值
                    if (!max_x_position) {
                        max_x_position = md_y >= mv_y ? light.center.clone() : this._light.center.clone();
                        min_x_position = md_y < mv_y ? light.center.clone() : this._light.center.clone();
                    }
                    // 有判断谁的远,谁的近
                    max_x_position.y = Math.max(max_x_position.y, md_y, mv_y);
                    min_x_position.y = Math.min(min_x_position.y, md_y, mv_y);
                }
                if (Math.abs(mv_y - md_y) < 3) {
                    this._light.center.y = light.center.y;
                    // 没有max_y,min_y直接赋值
                    if (!max_y_position) {
                        max_y_position = md_x >= mv_x ? light.center.clone() : this._light.center.clone();
                        min_y_position = md_x < mv_x ? light.center.clone() : this._light.center.clone();
                    }
                    max_y_position.x = Math.max(max_y_position.x, md_x, mv_x);
                    min_y_position.x = Math.min(min_y_position.x, md_x, mv_x);
                }
            }
        }

        if (max_x_position) {
            max_x_position.add(new Vector3(0, 10, 0));
            min_x_position.sub(new Vector3(0, 10, 0));
            this.manager.painter.drawEdge(max_x_position, min_x_position);
        }
        if (max_y_position) {
            max_y_position.add(new Vector3(10, 0, 0));
            min_y_position.sub(new Vector3(10, 0, 0));
            this.manager.painter.drawEdge(max_y_position, min_y_position);
        }
    }
    onmouseup(ev: I_MouseEvent): void {
        this._is_add_mode = false;

        if (!this._light) {
            this.leave();
        }
        this._is_movable = false;
        this._handler.update();
    }
    ondbclick(ev: I_MouseEvent): void {
        this._is_first_movein = false;
        for (let light of this.manager.plane.models) {
            if (light instanceof Light) {
                // 鼠标在canvas中坐标
                let ox = ev._ev.offsetX - this.manager._canvas.offsetLeft;
                let oy = ev._ev.offsetY - this.manager._canvas.offsetTop;
                // 坐标是否在灯上
                if (light.isPickable(ox, oy)) {
                    light._is_checked = true;
                    this._light = light;
                    // this._light.center.set(this.x, this.y, 0);
                    this.getWidgetLightInfo();

                    break;
                }
            }
        }
        this._handler.update();
    }

    drawCanvas(): void {}

    runCommand(cmd_name: string): void {
        if (cmd_name === 'Delete') {
            let del_info = new AddOrRemoveLightInfo(AddOrRemoveType.Remove, this.manager);
            del_info.light = this._light;
            del_info.apply();
            this.manager.appendOperationInfo(del_info);
        }
        if (cmd_name === 'confirm') {
            this._light._is_checked = false;
        }
    }
}
