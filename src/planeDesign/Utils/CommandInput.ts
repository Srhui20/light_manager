import { CMDInputType } from './CommandInitWidgetFun';

type H5_InputElement = HTMLInputElement | HTMLSelectElement;
export enum CommandEnterState {
    Default = 0,
    ElementSelected = 1,
}

export enum CommandLeaveState {
    Default = 0,
    CloseBtn = 1,
}

export interface I_CommandInput {
    type?: string;
    name?: string;
    ui_name?: string;
    description?: string;
    bind_vertex?: IPosition;
    default_values?: number[];
    width_level?: number;
    text?: string;
    options_list?: string[][];
    buttons?: I_CMDButtonDef[];
    step?: number;
    maxval?: number;
    minval?: number;
    show_level?: number;

    row_height?: number;

    getValuesBySelect?: (id: number, val?: string, input?: CommandInput) => number[];
    getOptionsList?: () => string[][];
    update_callback?: (input?: CommandInput) => void;
    getEdgeNum?: () => number;
    // getCategoryMaterialRoots ?:()=>I_CategoryData[];
}

export interface I_CMDButtonDef {
    name: string;
    cmd_name?: string;
    callback?: () => void;
}

export interface IPosition {
    x: number;
    y: number;
    z: number;
}

export class CommandInput {
    type: string;
    name: string;
    ui_name: string;

    description: string;
    bind_vec3: IPosition;
    update_callback: (input?: CommandInput) => void;
    getValuesBySelect?: (id: number, val?: string, input?: CommandInput) => number[];
    getEdgeNum: () => number;

    _onshow_update: () => void;
    _setval_update: () => void;

    _show_level: number;
    _width_level: number;
    _row_div: HTMLDivElement;
    _input_eles: H5_InputElement[];
    _cate_img: HTMLImageElement;
    _values: number[];
    _text: string;
    _options_loaded: boolean;
    default_values: number[];
    step: number;
    maxval: number;
    minval: number;
    options_list: string[][];
    cmd_buttons: I_CMDButtonDef[];
    row_height: number;
    unvalid_option_values: { [key: string]: number };
    enabled: boolean;
    _last_updated: string;
    getOptionsList: () => string[][];

    static CtrlHideInputsClassName = 'ctrl_hide_inputs';
    constructor(parameters: I_CommandInput = {}) {
        this.type = parameters.type || CMDInputType.Integer;
        this.name = parameters.name || '  ';
        this.ui_name = parameters.ui_name || '';
        this.description = parameters.description || '';
        this.default_values = parameters.default_values || [0, 0, 0];
        this._values = [0, 0, 0];
        this.options_list = parameters.options_list || [];
        this.cmd_buttons = parameters.buttons || [];
        for (let i = 0; i < 3; i++) this._values[i] = this.default_values[i];
        this._width_level = parameters.width_level || 4;
        this._show_level = parameters.show_level || -1;
        this.step = parameters.step || 1;
        this.row_height = parameters.row_height || null;
        this.minval = parameters.minval || 1;
        this.maxval = parameters.maxval || 999999;
        this._input_eles = [];
        this._options_loaded = false;
        this._onshow_update = null;
        this._setval_update = null;
        this._row_div = null;
        this._cate_img = null;
        this.enabled = true;
        this._text = parameters.text || '';
        this.unvalid_option_values = {};
        this._last_updated = '';
    }

    get value(): number {
        return this._values[0];
    }
    set value(x: number) {
        this._values[0] = x;
    }

    get text() {
        return this._text;
    }
    set text(t: string) {
        this._text = t;
    }
    get x(): number {
        return this._values[0];
    }
    set x(val: number) {
        this._values[0] = val;
    }

    get y(): number {
        return this._values[1];
    }
    set y(val: number) {
        this._values[1] = val;
    }

    get z(): number {
        return this._values[2];
    }

    set z(val: number) {
        this._values[2] = val;
    }

    onchange() {
        if (this.update_callback) {
            console.log('update_callback');

            this.update_callback(this);
        }
        if (this.bind_vec3) {
        }
    }

    hideDiv() {
        if (this._row_div) {
            this._row_div.style.display = 'none';
        }
    }

    showDiv() {
        if (this._row_div) {
            this._row_div.style.display = 'block';
        }
    }
}
