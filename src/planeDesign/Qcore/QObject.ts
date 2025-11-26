export interface Q_Slot {
    target?: any;
    ui_name?: string;
    callback: (para?: any) => any;
}

export interface Q_Connection {
    name: string;
    slots: Q_Slot[];
}

export class QObject {
    slots: { [key: string]: Q_Slot };
    connect_dict: Map<string, Q_Connection>;
    constructor() {
        this.connect_dict = new Map<string, Q_Connection>();
        this.slots = {};
    }

    emit(name: string, para: any = {}) {
        let connection = this.connect_dict.get(name);
        if (connection === undefined) {
            return;
        }
        for (let slot of connection.slots) {
            slot.callback(para);
        }
    }

    connect_obj(name: string, obj: QObject, slot_name: string) {
        let slot = obj.slots[slot_name];
        if (slot === undefined) return;
        this.connect(name, slot);
    }
    connect(name: string, slot: Q_Slot) {
        let connection = this.connect_dict.get(name);
        if (connection === undefined) {
            this.connect_dict.set(name, {
                name: name,
                slots: []
            });
            connection = this.connect_dict.get(name);
        }
        connection.slots.push(slot);
    }
    disconnect(name: string, slot: Q_Slot) {
        let connection = this.connect_dict.get(name);
        if (connection === undefined) return;
        let index = connection.slots.indexOf(slot);
        if (index >= 0) connection.slots.splice(index, 1);
    }

    defineSignals() {}

    defineSlots() {}
}
