import { View, ViewPlugin } from '.';
import { ServiceAdapterManager } from '../service/index';
import { QuestionType } from '../core/question';
import { Message } from './Message';

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
        element.find('.search-btn').on('click', async () => {
            const value = input.val();
            if (!value) {
                Message.show(view, '请输入内容');
                return;
            }
            const service = ServiceAdapterManager.getInstance().getAdapter();
            const response = await service.fetch({
                question: value as string,
                type: QuestionType.Radio,
                options: [],
            });

            if (response.code !== 1) {
                if (response.code === 0) {
                    Message.show(view, '发生错误');
                } else if (response.code === -1) {
                    Message.show(view, '未找到答案');
                }
                return;
            }

            const data = service.format_answer(QuestionType.Checkbox, response.data).answers;
            Message.show(view, data.join('\n'));
        });
    }
}
