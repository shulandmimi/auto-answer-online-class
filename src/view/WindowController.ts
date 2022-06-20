import { View, ViewPlugin } from '.';
import { AnswerView } from './AnswerView';

export class WindowController extends ViewPlugin {
    name = 'window-controller';
    apply(view: View) {
        const element = this.createElement();
        this.register(element, view);
        view.controller.append(element);
        console.log(view, element, 'window - controller register');
    }

    createElement() {
        return $(`
        <div style="display: flex; justify-content: flex-end; width: 100%; align-items: center; align-content: center; font-size: 24px;">
            <div style="cursor: pointer; height: 20px; padding-left: 5px; line-height: 20px; font-size: .7em;" class="fold">折叠答案区域</div>
            <div style="cursor: pointer; width: 20px; height: 20px; padding-left: 5px; line-height: 20px;" class="windowToMin">-</div>
            <div style="cursor: pointer; width: 20px; height: 20px; padding-left: 5px; line-height: 20px;" class="windowClose">x</div>
        </div>
        `);
    }

    register(element: JQuery, view: View) {
        const openIcon = $(
            `<div class="openIcon" style="z-index: 1000; width: 20px; height: 20px; position: fixed; right: 50px; top: 50px; background: red;"></div>`
        );
        const container = view.container;
        $(document.body).append(openIcon);
        openIcon.hide();
        openIcon.on('click', () => {
            container.show();
        });
        element.find('.windowClose').on('click', () => {
            container.hide();
        });
        element.find('.windowToMin').on('click', () => {
            container.hide();
            openIcon.show();
        });
        element.find('.fold').on('click', () => {
            view.emit(AnswerView.event.FOLD);
        });
    }
}
