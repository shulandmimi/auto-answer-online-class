import { View, ViewPlugin } from '.';
import { ServiceAdapterManager } from '../service';

export class ServiceAdapterChange extends ViewPlugin {
    name = 'service-adapter-change';
    view!: View;
    apply(view: View) {
        const element = this.createElement();

        this.register(element, view);

        view.common.append(element);
    }

    createElement() {
        const adapters = ServiceAdapterManager.getInstance().getAdapters();
        const names = adapters.map(adapter => adapter.name);
        return $(
            `
                <div class="service-adapter-controller">
                    <select class="service-adapter-select">
                        ${names.map((name, index) => `<option value="${index}">${name}</option>`)}
                    </select>
                </div>
            `
        );
    }

    register(element: JQuery, view: View) {
        element.find('.service-adapter-select').on('input', () => {
            const index = Number(element.find('.service-adapter-select').val());
            ServiceAdapterManager.getInstance().use(index);
        });
    }
}
