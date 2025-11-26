import { I_MouseEvent } from '../EditManager';
import { Light } from '../Models/Light/Light';
import { Model } from '../Models/Model';
import { InitDetailFunctions } from './CommandInitWidgetFun';
import { CommandInput, I_CommandInput } from './CommandInput';

/*
 * @Author: zj zhujie21@mail.ustc.edu.cn
 * @Date: 2023-06-04 10:20:00
 * @LastEditors: zj zhujie21@mail.ustc.edu.cn
 * @LastEditTime: 2023-06-15 10:14:32
 * @FilePath: \green-rice\src\planeDesign\Utils\CommandHandler.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export class CommandHandler {

    
    // name随着设置而变化
    name: string;

    // 永远不变
    command_name: string;
    // ui_name随着设置而变化
    command_ui_name: string;
    command_inputs: { [key: string]: CommandInput };

    _enter_state: number;

    widget_div: HTMLDivElement;

    constructor(name: string, command_inputs: I_CommandInput[]) {


        this.name = this.command_name = this.command_ui_name = name;

        this.command_inputs = {};
        this.widget_div = null;

        for (let cmd of command_inputs) {
            this.command_inputs[cmd.name] = new CommandInput(cmd);
        }

        this._enter_state = 0;
    }

    get ctrl_div(): HTMLDivElement {
        return document.getElementById('control_widgets') as HTMLDivElement;
    }

    get dialog_body(): HTMLDivElement {
        return document.getElementsByClassName('DialogBody')[0] as HTMLDivElement;
    }
    get command_title_div(): HTMLDivElement {
        return (document.getElementById('CommandName') as HTMLDivElement) || null;
    }
    setValue(name: string, val: number) {
        let input = this.command_inputs[name];
        if (input === undefined) return;

        input._values[0] = val;
        if (input._setval_update) input._setval_update();
    }

    getValue(name: string) {
        return this.command_inputs[name].value;
    }

    getStringSelected(name: string) {
        let input = this.command_inputs[name];
        if (input === undefined) return '';
        return input.text;
    }

    setStringSelected(name: string, target_str: string) {
        let input = this.command_inputs[name];
        if (input === undefined) return;
        input.text = target_str;
        input._setval_update();
    }

    setValueAt(name: string, index: number, val: number) {
        let input = this.command_inputs[name];
        if (input === undefined) return;

        input._values[index] = val;
        if (input._setval_update) input._setval_update();
    }

    // 初始化组件
    initWidget() {

        this.widget_div = document.createElement('div');
        this.widget_div.className = 'CommandDialog';
        this.widget_div.setAttribute('data-command', this.name);

        this.dialog_body.innerHTML = '';
        this.dialog_body.appendChild(this.widget_div);

        let scope = this;

        for (let cmd_name in this.command_inputs) {
            let cmd = this.command_inputs[cmd_name];

            let div = document.createElement('div');
            div.className = 'CommandInputRow';

            cmd._row_div = div;

            if (cmd._width_level === 1) {
                div.style.width = '50%';
            } else {
                div.style.width = '100%';
            }
            if (cmd.row_height) {
                div.style.height = `${cmd.row_height}px`;
            }

            this.widget_div.appendChild(div);

            // 处理ui
            if (cmd.ui_name.length) {
                let label_div = document.createElement('div');
                label_div.className = 'CommandInputLabel';
                label_div.innerHTML = cmd.ui_name || cmd.name;
                div.appendChild(label_div);
            }

            let inputs_div = document.createElement('div');
            inputs_div.className = 'CommandInputsGroup';
            let init_func = InitDetailFunctions[cmd.type];
            
            if(this.command_name==='StripLight') cmd.enabled = true
            else cmd.enabled = false

            if (init_func) {
                init_func(cmd, inputs_div, this);
                div.appendChild(inputs_div);
            }
        }
    }

    show(is_show_input: boolean = true, name: string = '') {
        this.command_name  = name || this.command_ui_name;

        this.command_title_div.innerHTML = (name || this.command_ui_name) + '属性列表 ';
        this.ctrl_div.style.display = 'block';
        let ctrl_position = JSON.parse(sessionStorage.getItem('ctrl_div_position'));
        if (ctrl_position && ctrl_position.left && ctrl_position.bottom) {
            this.ctrl_div.style.left = ctrl_position.left;
            this.ctrl_div.style.bottom = ctrl_position.bottom;
        } else {
            let ctrl_position = {
                left: '100px',
                bottom: '50px',
            };
            sessionStorage.setItem('ctrl_div_position', JSON.stringify({ left: ctrl_position.left, bottom: ctrl_position.bottom }));
            this.ctrl_div.style.left = ctrl_position.left;
            this.ctrl_div.style.bottom = ctrl_position.bottom;
        }

        this.initWidget();
    }

    showInputs() {}
    hideInputs() {
        let className = this.ctrl_div.className;
        if (className.indexOf(CommandInput.CtrlHideInputsClassName) < 0) {
            this.ctrl_div.classList.add(CommandInput.CtrlHideInputsClassName);
        }
    }

    hide() {
        // this.dialog_body.innerHTML = '';
        this.ctrl_div.style.display = 'none';
    }

    enter(state: number = 0) {
        this._enter_state = state;
        this.show();
    }
    leave(state: number = 0) {
        this.hide();
    }

    runCommand(cmd_name: string) {}
    onchange() {}

    onmousedown(ev: I_MouseEvent) {}
    onmousemove(ev: I_MouseEvent) {}
    onmouseup(ev: I_MouseEvent) {}

    /**
     * @param ev
     * @returns boolean  :  true, 常规;  false: 停止向上冒泡
     */
    onkeydown(ev: KeyboardEvent) {
        return true;
    }
    ondbclick(ev: I_MouseEvent) {
        this.onmousedown(ev);
        this.onmouseup(ev);
    }
    drawCanvas() {}
}
