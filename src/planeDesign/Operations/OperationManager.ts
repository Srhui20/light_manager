import { OperationInfo } from './OperationInfo';
import { QObject } from '../Qcore/QObject';

export class OperationManager extends QObject {
    is_block_undoredo: boolean;

    undo_list: OperationInfo[];
    redo_list: OperationInfo[];

    static signalRedoable: string = 'signalRedoable';
    static signalUndoable: string = 'signalUndoable';
    constructor() {
        super();
        this.is_block_undoredo = false;
        this.undo_list = [];
        this.redo_list = [];
    }
    /**
     * 执行重做操作，从redo_list中取出最后一个操作信息，并执行其redo()方法，如果redo_list为空，则发出一个信号
     * @returns \
     */
    redo() {
        if (this.is_block_undoredo) return;
        if (this.redo_list.length == 0) {
            this.emit(OperationManager.signalRedoable, false);
            return;
        }
        let info = this.redo_list[this.redo_list.length - 1];
        this.redo_list.length = this.redo_list.length - 1;
        if (this.redo_list.length == 0) {
            this.emit(OperationManager.signalRedoable, false);
        }
        console.log('Redo...', info.information());

        if (info.redo(this)) {
            info.onActive();
            this.undo_list.push(info);
            this.emit(OperationManager.signalUndoable, true);
        }
    }
    /**
     * 执行撤销操作，从undo_list中取出最后一个操作信息，并执行其undo()方法，如果undo_list为空，则发出一个信号
     * @returns \
     */
    undo() {
        if (this.is_block_undoredo) return;

        if (this.undo_list.length == 0) {
            this.emit(OperationManager.signalUndoable, false);
            return;
        }
        let info = this.undo_list[this.undo_list.length - 1];
        this.undo_list.length = this.undo_list.length - 1;
        if (this.undo_list.length == 0) {
            this.emit(OperationManager.signalUndoable, false);
            this.onEmptyInfos();
        } else {
            this.undo_list[this.undo_list.length - 1].onActive();
        }
        console.log('Undo...', info.information());

        if (info.undo(this)) {
            this.redo_list.push(info);
            this.emit(OperationManager.signalRedoable, true);
        }
    }
    /**
     * 重置redo_list，将其中的所有操作信息都执行pop()方法，并将数组清空
     * @returns \
     */
    resetRedo() {
        for (let i = this.redo_list.length - 1; i >= 0; i--) {
            this.redo_list[i].pop(this);
        }
        this.redo_list.length = 0;
    }
    /**
     * 从undo_list的末尾开始遍历，如果找到一个无效的操作信息，则执行其pop()方法并将其从数组中删除
     * @returns \
     */
    popUnvalidInfo() {
        while (this.undo_list.length > 0) {
            let info = this.undo_list[this.undo_list.length - 1];
            if (info.isValid()) {
                break;
            }
            info.pop();
            this.undo_list.length = this.undo_list.length - 1;
        }
    }
    /**
     * 将操作信息添加到undo_list中，并重置redo_list
     * @param operation_info
     * @returns
     */
    appendOperationInfo(operation_info: OperationInfo) {
        if (this.undo_list[this.undo_list.length - 1] === operation_info) return;

        operation_info.onActive();
        this.undo_list.push(operation_info);
        this.resetRedo();
        this.emit(OperationManager.signalRedoable, false);
        this.emit(OperationManager.signalUndoable, true);
    }
    /**
     * 重置undo_list和redo_list，发出相应的信号
     */
    resetUndoRedos() {
        this.undo_list = [];
        this.redo_list = [];
        this.onEmptyInfos();
        this.emit(OperationManager.signalRedoable, false);
        this.emit(OperationManager.signalUndoable, false);
    }

    onEmptyInfos() {}
}
