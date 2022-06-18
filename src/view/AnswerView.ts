import { EventEmitType, QuestionIterable } from "..";
import { Question, QuestionMatchStatus } from "../core/question";
import { QuestionAdapterManager } from "../platform";
import { QuestionItemFromChaoxing } from "../platform/chaoxing";
import { QuestionItemFromMooc } from "../platform/mooc";
import { QuestionItemFromZHIHUISHU } from "../platform/zhihuishu";
import delay from "../utils/delay";
import { View, ViewPlugin } from ".";

const background = {
    [QuestionMatchStatus.NOTFOUND]: 'rgba(255, 0, 0, 0.3)',
    [QuestionMatchStatus.NOTMATCH]: 'rgba(0, 255, 0, 0.3)',
    [QuestionMatchStatus.MATCHED]: 'rgba(0, 0, 255, 0.3)',
};

export class AnswerView extends ViewPlugin {
    name = 'answer-view';
    view!: View;
    container!: JQuery;
    apply(view: View) {
        const element = (this.container = this.createElement());
        this.view = view;
        this.register(element, view);

        view.common.append(element);

        this.autoFind();
    }

    createElement() {
        return $(`
            <div class="">
                <div style="display: flex; align-items: center;">
                    未完全匹配答案<div style="margin-right: 10px; width: 10px; height: 10px; background: ${
                        background[QuestionMatchStatus.NOTMATCH]
                    }"></div>
                    未找到答案<div style="margin-right: 10px; width: 10px; height: 10px; background: ${
                        background[QuestionMatchStatus.NOTFOUND]
                    }"></div>
                    匹配到答案<div style="margin-right: 10px; width: 10px; height: 10px; background: ${
                        background[QuestionMatchStatus.MATCHED]
                    }"></div>
                </div>
                <div class="autoFindController">
                    <button class="pause">暂停</button>
                    <button class="play">开始</button>
                    <button class="reset">重新收集题目</button>
                </div>
                <table class="header-fixed" style="height: 20px; width: 100%;background: #fff;">
                    <tr>
                        <td width="50px">序号</td>
                        <td width="300px" style="padding: 5px 10px" >问题</td>
                        <td width="150px">答案</td>
                    </tr>
                </table>
                <div class="list-body" style="overflow: hidden auto; max-height: 300px;">
                    <table class="listarea"></table>
                </div>
            </div>
        `);
    }

    register(element: JQuery, view: View) {
        const controllerContainer = element.find('.autoFindController');
        controllerContainer.find('.pause').on('click', () => {
            view.emit(EventEmitType.AUTO_FIND_PAUSE);
        });
        controllerContainer.find('.play').on('click', () => {
            view.emit(EventEmitType.AUTO_FIND_PLAY);
        });

        controllerContainer.find('.reset').on('click', () => {
            this.resetQuestions();
            view.emit(EventEmitType.REFIND_QUESTION);
        });
    }

    autoFind() {
        const container = this.container.find('.listarea');
        const self = this;

        const questionAdapterManager = new QuestionAdapterManager();
        questionAdapterManager.register(new QuestionItemFromMooc());
        questionAdapterManager.register(new QuestionItemFromChaoxing());
        questionAdapterManager.register(new QuestionItemFromZHIHUISHU());

        const questionInterable = new QuestionIterable(questionAdapterManager);

        async function questionProcessHandler(question: Question, index: number) {
            let status: QuestionMatchStatus;

            try {
                console.group(`${Number(index) + 1}: ${question.question}`);
                const questionAnswer = await service.fetch(question);
                console.log(questionAnswer.data);
                status = QuestionMatchStatus.NOTFOUND;
                if (questionAnswer.code !== 1) {
                    if (questionAnswer.code === 0) {
                        // showMessage('发生错误').delay(2000);
                    } else if (questionAnswer.code === -1) {
                        // showMessage('未找到答案').delay(2000);
                    }
                    return;
                }

                const answers = service.format_answer(question.type, questionAnswer.data);
                console.log(answers.answers);
                question.rawAnswer = answers.answers;
                const answer = question.match_answer(answers.answers, service.format_option);
                console.log(answer);
                status = QuestionMatchStatus.NOTMATCH;
                if (!answer.length) {
                    // showMessage('没匹配到答案');
                    return;
                }
                status = QuestionMatchStatus.MATCHED;
                question.set_answer(answer);
                await question.select();
            } finally {
                console.groupEnd();
                self.appendQuestion(question, status!);
                await delay(3000);
            }
        }
        questionInterable.next(questionProcessHandler);
    }

    appendQuestion(question: Question, status: QuestionMatchStatus) {
        const { position, question: title, rawAnswer } = question;
        $(`
            <tr style="background: ${background[status]}; color: rgba(0,0,0, 0.71);">
                <td width="50px">${position + 1}</td>
                <td width="300px" style="padding: 5px 10px">${title}</td>
                <td width="150px">${rawAnswer?.length ? rawAnswer.join('<br/><br/>') : '未找到答案'}</td>
            </tr>
        `);
    }

    resetQuestions() {
        this.container.find('.listarea').html('');
    }
}
