import { Question, QuestionAdapter, QuestionMatchStatus } from './core/question';
import { QuestionItemFromMooc } from './platform/mooc/index';
import delay from './utools/delay';
import fetch_answer from './utools/fetch_answer';
import { QuestionItemFromZHIHUISHU } from './platform/zhihuishu/index';

class Questions {
    static questionAdapter: QuestionAdapter[] = [];
    constructor(public quetions: Question[]) {}

    static from(adapter: QuestionAdapter): Questions {
        return new Questions(adapter.parse());
    }


    static registerAdapter<T extends QuestionAdapter>(adapter: { new(): T }) {
        const instance = new adapter();
        if(!instance.match()) return;
        this.questionAdapter.push(instance);
    }
}

Questions.registerAdapter(QuestionItemFromMooc);
Questions.registerAdapter(QuestionItemFromZHIHUISHU);

async function main() {
    const adapterIndex = 0;
    const questions = Questions.from(Questions.questionAdapter[adapterIndex]);
    const view = new View();
    $(document.body).append(view.container);

    const showMessage = (message: string) => {
        view.show(JSON.stringify(message, null, 4));
        console.log(message);
    }

    for (const index in questions.quetions) {
        const question = questions.quetions[index];
        let status: QuestionMatchStatus;

        try {
            console.group(`${Number(index) + 1}: ${question.question}`);
            const questionAnswer = await fetch_answer(question);
            console.log(questionAnswer);
            status = QuestionMatchStatus.NOTFOUND;
            if (questionAnswer.code !== 1) {
                if (questionAnswer.code === 0) {
                    showMessage('发生错误');
                } else if (questionAnswer.code === -1) {
                    showMessage('未找到答案');
                }
                continue;
            }
            console.log(questionAnswer.data);

            question.rawAnswer = questionAnswer.data;
            const answer = question.match_answer([questionAnswer.data]);
            status = QuestionMatchStatus.NOTMATCH;
            if (!answer.length) {
                showMessage('没匹配到答案');
                continue;
            }
            status = QuestionMatchStatus.MATCHED;
            question.set_answer(answer);
            console.log(answer);
            question.select();
        } finally {
            console.groupEnd();
            view.appendItem(question, status!);
            await delay(3000);
        }
    }
}

class View {
    container: JQuery<HTMLDivElement> =
        $(`<div class="container" style="position: fixed;right: 0;top: 0;width: 500px;max-height: 400px;background: #fff;overflow: hidden auto;">
        <div class="controller"></div>
        <div class="message" style="min-height: 20px; line-height: 20px; max-height: 40px;"></div>
        <div class="list" style="position: relative;">
            <table class="header-fixed" style="height: 20px; width: 100%;background: #fff;">
                <tr>
                    <td width="50px">序号</td>
                    <td width="300px" style="padding: 5px 10px" >问题</td>
                    <td width="150px">答案</td>
                </tr>
            </table>
            <div style="overflow: hidden auto; max-height: 300px;">
                <table class="listarea"></table>
            </div>
        </div>
    </div>`);
    controller: JQuery = this.container.find('.controller');
    listarea: JQuery = this.container.find('.list table.listarea');
    message: JQuery = this.container.find('.message');
    constructor() {
        this.init();
    }

    init() {
        this.windowController();
    }

    appendItem(question: Question, status: QuestionMatchStatus) {
        const background = {
            [QuestionMatchStatus.NOTFOUND]: 'rgba(255, 0, 0, 0.3)',
            [QuestionMatchStatus.NOTMATCH]: 'rgba(0, 255, 0, 0.3)',
            [QuestionMatchStatus.MATCHED]: 'rgba(0, 0, 255, 0.3)',
        };
        const item = $(`<tr style="background: ${background[status]}; color: rgba(0,0,0, 0.71);">
            <td width="50px">${question.position + 1}</td>
            <td width="300px" style="padding: 5px 10px">${question.question}</td>
            <td width="150px">${question.rawAnswer ? question.rawAnswer : '未找到答案'}</td>
        </tr>`);
        this.listarea.append(item);
    }

    windowController() {
        const windowActionElement =
            $(`<div style="display: flex; justify-content: flex-end; width: 100%; align-items: center; align-content: center; font-size: 24px;">
            <div style="width: 20px; height: 20px; padding-left: 5px; line-height: 20px;" class="windowToMin">-</div>
            <div style="width: 20px; height: 20px; padding-left: 5px; line-height: 20px;" class="windowClose">x</div>
        </div>`);
        this.controller.append(windowActionElement);

        const openIcon = $(
            `<div class="openIcon" style="width: 20px; height: 20px; position: fixed; right: 50px; top: 50px; background: red;"></div>`
        );
        $(document.body).append(openIcon);
        openIcon.hide();
        openIcon.on('click', () => {
            this.container.show();
            openIcon.hide();
        });
        windowActionElement.find('.windowClose').on('click', () => {
            this.container.hide();
        });
        windowActionElement.find('.windowToMin').on('click', () => {
            this.container.hide();
            openIcon.show();
        });
    }

    timer: any = null;
    show(message: string, delay: number = 1000) {
        clearTimeout(this.timer);
        this.message.text(message);
        this.timer = setTimeout(() => {
            this.message.text('');
        }, delay);
    }
}

window.addEventListener('load', () => {
    setTimeout(() => {
        main();
    }, 1000);
});

