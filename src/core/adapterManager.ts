import EventEmitter from './eventEmitter';
import { LifeCycleEvents } from '../lifecycle';

export enum AdapterManagerEventEmitType {
    ADAPTER_CHANGE = 'ADAPTER_CHANGE',
}

type AdapterManagerEvents = {
    [AdapterManagerEventEmitType.ADAPTER_CHANGE]: () => void;
};
export abstract class AdapaterManager<T> extends EventEmitter<AdapterManagerEvents> {
    static ERROR = {
        ADAPTER_NOT_FOUND: class extends Error {
            constructor() {
                super('[adapter manager]: ADAPTER_NOT_FOUND');
            }
        },
    };

    static EVENT_EMIT_TYPE = AdapterManagerEventEmitType;

    adapters: T[] = [];
    adapter!: T;
    register(adapter: T) {
        if (!this.test(adapter)) return;
        if (!this.adapter) this.adapter = adapter;
        this.adapters.push(adapter);
        if (adapter instanceof LifeCycleEvents) {
            adapter.emit('after_register');
        }
    }

    use(...arg: unknown[]) {
        this.emit(AdapaterManager.EVENT_EMIT_TYPE.ADAPTER_CHANGE);
    }

    getAdapters() {
        return this.adapters;
    }

    getAdapter() {
        return this.adapter;
    }

    test(adapter: T): boolean {
        return true;
    }
}
