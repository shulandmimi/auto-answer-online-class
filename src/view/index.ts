import EventEmitter from 'eventemitter3';

export abstract class ViewPlugin {
    abstract name: string;
    abstract apply(view: View): void;
}

export class View extends EventEmitter {
    plugins: ViewPlugin[] = [];

    container: JQuery = this.creatElement();
    controller = this.container.find('.top-container');
    common = this.container.find('.common');

    constructor() {
        super();
    }

    register(view: ViewPlugin) {
        this.plugins.push(view);
    }

    creatElement() {
        return $(
            `
                <div style="z-index: 1000; position: fixed;right: 0;top: 0;width: 500px;max-height: 400px;background: #fff;overflow: hidden auto;" class="container">
                    <div class="top-container"></div>
                    <div class="common"></div>
                </div>
            `
        );
    }

    start() {
        this.plugins.forEach(plugin => {
            console.log(plugin.name, 'will register');
            plugin.apply(this);
            console.log(plugin.name, 'did register');
        });
    }
}
