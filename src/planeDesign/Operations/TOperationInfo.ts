import { EditManager } from "../EditManager";
import { OperationInfo } from "./OperationInfo";
import { OperationManager } from "./OperationManager";

export enum AddOrRemoveType
{
    Add = "Add",
    Remove = "Remove"
}

export class TOperationInfo extends OperationInfo
{
    _edit_manager : EditManager;
    _table_changed : boolean;
    constructor(edit_manager : EditManager)
    {
        super();
        this._edit_manager = edit_manager;
        this._table_changed = true;
    }

    isValid()
    {
        return true;
    }
    onActive()
    {
        if(this._table_changed)
        {
            if(this.plane)
            {
                this.plane._plane_timestamp = (new Date()).getTime();
            }
        }   
    }
    get plane()
    {
        return this._edit_manager.plane;
    }
    undo(operation_manager?: OperationManager): boolean {
        return true;
    }
    redo(operation_manager?: OperationManager): boolean {
        return true;
    }
    pop(operation_manager?: OperationManager): void {
        
    }
    information(): string {
        return "";
    }
}