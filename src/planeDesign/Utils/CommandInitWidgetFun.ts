import { CommandHandler } from './CommandHandler';
import { CommandInput } from './CommandInput';

export const InitDetailFunctions: { [key: string]: (cmd: CommandInput, inputs_div: HTMLDivElement, handler?: CommandHandler) => void } = {};
export enum CMDInputType {
    Label = 'label',
    CheckBox = 'checkbox',
    Integer = 'integer',
    Float = 'float',
    Point2D = 'point2d',
    Point3D = 'point3d',
    SelectEdge = 'select_edge',
    SelectVertex = 'select_vertex',
    Text = 'Text',
    StringList = 'StringList',
    CitySelector = 'CitySelector',
    MaterialSelector = 'MaterialSelector',
    ExampleSelector = 'ExampleSelector',
    Buttons = 'Buttons',
    Slider = 'Slider',
    Color = 'Color'
}

// InitDetailFunctions[CMDInputType.Label] = (cmd:CommandInput, inputs_div:HTMLDivElement)=>{
//     let label = document.createElement("div") as HTMLSpanElement;

//     label.className = "CommandLabel";
//     inputs_div.appendChild(label);
//     label.innerHTML = cmd.text;

//     cmd._onshow_update =  ()=>{
//         label.innerHTML = `${cmd.text}`;
//     }
//     cmd._setval_update =  ()=>{
//         label.innerHTML = `${cmd.text}`;
//     }
// }
InitDetailFunctions[CMDInputType.CheckBox] = (cmd:CommandInput, inputs_div:HTMLDivElement)=>{
    let input = document.createElement("input") as HTMLInputElement;
    input.type = "checkbox";
    inputs_div.appendChild(input);
    cmd._input_eles = [input];
    input.onchange = (ev)=>{
        cmd.x = input.checked ?1:0;
        cmd.onchange();
    }
    cmd._onshow_update = ()=>{
        input.checked = (cmd.value == 1)?true:false;
    }
    cmd._setval_update =  ()=>{
        input.checked = (cmd.value == 1)?true:false;
    }

}
InitDetailFunctions[CMDInputType.Integer] = (cmd: CommandInput, inputs_div: HTMLDivElement) => {
    let input = document.createElement('input') as HTMLInputElement;
    input.type = 'number';
    input.step = '1';
    input.value = '' + cmd.value;
    input.min = `${cmd.minval}`;
    input.max = `${cmd.maxval}`;

    if (cmd.name === 'width' || cmd.name === 'height') {
        if(!cmd.enabled) input.setAttribute('disabled', 'disabled');
    }


    inputs_div.appendChild(input);
    cmd._input_eles = [input];
    input.oninput = ev => {
        cmd.x = parseInt(input.value);
        cmd.onchange();
    };
    cmd._onshow_update = () => {
        input.value = `${cmd.value}`;
    };
    cmd._setval_update = () => {
        input.value = `${cmd.value}`;
    };
};

const SetFloatXdFunction = (cmd: CommandInput, inputs_div: HTMLDivElement) => {
    let plist = ['x'];
    if (cmd.type === CMDInputType.Point2D) plist = ['x', 'y'];
    else if (cmd.type === CMDInputType.Point3D) plist = ['x', 'y', 'z'];

    let update_list: (() => void)[] = [];

    let id_select: HTMLSelectElement = null;

    if (cmd.options_list !== undefined && cmd.options_list.length > 0 && plist.length < 3) {
        id_select = document.createElement('select') as HTMLSelectElement;
        inputs_div.appendChild(id_select);
        id_select.onchange = function (ev) {
            let data = cmd.getValuesBySelect(id_select.selectedIndex);
            for (let j = 0; j < data.length && j < cmd.options_list.length; j++) {
                cmd._values[j] = data[j];
            }
            cmd._setval_update();
        };
    }
    let update_options_selected = function () {
        let mi = -1;
        let error = -1;
        for (let i = 0; i < cmd.options_list.length; i++) {
            if (cmd.getValuesBySelect) {
                let data = cmd.getValuesBySelect(i);
                let error_1 = 0;
                for (let j = 0; j < data.length && j < cmd._values.length; j++) {
                    error_1 += Math.abs(data[j] - cmd._values[j]);
                }
                if (mi < 0 || error_1 < error) {
                    mi = i;
                    error = error_1;
                }
            }
        }
        if (mi >= 0) id_select.selectedIndex = mi;
    };
    cmd._input_eles = [];
    for (let dx of plist) {
        let input = document.createElement('input') as HTMLInputElement;
        input.type = 'number';
        input.step = `${cmd.step}`;
        input.value = `${cmd[dx]}`;
        input.min = `${cmd.minval}`;
        input.max = `${cmd.maxval}`;
        inputs_div.appendChild(input);
        cmd._input_eles.push(input);
        input.onchange = ev => {
            cmd._last_updated = dx;
            cmd[dx] = parseFloat(input.value);
            cmd.onchange();
            update_options_selected();
        };
        update_list.push(() => {
            input.value = `${cmd[dx]}`;
        });
    }

    cmd._onshow_update = () => {
        for (let cb of update_list) {
            cb();
        }

        if (id_select) {
            let options_num = cmd.options_list.length;
            let options_html = '';
            for (let i = 0; i < options_num; i++) {
                options_html += `<option value="${i}" data-value="${cmd.options_list[i][0]}"> ${cmd.options_list[i][1]} </option>`;
            }

            id_select.innerHTML = options_html;
        }
    };

    cmd._setval_update = () => {
        for (let cb of update_list) {
            cb();
        }
    };
};

InitDetailFunctions[CMDInputType.Float] = SetFloatXdFunction;
// InitDetailFunctions[CMDInputType.Point2D] = SetFloatXdFunction;
// InitDetailFunctions[CMDInputType.Point3D] = SetFloatXdFunction;

InitDetailFunctions[CMDInputType.Text] = (cmd, inputs_div) => {
    let input = document.createElement('input') as HTMLInputElement;
    input.type = 'text';
    input.value = '' + cmd.text;
    inputs_div.appendChild(input);
    cmd._input_eles = [input];
    input.oninput = ev => {
        cmd.text = input.value;
        cmd.onchange();
    };
    cmd._onshow_update = () => {
        input.value = `${cmd.text}`;
    };
    cmd._setval_update = () => {
        input.value = `${cmd.text}`;
    };
};

InitDetailFunctions[CMDInputType.Slider] = (cmd, inputs_div) => {
    let input = document.createElement('input') as HTMLInputElement;
    input.type = 'range';
    input.max = '10';
    input.min = '0';

    inputs_div.appendChild(input);
    input.oninput = () => {
        cmd.value = parseInt(input.value);
        cmd.onchange();
    };

    cmd._onshow_update = () => {
        input.value = `${cmd.value}`;
    };
    cmd._setval_update = () => {
        input.value = `${cmd.value}`;
    };
};

InitDetailFunctions[CMDInputType.Color] = (cmd, inputs_div) => {
    let input = document.createElement('input') as HTMLInputElement;
    input.type = 'color';
    if(cmd.name === 'light_color'){
        if(!cmd.enabled) input.setAttribute('disabled', 'disabled');
    }
    
    inputs_div.appendChild(input);
    input.oninput = () => {
        cmd.text = input.value
        cmd.onchange();
    };

    cmd._onshow_update = () => {
        input.value = `${cmd.text}`;
    };
    cmd._setval_update = () => {
        input.value = `${cmd.text}`;
    };
};

// const SelectVertexFunction = (cmd:CommandInput,inputs_div:HTMLDivElement,handler:CommandHandler)=>{
//     let id_select = document.createElement("select") as HTMLSelectElement;
//     cmd._input_eles =[id_select];

//     let onshow_callback = function()
//     {
//         let edge_num = cmd.getEdgeNum();
//         let options_html = "";
//         for(let i=0; i < edge_num; i++)
//         {
//             options_html +=`<option value="${i}"> ${i} </option>`
//         }

//         id_select.innerHTML = options_html;
//     }

//     id_select.onclick = function()
//     {
//         handler.active_command = cmd;
//     }
//     id_select.onchange = function()
//     {
//         cmd.value = parseInt(id_select.value);
//         cmd.onchange();
//     }
//     inputs_div.appendChild(id_select);
//     cmd._onshow_update =  onshow_callback;
//     cmd._setval_update = ()=>{
//         id_select.value = `${cmd.value}`;
//     }

// }
// InitDetailFunctions[CMDInputType.SelectVertex] = SelectVertexFunction;
// InitDetailFunctions[CMDInputType.SelectEdge] = SelectVertexFunction;

// InitDetailFunctions[CMDInputType.StringList] = (cmd:CommandInput,inputs_div:HTMLDivElement,handler:CommandHandler)=>{
//     let id_select = document.createElement("select") as HTMLSelectElement;
//     cmd._input_eles =[id_select];

//     let onshow_callback = function()
//     {
//         if(cmd.getOptionsList)
//         {
//             cmd.options_list = cmd.getOptionsList();
//         }
//         let options_len = cmd.options_list.length;
//         let options_html = "";
//         let first_valid_val = "";
//         for(let i=0; i < options_len; i++)
//         {
//             if(cmd.unvalid_option_values[cmd.options_list[i][0]] === 1)
//             {
//                 continue;
//             }
//             if(first_valid_val.length == 0)
//             {
//                 first_valid_val = cmd.options_list[i][0];
//             }
//             options_html +=`<option value="${cmd.options_list[i][0]}" data-value="${cmd.options_list[i][0]}"}> ${cmd.options_list[i][1]} </option>`
//         }
//         id_select.innerHTML = options_html;

//         if(cmd.text === "" || cmd.unvalid_option_values[cmd.text]===1)
//         {
//             cmd.text = first_valid_val;
//         }
//         id_select.value = cmd.text;

//     }
//     id_select.onchange = function()
//     {
//         // cmd.value = parseInt(id_select.value);
//         cmd.text =  id_select.value;
//         cmd.onchange();
//     }
//     inputs_div.appendChild(id_select);
//     cmd._onshow_update =  onshow_callback;
//     cmd._setval_update = ()=>{
//         id_select.value = `${cmd.text}`;
//     }
// }

// InitDetailFunctions[CMDInputType.Buttons] = (cmd, inputs_div,handler)=>{
//     for(let btn_def of cmd.cmd_buttons)
//     {
//         let btn = document.createElement("button") as HTMLButtonElement;
//         inputs_div.appendChild(btn);
//         btn.innerHTML = btn_def.name;
//         btn.onclick = function(){
//             if(btn_def.callback !== undefined)
//             {
//                 btn_def.callback();
//             }
//             else{
//                 handler.runCommand(btn_def.cmd_name);
//             }
//         }
//     }
// }

// InitDetailFunctions[CMDInputType.CitySelector] = (cmd,inputs_div,handler)=>{
//     let layui = (window as any).layui;
//     let input_ele = document.createElement("input") as HTMLInputElement;
//     input_ele.name = cmd.name;
//     inputs_div.appendChild(input_ele);
//     cmd._onshow_update = function(){
//         if(!cmd._options_loaded)
//         {
//             layui.use(['jquery', 'cascader'], function () {
//                 var $ = layui.jquery, cascader = layui.cascader;

//                 let city_list = GetZB_SupportedProvinceCities();
//                 let t_cascader = cascader.render({
//                     elem: input_ele,
//                     multiple: false,
//                     props: {
//                         label: 'name',
//                         value: 'name',
//                         children: 'city'
//                     },
//                     options:city_list,
//                     onChange (curr, value) {
//                         cmd.text = curr;
//                         // console.log(cmd.text);
//                         cmd.onchange();
//                     }
//                 });
//                 cmd._setval_update = ()=>{
//                     let vlist = cmd.text.split(",");

//                     t_cascader.setSelectedValue(vlist);
//                 }

//                 cmd._setval_update();

//             });

//             cmd._options_loaded = true;
//         }

//     }
// }
// InitDetailFunctions[CMDInputType.ExampleSelector] = (cmd,inputs_div,handler)=>{
//     let layui = (window as any).layui;
//     let input_ele = document.createElement("input") as HTMLInputElement;
//     input_ele.name = cmd.name;
//     inputs_div.appendChild(input_ele);
//     cmd._onshow_update = function(){
//         if(!cmd._options_loaded)
//         {
//             layui.use(['jquery', 'cascader'], function () {
//                 var $ = layui.jquery, cascader = layui.cascader;

//                 let example_list = SwjFetchApi.GetExampleList();
//                 let t_cascader = cascader.render({
//                     elem: input_ele,
//                     multiple: false,
//                     showAllLevels: -1,
//                     props: {
//                         label: 'name',
//                         value: 'id',
//                         children: 'list'
//                     },
//                     options:example_list,
//                     onChange (curr, value) {
//                         let vals = (curr as string).split(",");

//                         if(vals.length >=1) cmd.x = ~~vals[vals.length-1]; else cmd.x = 0;
//                         if(vals.length >= 2) cmd.y = ~~vals[vals.length-2]; else cmd.y = 0;
//                         if(vals.length >= 3) cmd.z = ~~vals[vals.length-3]; else cmd.z = 0;
//                         console.log(vals);
//                         cmd.onchange();
//                     }
//                 });

//             });

//             cmd._options_loaded = true;
//         }

//     }
// }

// InitDetailFunctions[CMDInputType.MaterialSelector] = (cmd,inputs_div,handler)=>{
//     let layui = (window as any).layui;
//     let input_ele = document.createElement("input") as HTMLInputElement;
//     input_ele.name = cmd.name;

//     inputs_div.appendChild(input_ele);

//     let preview_img = document.createElement("img") as HTMLImageElement;
//     preview_img.className = "preview_img";
//     cmd._row_div.appendChild(preview_img);
//     cmd._row_div.className = "CommandInputRow CommandInputRowWithImg";

//     if(cmd._width_level == 1)
//     {
//         cmd._row_div.className+=" CommandInputRowWidth1";
//     }

//     cmd._cate_img = preview_img;
//     cmd._onshow_update = function(){

//         if(!cmd._options_loaded)
//         {
//             let categoryMaterials = cmd.getCategoryMaterialRoots();
//             if(!categoryMaterials) return;

//             layui.use(['jquery', 'cascader'], function () {
//                 var $ = layui.jquery, cascader = layui.cascader;

//                 let t_cascader = cascader.render({
//                     elem: input_ele,
//                     multiple: false,
//                     showAllLevels: cmd._show_level,
//                     props: {
//                         label: 'CategoryName',
//                         value: 'CategoryId',
//                         children: 'CategoryList'
//                     },
//                     options:categoryMaterials,
//                     onChange (curr, value) {
//                         let vals = (curr as string).split(",");
//                         if(vals.length >=1) cmd.x = ~~vals[vals.length-1]; else cmd.x = 0;
//                         if(vals.length >= 2) cmd.y = ~~vals[vals.length-2]; else cmd.y = 0;
//                         if(vals.length >= 3) cmd.z = ~~vals[vals.length-3]; else cmd.z = 0;

//                         let input_tt = cmd._row_div.querySelectorAll("input.cascader-input__inner")[0] as HTMLInputElement;
//                         cmd.tooltip_description = input_tt.value;
//                         cmd.onchange();
//                     }
//                 });

//                 cmd._setval_update = ()=>{
//                     let vlist = [];
//                     if(cmd.z !== 0) vlist.push(cmd.z);
//                     if(cmd.y !== 0) vlist.push(cmd.y);
//                     if(cmd.x !== 0) vlist.push(cmd.x);

//                     t_cascader.setSelectedValue(vlist);
//                 }
//                 cmd._setval_update();
//             });

//             cmd._options_loaded = true;
//         }

//     }
// }
