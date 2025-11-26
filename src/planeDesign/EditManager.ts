/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-03 20:26:43
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-16 09:49:35
 * @FilePath: \green-rice\src\planeDesign\EditManager.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { EditModeHandler } from './EditMode/EditModeHandler';
import { LayoutModeHandle } from './EditMode/LayoutModeHandler';
import { Painter } from './Painter';
import { Plane } from './Plane';
import { OperationManager } from './Operations/OperationManager';
import { Vector3 } from 'three';

export interface I_MenuCommandAction {
    name: string;
    category?: string;
    ui_name?: string;
    ui_name2?: string;
    img?: string;
    checked?: boolean;
    div?: HTMLDivElement;
    width?: number;
    callback?: () => void;
}

export enum DrawingMode {
    Canvas2D,
    Webgl3D
}

export enum EditModes {
    Layout = 'layout'
}

export enum MouseButtonsNum {
    None = 0,
    LeftButton = 1,
    RightButton = 2,
    MidButton = 4
}

export interface I_MouseEvent {
    posX: number;
    posY: number;
    shiftKey?: boolean;
    ctrlKey?: boolean;
    altKey?: boolean;
    button?: number;
    buttons?: number;
    type?: string;
    _ev?: MouseEvent;
}

export const FILTER: number[] = [70, 70, 70, 0.5];

export class EditManager extends OperationManager {
    static instance: EditManager;

    _drawing_mode: DrawingMode;
    _handlers: { [key: string]: EditModeHandler };
    _current_handler: EditModeHandler;

    main_div_container: HTMLDivElement;
    control_widget_div: HTMLDivElement;
    command_header_row: HTMLDivElement;

    is_choose_control_widget: boolean;

    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;

    _canvas_bg: HTMLCanvasElement;
    _ctx_bg: CanvasRenderingContext2D;
    _bg_img_data: ImageData;

    _plnae_width: number;
    _plane_height: number;
    _plane_sc: number;

    _light_area_list: HTMLDivElement;

    plane: Plane;
    painter: Painter;

    private _focus_div: HTMLElement;
    private _last_ev_pos: Vector3;

    div_img_container: HTMLDivElement;
    div_img_comtainer_visible: boolean;

    constructor() {
        super();
        this._canvas = document.getElementById('main_canvas') as HTMLCanvasElement;
        this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;

        this._canvas_bg = document.getElementById('canvas_bg') as HTMLCanvasElement;
        this._ctx_bg = this._canvas_bg.getContext('2d') as CanvasRenderingContext2D;

        this._light_area_list = document.getElementsByClassName('light_area_list')[0] as HTMLDivElement;
        this.main_div_container = document.getElementsByClassName('main_container')[0] as HTMLDivElement;
        this.control_widget_div = document.getElementById('control_widgets') as HTMLDivElement;
        this.command_header_row = this.control_widget_div.getElementsByClassName('CommandHeaderRow')[0] as HTMLDivElement;
        this.div_img_container = document.getElementsByClassName('div_img_container')[0] as HTMLDivElement;
        this.div_img_comtainer_visible = false;

        this._last_ev_pos = new Vector3();

        EditManager.instance = this;
        (window as any).edit_manager = this;

        this._handlers = {};
        this.painter = new Painter(this._canvas);

        this._drawing_mode = DrawingMode.Canvas2D;
        let scope = this;

        this.initImage();

        this.initHandlers();

        this._canvas.onmousedown = (ev) => {
            // console.log('获取canvas');

            scope._focus_div = scope._canvas;
        };
        this._canvas.onmousemove = (ev) => {
            scope._focus_div = scope._canvas;
        };
        this._canvas.onmouseup = (ev) => {
            scope._focus_div = scope._canvas;
        };
        this._canvas.onmouseleave = (ev) => {
            scope._focus_div = null;
        };
        this._canvas.ondblclick = (ev) => {
            scope._focus_div = scope._canvas;
        };

        // 确定取消
        let ok_btn_div = this.control_widget_div.getElementsByClassName('CommandBtnOk')[0] as HTMLDivElement;
        let cancel_btn_div = this.control_widget_div.getElementsByClassName('CommandBtnCancel')[0] as HTMLDivElement;

        ok_btn_div.onclick = () => {
            scope.oncommand_ok();
        };
        cancel_btn_div.onclick = () => {
            scope.oncommand_cancel();
        };

        this.main_div_container.onmousedown = (ev) => {
            // console.log('点击main div');
            scope.onmousedown(ev);
        };
        this.main_div_container.onmousemove = (ev) => {
            scope.onmousemove(ev);
        };
        this.main_div_container.onmouseup = (ev) => {
            scope.onmouseup(ev);
        };
        this.main_div_container.ondblclick = (ev) => {
            scope.ondbclick(ev);
        };
        this.main_div_container.ontouchmove = (ev) => {
            ev.preventDefault();
        };
        this.main_div_container.onwheel = (ev) => {
            scope.onwheel(ev);
        };

        document.body.onkeydown = (ev) => {
            scope.onkeydown(ev);
        };
        // 移动
        this.command_header_row.onmousedown = (ev) => {
            scope._focus_div = scope.command_header_row;
        };
    }

    get width() {
        return this._canvas.width;
    }
    get height() {
        return this._canvas.height;
    }

    initImage() {
        const img = new Image();
        // img.src = '../../assets/images/1280x717.png';
        img.src = '../../assets/images/picture1.png';
        img.onload = () => {
            this._ctx_bg.drawImage(img, 0, 0, this.width, this.height);
            // this._bg_img_data = this._ctx_bg.getImageData(
            //     0,
            //     0,
            //     this.width,
            //     this.height
            // );
            // console.log(this._bg_img_data);
            this._ctx.fillStyle = `rgba(${FILTER[0]}, ${FILTER[1]}, ${FILTER[2]}, ${FILTER[3]})`;
            this._ctx.fillRect(0, 0, this.width, this.height);
            this.plane = new Plane(this.painter);
        };
    }

    initHandlers() {
        this._handlers = {};
        let handler = new LayoutModeHandle(this);
        //test
        this._current_handler = handler;

        for (let name in this._handlers) {
            // Handler初始化,暂时没有
            this._handlers[name].initHtml();
        }
        // this.setMode(EditModes.Layout);

        // let
    }

    setDrawingMode(mode: DrawingMode) {
        this._drawing_mode = mode;
        if (this._drawing_mode === DrawingMode.Canvas2D) {
            // this.cad_div.style.display = "block";
            // this.w3d_div.style.display = "none";
        } else {
            // this.cad_div.style.display = "none";
            // this.w3d_div.style.display = "block";
        }

        this.update();
    }

    // 显示小部件
    showPropertiesWidget() {}

    setMode(mode: string) {
        this._current_handler = this._handlers[mode];
    }

    update() {
        if (this._drawing_mode === DrawingMode.Canvas2D) {
            this.drawCanvas();
        } else {
            this.render3D();
        }
    }

    drawCanvas() {
        if (!this._current_handler) return;
        this._current_handler.drawCanvas();
    }

    render3D() {}

    turnIntoCanvasMouseEvent(ev: MouseEvent) {
        // console.log(ev, this.canvas.offsetLeft,this.body_div_container.offsetLeft);

        let ox = ev.offsetX - this._canvas.offsetLeft;
        let oy = ev.offsetY - this._canvas.offsetTop;

        // let pos = this.painter.canvas2world({ x: ox, y: oy });
        // console.log(pos);

        let pos = { x: ox, y: oy };

        let res: I_MouseEvent = {
            posX: pos.x,
            posY: pos.y,
            altKey: ev.altKey,
            ctrlKey: ev.ctrlKey,
            shiftKey: ev.shiftKey,
            button: ev.button,
            buttons: ev.buttons,
            type: ev.type,
            _ev: ev
        };
        return res;
    }

    onmousedown(ev: MouseEvent) {
        if (this._focus_div === this._canvas) {
            let t_ev = this.turnIntoCanvasMouseEvent(ev);
            if (this._current_handler) {
                // console.log('触发subhandler的mousedown');
                this._current_handler.onmousedown(t_ev);
            }
        } else {
            if (this._focus_div == this.command_header_row) {
                // 选中弹框
                // this._last_ev_pos.set(ev.clientX, ev.clientY, 0);
                this.is_choose_control_widget = true;
                this._last_ev_pos.set(ev.clientX, ev.clientY, 0);
            }
        }
    }

    onmousemove(ev: MouseEvent) {
        
        // 移动弹框
        if (this.is_choose_control_widget) {

            let widget = this.control_widget_div;

            // 移动弹框
            let dv = new Vector3();
            dv.set(ev.clientX, ev.clientY, 0);
            dv.sub(this._last_ev_pos);

            let left_text = widget.style.left;
            let bottom_text = widget.style.bottom;

            let xx = parseFloat(left_text.replace('px', '')) + dv.x;
            let yy = parseFloat(bottom_text.replace('px', '')) - dv.y;

            if (xx < 20) xx = 20;
            if (yy < 20) yy = 20;
            let m_width = this.main_div_container.clientWidth - 20 - widget.clientWidth;
            let m_height = this.main_div_container.clientHeight - 20 - widget.clientHeight;
            if (yy > m_height) yy = m_height;
            if (xx > m_width) xx = m_width;

            widget.style.left = `${xx}px`;
            widget.style.bottom = `${yy}px`;

            this._last_ev_pos.set(ev.clientX, ev.clientY, 0);
            sessionStorage.setItem('ctrl_div_position', JSON.stringify({ left: `${xx}px`, bottom: `${yy}px` }));
        }
        if (this._focus_div === this._canvas) {
            let t_ev = this.turnIntoCanvasMouseEvent(ev);
            if (this._current_handler) {
                this._current_handler.onmousemove(t_ev);
            }
        }
    }

    onmouseup(ev: MouseEvent) {
        if (this._focus_div === this._canvas) {
            let t_ev = this.turnIntoCanvasMouseEvent(ev);
            if (this._current_handler) {
                this._current_handler.onmouseup(t_ev);
            }
        } else if (this._focus_div == this.command_header_row) {
        }
        this.is_choose_control_widget = false;
        this._focus_div = null
    }

    oncontextmenu(ev: MouseEvent) {
        let t_ev = this.turnIntoCanvasMouseEvent(ev);
        if (this._current_handler) {
            this._current_handler.oncontextmenu(t_ev);
        }
    }
    ondbclick(ev: MouseEvent) {
        if (this._focus_div === this._canvas) {
            let t_ev = this.turnIntoCanvasMouseEvent(ev);
            if (this._current_handler) {
                this._current_handler.ondbclick(t_ev);
            }
            // console.log(ev);
        }

        this._focus_div = null;
        ev.preventDefault();
        ev.stopPropagation();
    }
    onwheel(ev: WheelEvent) {
        // console.log(ev);
        // console.log(ev.deltaY);
        if (ev.target !== this._canvas) return;
        ev.preventDefault();
        if (this._current_handler) {
            this._current_handler.onwheel(ev);
        }
    }

    onkeydown(ev: KeyboardEvent) {
        // console.log(ev.code);
        if (this._current_handler) {
            if (!this._current_handler.onkeydown(ev)) {
                return;
            }
        }
        if (ev.ctrlKey) {
            if (ev.code == 'KeyZ') {
                this.undo();
                this.update();
            } else if (ev.code == 'KeyY') {
                this.redo();
                this.update();
            } else if (ev.code == 'KeyM') {
                let menu_div = document.getElementById('refresh_menu');
                if (menu_div !== undefined && menu_div) {
                    for (let child of menu_div.children) {
                        (child as HTMLDivElement).style.display = 'block';
                    }
                }
                ev.preventDefault();
            }
        } else if (ev.code === 'Escape') {
            this.oncommand_cancel();
        }
    }
    oncommand_ok() {
        if (this._current_handler) {
            this._current_handler.oncommand_ok();
        }
    }
    oncommand_cancel() {
        if (this._current_handler) {
            this._current_handler.oncommand_cancel();
            // this._current_handler.leaveSubHandler();
        }
    }
}
