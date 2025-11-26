//@ts-nocheck
import { OperationManager } from './OperationManager';
export class OperationInfo {
    public operation_name: string;
    public time: number;

    constructor() {}
    isValid() {
        return true;
    }
    onActive() {}

    undo(operation_manager?: OperationManager): boolean {
        return true;
    }

    redo(operation_manager?: OperationManager): boolean {
        return true;
    }

    pop(
        operation_manager?: OperationManager // 真正地清空出操作历史
    ) {}

    information(): string {
        return '';
    }
}
