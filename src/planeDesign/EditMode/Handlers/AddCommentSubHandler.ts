import { Vector3 } from 'three';
import { SubHandlerBase } from './SubHandlerBase';
import { Comment } from '../../Models/Comment';
import { EditCommentInfo } from '../../Operations/Operations/EditCommentInfo';
import { EditModeHandler } from '../EditModeHandler';
import { CMDInputType } from '../../Utils/CommandInitWidgetFun';
import { I_MouseEvent } from '../../EditManager';
import { CommandLeaveState } from '../../Utils/CommandInput';
import { AddOrRemoveCommentInfo } from '../../Operations/Operations/AddOrRemoveCommentInfo';
import { AddOrRemoveType } from '../../Operations/TOperationInfo';
import { Light } from '../../Models/Light/Light';
import { Painter } from '../../Painter';

export class AddCommentSubHandler extends SubHandlerBase {
    _p0: Vector3;
    _p1: Vector3;
    _p_point: Vector3;
    _last_pos: Vector3;
    _comment: Comment;
    _edit_comment_info: EditCommentInfo;
    _is_add_mode: boolean;

    constructor(handler: EditModeHandler) {
        super(handler, 'Comment', [
            { name: 'comment_text', ui_name: '备注信息', type: CMDInputType.Text, width_level: 2 },
            { name: 'font_size', ui_name: '字体大小', type: CMDInputType.Float, default_values: [10, 0, 0] , width_level: 1 },
            { name: 'font_color', ui_name: '文字颜色', type: CMDInputType.Color, width_level: 1 },

            // {name: "delete", ui_name: "删除", type: CMDInputType.Buttons, buttons:[
            //     {name:"删除", cmd_name:"Delete"}
            // ]}
        ]);

        this._p0 = null;
        this._p1 = null;
        this._p_point = null;
        this._last_pos = new Vector3();
        this._comment = null;
        this._edit_comment_info = null;
        this._is_add_mode = true;

        let scope = this
        this.command_inputs['font_size'].update_callback = function (cmd) {
            scope.changeSize();
        };
        this.command_inputs['comment_text'].update_callback = function (cmd) {
            scope.changeText();
        };
        this.command_inputs['font_color'].update_callback = function (cmd) {
            scope.changeColor();
        };
    }

    get font_size() {
        return this.getValue('font_size');
    }
    set font_size(val: number) {
        this.setValue('font_size', val);
    }
    get text() {
        return this.command_inputs['comment_text'].text;
    }
    set text(t: string) {
        this.command_inputs['comment_text'].text = t;
        this.command_inputs['comment_text']._setval_update();
    }
    get color() {
        return this.getStringSelected('font_color');
    }

    set color(val) {
        this.setStringSelected('font_color', val);
    }

    changeSize() {
        this._comment._font_size = this.font_size
        this._handler.update()
    }

    changeText(){ 
        this._comment._text = this.text
        this._handler.update()
    }
    changeColor(){
        const r = parseInt(this.color.slice(1, 3), 16);
        const g = parseInt(this.color.slice(3, 5), 16);
        const b = parseInt(this.color.slice(5, 7), 16);

        const colorArr = [r, g, b];
        
        this._comment._font_color = colorArr
        this._handler.update()
    }

    enter(state?: number): void {
        // 点击画灯入口
        super.enter(state);
        this._is_add_mode = true;
        this._comment = null;
        this._p0 = null;
        this._p1 = null;

        let e = window.event as MouseEvent;

        let p = new Vector3(e.offsetX, e.offsetY, 0);
        
        
        
        let v = this._handler.selectVertexByMouse(p.x, p.y);
        if (v) {
            v._attached_model._is_checked = true;
            if (v._attached_model.description)
                this.text = v._attached_model.description;
            this._handler.update();
            // if (!this._p0) {
            //     this._p0 = v.pos;
            //     this._p1 = this._p0.clone();
            //     this._p_point = this._p1;
            //     if (!this._comment) {
            //         this._comment = new Comment(this._p0, this._p1);
            //     }
            //     v._attached_comment = this._comment;
            //     let info = new AddOrRemoveCommentInfo(AddOrRemoveType.Add, this.manager);
            //     info.comment = this._comment;
            //     info.apply();
            //     this.manager.appendOperationInfo(info);
            //     this.updateComment();
            //     this._handler.update();
            // } else {
            //     if (this._p0.distanceTo(p) < this._p1.distanceTo(p)) {
            //         this._p_point = this._p0;
            //     } else {
            //         this._p_point = this._p1;
            //     }
            // }

            // this._is_add_mode = false;
        }
        let cm = this._handler.selectCommentByMouse(p.x, p.y)
        if (cm) {
            console.log("选取到comment");
            this._comment = cm;
            this.font_size = cm._font_size;
            this.text = cm._text;
        }
    }
    // 删除
    leave(state?: number): void {
        if (state === CommandLeaveState.Default) {
            if (this._is_add_mode) {
                if (this._comment) {
                    console.log('comment info !!!!!!!!!!!!!!!!!');
                }
            }
        }
        this._comment = null;
        this._p0 = null;
        this._p1 = null;
        this._handler.update();
        this._handler._active_sub_handler = null;
        super.leave(state);
    }

    onTextChanged() {
        if (this._comment) {
            this._comment._text = this.text;
            // this._comment._font_size = this.font_size;
            this._handler.update();
        }
    }

    updateComment() {
        if (this._p0 && this._p1) {
            if (this._comment) {
                this._comment._point0 = this._p0;
                this._comment._point1 = this._p1;
                this._comment._text = this.text;
            }
        }
    }
    onmousedown(ev: I_MouseEvent): void {   
        if (ev.buttons !== 1) return;
        let p: Vector3 = new Vector3().set(ev.posX, ev.posY, 0);
        if (this._is_add_mode) {
            console.log('进入了添加模式');

            if (!this._p0) {
                let v = this._handler.selectVertexByMouse(p.x, p.y);
                if (!v) return;
                this._p0 = v.pos;
                this._p1 = this._p0.clone();
                this._p_point = this._p1;
                if (!this._comment) {
                    this._comment = new Comment(this._p0, this._p1);
                }
                v._attached_comment = this._comment;
                let info = new AddOrRemoveCommentInfo(AddOrRemoveType.Add, this.manager);
                info.comment = this._comment;

                info.apply();
                this.manager.appendOperationInfo(info);
                this.updateComment();
                this._handler.update();
            } else {
                if (this._p0.distanceTo(p) < this._p1.distanceTo(p)) {
                    this._p_point = this._p0;
                } else {
                    this._p_point = this._p1;
                }
            }
        } else {
            let res = this._handler.selectCommentByMouse(ev);
            if (res) {
                this._comment = res;
                this._p0 = this._comment._point0;
                this._p1 = this._comment._point1;
                this.text = this._comment._text;

                this._edit_comment_info = new EditCommentInfo(this.manager);
                this._edit_comment_info.setComment(this._comment);

                let p0 = new Vector3().copy(p);
                if (this._p0.distanceTo(p0) < this._p1.distanceTo(p0)) {
                    this._p_point = this._p0;
                } else {
                    this._p_point = this._p1;
                }
            }
        }

        if (this._comment) {
            this.font_size = this._comment._font_size;
            const [r, g, b] = this._comment._font_color;
            const R = r.toString(16).toUpperCase();
            const G = g.toString(16).toUpperCase();
            const B = b.toString(16).toUpperCase();
            this.color = '#' + (R === '0' ? '00' : R) + (G === '0' ? '00' : G) + (B === '0' ? '00' : B);
        }

        this._last_pos.copy(p);
    }

    onmousemove(ev: I_MouseEvent): void {
        if (ev.buttons !== 1) return;
        let p: Vector3 = new Vector3().set(ev.posX, ev.posY, 0);
        if (!this._p1 || Painter.distance(p.x, p.y, this._p1.x, this._p1.y) > 30) return;
        let offset = p.clone().sub(this._last_pos);
        if (this._p_point) {
            this._p_point.add(offset);
        }

        this.updateComment();

        // if(this.is_edit_mode)
        if (true) {
            if (this._edit_comment_info) {
                this._edit_comment_info.recordDst();
                this.manager.appendOperationInfo(this._edit_comment_info);
            }
        }

        this._last_pos.copy(p);
        this._handler.update();
    }

    onmouseup(ev: I_MouseEvent): void {
        this._handler.update();
    }
    ondbclick(ev: I_MouseEvent): void {
        let res = this._handler.selectCommentByMouse(ev);
        console.log(res);
        
        if(res){
            this._is_add_mode = false
            this._comment = res
            this._edit_comment_info = new EditCommentInfo(this.manager)
            this.text = res._text
            this.font_size = res._font_size


            const [r, g, b] = this._comment._font_color;
            const R = r.toString(16).toUpperCase();
            const G = g.toString(16).toUpperCase();
            const B = b.toString(16).toUpperCase();
            this.color = '#' + (R === '0' ? '00' : R) + (G === '0' ? '00' : G) + (B === '0' ? '00' : B);
        }

        
        
        this._handler.update();
    }

    drawCanvas(): void {}

    runCommand(cmd_name: string): void {

        if(cmd_name === 'Delete'){
            console.log('删除');
            const del_info = new AddOrRemoveCommentInfo(AddOrRemoveType.Remove,this.manager)
            del_info._comment = this._comment
            del_info.apply()
        }
        if(cmd_name === 'confirm'){
            if(this._comment){
                this._comment._text = this.text;
                this._comment._font_size = this.font_size;
                this.text = '';
                
                let p = this._comment._point0;
                let res = this._handler.selectVertexByMouse(p.x, p.y);
                if (res) {
                    res._attached_model._is_checked = false;
                }
            }
           
            
        }
        
    }
}
