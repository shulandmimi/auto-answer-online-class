import { AdapaterManager } from '../core/adapterManager';
import { Service } from '../core/service';

export class ServiceAdapterManager extends AdapaterManager<Service> {
    use(index: number) {
        if (!this.adapters.length) {
            throw new AdapaterManager.ERROR.ADAPTER_NOT_FOUND();
        }

        this.adapter = this.adapters[index];
    }
}
