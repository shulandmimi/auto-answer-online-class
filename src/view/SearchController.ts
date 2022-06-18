import { EventEmitType } from "..";
import { View, ViewPlugin } from ".";

export class SearchController extends ViewPlugin {
    name = 'search-controller';
    view!: View;
    apply(view: View) {
        const element = this.createElement();

        this.register(element, view);

        view.common.append(element);
    }

    createElement() {
        return $(
            `
                <div class="search-controller">
                    <input class="search-input" />
                    <button class="search-btn">搜索</button>
                </div>
            `
        );
    }

    register(element: JQuery, view: View) {
        const input = element.find('.search-input');
        view.on(EventEmitType.USER_SEARCH_RESULT, ({ status, data }: { status: 0 | 1; data?: string[] }) => {
            if (status !== 0) {
                view.show('未找到答案');
                return;
            }
            view.show(data?.join('\n') || '');
        });
        element.find('.search-btn').on('click', () => {
            const value = input.val();
            if (!value) {
                view.show('请输入内容');
                return;
            }
            view.emit(EventEmitType.USER_SEARCH, value);
        });
    }
}
