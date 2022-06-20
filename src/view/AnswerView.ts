import { EventEmitType, QuestionIterable } from '..';
import { Question, QuestionMatchStatus } from '../core/question';
import { QuestionAdapterManager } from '../platform';
import { QuestionItemFromChaoxing } from '../platform/chaoxing';
import { QuestionItemFromMooc } from '../platform/mooc';
import { QuestionItemFromZHIHUISHU } from '../platform/zhihuishu';
import delay from '../utils/delay';
import { View, ViewPlugin } from '.';
import { ServiceAdapterManager } from '../service/index';

const background = {
    [QuestionMatchStatus.NOTFOUND]: 'rgba(255, 0, 0, 0.3)',
    [QuestionMatchStatus.NOTMATCH]: 'rgba(0, 255, 0, 0.3)',
    [QuestionMatchStatus.MATCHED]: 'rgba(0, 0, 255, 0.3)',
};

export enum ANSWER_EVENT_TYPE {
    FOLD = 'FOLD',
}

export class AnswerView extends ViewPlugin {
    name = 'answer-view';
    view!: View;
    container!: JQuery;

    static event = ANSWER_EVENT_TYPE;

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
        this.container.find('.pause').on('click', () => {
            view.emit(EventEmitType.AUTO_FIND_PAUSE);
        });
        this.container.find('.play').on('click', () => {
            view.emit(EventEmitType.AUTO_FIND_PLAY);
        });

        this.container.find('.reset').on('click', () => {
            this.resetQuestions();
            view.emit(EventEmitType.REFIND_QUESTION);
        });

        view.on(AnswerView.event.FOLD, () => {
            this.container.toggle();
        });
    }

    autoFind() {
        const self = this;
        const view = this.view;

        const questionAdapterManager = new QuestionAdapterManager();
        questionAdapterManager.register(new QuestionItemFromMooc());
        questionAdapterManager.register(new QuestionItemFromChaoxing());
        questionAdapterManager.register(new QuestionItemFromZHIHUISHU());

        const questionInterable = new QuestionIterable(questionAdapterManager);

        async function questionProcessHandler(question: Question, index: number) {
            let status: QuestionMatchStatus;
            const service = ServiceAdapterManager.getInstance().getAdapter();
            try {
                console.group(`${Number(index) + 1}: ${question.question}`);

                const questionAnswer = await service.fetch({
                    question: question.question,
                    type: question.type,
                    options: question.options,
                });

                console.log(questionAnswer.data);

                status = QuestionMatchStatus.NOTFOUND;

                if (questionAnswer.code !== 1) {
                    if (questionAnswer.code === 0) {
                        console.log('发生错误');
                    } else if (questionAnswer.code === -1) {
                        console.log('未找到答案');
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
                    console.log('没匹配到答案');
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
        view.on(EventEmitType.AUTO_FIND_PAUSE, () => {
            questionInterable.pause();
        });
        view.on(EventEmitType.AUTO_FIND_PLAY, () => {
            questionInterable.setStatus('canplay');
            questionInterable.next(questionProcessHandler);
        });
        view.on(EventEmitType.REFIND_QUESTION, () => {
            self.resetQuestions();
            questionInterable.resetContext();
            questionInterable.next(questionProcessHandler);
        });
    }

    appendQuestion(question: Question, status: QuestionMatchStatus) {
        const { position, question: title, rawAnswer } = question;
        this.container.find('.listarea').append(
            $(`
            <tr style="background: ${background[status]}; color: rgba(0,0,0, 0.71);">
                <td width="50px">${position + 1}</td>
                <td width="300px" style="padding: 5px 10px">${title}</td>
                <td width="150px">${rawAnswer?.length ? rawAnswer.join('<br/><br/>') : '未找到答案'}</td>
            </tr>
        `)
        );
        this.container.find('.list-body').scrollTop(Number.MAX_SAFE_INTEGER);
    }

    resetQuestions() {
        this.container.find('.listarea').html('');
    }
}
