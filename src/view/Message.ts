import { View, ViewPlugin } from './index';

enum MessageEvent {
    MESSAGE = 'MESSAGE',
}

export class Message extends ViewPlugin {
    name: string = 'message-view';
    container!: JQuery;
    apply(view: View): void {
        const element = (this.container = this.createElement());

        this.register(element, view);

        view.common.append(element);
    }

    createElement() {
        return $(
            `
                <div class="message">结果：<pre class="message-view"></pre></div>
            `
        );
    }

    register(element: JQuery, view: View) {
        view.on(MessageEvent.MESSAGE, message => {
            element.find('.message-view').text(message);
        });
    }

    static show(view: View, message: string) {
        view.emit(MessageEvent.MESSAGE, message);
    }
}
