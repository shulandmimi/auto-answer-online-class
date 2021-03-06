import { Question, QuestionAdapter, QuestionMatchStatus, QuestionType } from './core/question';
import { QuestionItemFromMooc } from './platform/mooc/index';
import { QuestionItemFromZHIHUISHU } from './platform/zhihuishu/index';
import { QuestionItemFromChaoxing } from './platform/chaoxing/index';
import { View } from './view';
import { AdapaterManager } from './core/adapterManager';
import { QuestionAdapterManager } from './platform';
import { WindowController } from './view/WindowController';
import { SearchController } from './view/SearchController';
import { AnswerView } from './view/AnswerView';
import { ServiceAdapterChange } from './view/ServiceAdapterChange';
import { ServiceAdapterManager } from './service/index';
import { ICodef } from './service/icodef';
import { Message } from './view/Message';

try {
    // @ts-ignore
    (unsafeWindow || window).Element.prototype.attachShadow = undefined;
} catch (error) {}

class Questions {
    static questionAdapter: QuestionAdapter[] = [];
    constructor(public quetions: Question[]) {}

    static from(adapter: QuestionAdapter): Questions {
        return new Questions(adapter.parse());
    }

    static registerAdapter<T extends QuestionAdapter>(adapter: { new (): T }) {
        const instance = new adapter();
        if (!instance.match()) return;
        this.questionAdapter.push(instance);
    }
}

Questions.registerAdapter(QuestionItemFromMooc);
Questions.registerAdapter(QuestionItemFromZHIHUISHU);
Questions.registerAdapter(QuestionItemFromChaoxing);

// async function main() {
//     const questionAdapterManager = new QuetionAdapterManager();
//     questionAdapterManager.register(new QuestionItemFromMooc());
//     questionAdapterManager.register(new QuestionItemFromChaoxing());
//     questionAdapterManager.register(new QuestionItemFromZHIHUISHU());

//     const view = new View();
//     $(document.body).append(view.container);
//     const showMessage = (message: string) => {
//         const actions = view.show(JSON.stringify(message, null, 4));

//         return {
//             ...actions,
//             delay: (time: number) => setTimeout(() => actions.close(), time),
//         };
//     };

//     showMessage('????????????...').delay(2000);

//     await delay(2000);

//     if (!Questions.questionAdapter.length) {
//         showMessage('???????????????????????????????????????');
//         return;
//     }

//     const service = new ICodef();
//     const questionInterable = new QuestionIterable(questionAdapterManager);

//     async function questionProcessHandler(question: Question, index: number) {
//         let status: QuestionMatchStatus;

//         try {
//             console.group(`${Number(index) + 1}: ${question.question}`);
//             const questionAnswer = await service.fetch(question);
//             console.log(questionAnswer.data);
//             status = QuestionMatchStatus.NOTFOUND;
//             if (questionAnswer.code !== 1) {
//                 if (questionAnswer.code === 0) {
//                     showMessage('????????????').delay(2000);
//                 } else if (questionAnswer.code === -1) {
//                     showMessage('???????????????').delay(2000);
//                 }
//                 return;
//             }

//             const answers = service.format_answer(question.type, questionAnswer.data);
//             console.log(answers.answers);
//             question.rawAnswer = answers.answers;
//             const answer = question.match_answer(answers.answers, service.format_option);
//             console.log(answer);
//             status = QuestionMatchStatus.NOTMATCH;
//             if (!answer.length) {
//                 showMessage('??????????????????');
//                 return;
//             }
//             status = QuestionMatchStatus.MATCHED;
//             question.set_answer(answer);
//             await question.select();
//         } finally {
//             console.groupEnd();
//             view.appendItem(question, status!);
//             await delay(3000);
//         }
//     }
//     questionInterable.next(questionProcessHandler);

//     view.on(EventEmitType.USER_SEARCH, async (question: string) => {
//         try {
//             showMessage('???????????????');

//             const response = await service.fetch({ question: question, type: 0 });

//             if (response.code !== 1) {
//                 if (response.code === 0) {
//                     showMessage('????????????');
//                 } else if (response.code === -1) {
//                     showMessage('???????????????');
//                 }
//                 view.emit(EventEmitType.USER_SEARCH_RESULT, { status: 1 });
//                 return;
//             }

//             view.emit(EventEmitType.USER_SEARCH_RESULT, { status: 0, data: service.format_answer(QuestionType.Checkbox, response.data).answers });
//             showMessage('????????????').delay(5000);
//         } catch (error: any) {
//             console.log(error);
//             view.emit(EventEmitType.USER_SEARCH_RESULT, { status: 1 });
//             showMessage(`????????????: ${error?.message || error}`).delay(5000);
//         }
//     });
//     view.on(EventEmitType.AUTO_FIND_PAUSE, () => {
//         questionInterable.pause();
//         console.log('pause');
//     });
//     view.on(EventEmitType.AUTO_FIND_PLAY, () => {
//         console.log('play');
//         questionInterable.setStatus('canplay');
//         questionInterable.next(questionProcessHandler);
//     });
//     view.on(EventEmitType.REFIND_QUESTION, () => {
//         questionInterable.resetContext();
//     });
// }

export class QuestionIterable {
    runningContext!: {
        index: number;
        status: 'running' | 'pause' | 'canplay' | 'done';
        data: Question[];
        running: boolean;
    };

    adapter!: QuestionAdapterManager;

    constructor(adapter: QuestionAdapterManager) {
        this.adapter = adapter;
        this.adapter.on(AdapaterManager.EVENT_EMIT_TYPE.ADAPTER_CHANGE, () => {
            this.resetContext();
        });
        this.resetContext();
    }

    syncContextWithAdapter() {
        const adapter = this.adapter.getAdapter();
        Object.assign(this.runningContext, {
            data: adapter.parse(),
        });
    }

    async next(callback: (question: Question, index: number) => Promise<void>) {
        console.log({ ...this.runningContext });
        let { data, index, status, running } = this.runningContext;
        if (status === 'done' || status === 'pause' || running) return;
        else if (status !== 'running') {
            this.setStatus('running');
        }
        this.runningContext.running = true;

        if (index >= data.length) return;

        await callback(data[index], index);

        index += 1;

        if (index >= data.length) {
            this.setStatus('done');
        }

        Object.assign(this.runningContext, { running: false, index });
        this.next(callback);
    }

    pause() {
        this.setStatus('pause');
    }

    resetContext() {
        this.runningContext = {
            index: 0,
            status: 'canplay',
            data: [],
            running: false,
        };
        this.syncContextWithAdapter();
    }

    setStatus(status: 'pause' | 'running' | 'done' | 'canplay') {
        this.runningContext.status = status;
    }
}

export enum EventEmitType {
    USER_SEARCH = 'USERSEARCH',
    USER_SEARCH_RESULT = 'USER_SEARCH_RESULT',
    AUTO_FIND_PAUSE = 'AUTO_FIND_PAUSE',
    AUTO_FIND_PLAY = 'AUTO_FIND_PLAY',
    REFIND_QUESTION = 'REFIND_QUETION',
}

const background = {
    [QuestionMatchStatus.NOTFOUND]: 'rgba(255, 0, 0, 0.3)',
    [QuestionMatchStatus.NOTMATCH]: 'rgba(0, 255, 0, 0.3)',
    [QuestionMatchStatus.MATCHED]: 'rgba(0, 0, 255, 0.3)',
};
// class View extends EventEmitter {
//     container: JQuery<HTMLDivElement> = $(`
//         <div class="container" style="z-index: 1000; position: fixed;right: 0;top: 0;width: 500px;max-height: 400px;background: #fff;overflow: hidden auto;">
//         <div class="controller"></div>
//         <div class="search">
//             <div>
//                 <input style="width: 300px; border: 1px solid #ccc;" class="search-input" />
//                 <button class="search-btn">??????</button>
//             </div>
//             <div>
//                 <span>??????:</span>
//                 <pre class="search-result"></pre>
//             </div>
//         </div>
//         <div class="message" style="min-height: 20px; line-height: 20px; max-height: 40px;"></div>
//         <div class="list" style="position: relative;">
//             <div style="display: flex; align-items: center;">
//                 ?????????????????????<div style="margin-right: 10px; width: 10px; height: 10px; background: ${
//                     background[QuestionMatchStatus.NOTMATCH]
//                 }"></div>
//                 ???????????????<div style="margin-right: 10px; width: 10px; height: 10px; background: ${background[QuestionMatchStatus.NOTFOUND]}"></div>
//                 ???????????????<div style="margin-right: 10px; width: 10px; height: 10px; background: ${background[QuestionMatchStatus.MATCHED]}"></div>
//             </div>
//             <div class="autoFindController">
//                 <button class="pause">??????</button>
//                 <button class="play">??????</button>
//                 <button class="reset">??????????????????</button>
//             </div>
//             <table class="header-fixed" style="height: 20px; width: 100%;background: #fff;">
//                 <tr>
//                     <td width="50px">??????</td>
//                     <td width="300px" style="padding: 5px 10px" >??????</td>
//                     <td width="150px">??????</td>
//                 </tr>
//             </table>
//             <div class="list-body" style="overflow: hidden auto; max-height: 300px;">
//                 <table class="listarea"></table>
//             </div>
//             </div>
//     </div>`);
//     controller: JQuery = this.container.find('.controller');
//     listarea: JQuery = this.container.find('.list table.listarea');
//     message: JQuery = this.container.find('.message');
//     search: JQuery = this.container.find('.search');
//     constructor() {
//         super();
//         this.init();
//     }

//     init() {
//         this.windowController();
//         this.saerchView();
//         this.viewController();
//     }

//     /**
//      * ?????????????????????
//      */
//     appendItem(question: Question, status: QuestionMatchStatus) {
//         const item = $(`<tr style="background: ${background[status]}; color: rgba(0,0,0, 0.71);">
//             <td width="50px">${question.position + 1}</td>
//             <td width="300px" style="padding: 5px 10px">${question.question}</td>
//             <td width="150px">${question.rawAnswer?.length ? question.rawAnswer.join('<br/><br/>') : '???????????????'}</td>
//         </tr>`);
//         this.listarea.append(item);
//         this.container.find('.list .list-body').scrollTop(Number.MAX_SAFE_INTEGER);
//     }

//     /**
//      * ????????????
//      */
//     windowController() {
//         const windowActionElement =
//             $(`<div style="display: flex; justify-content: flex-end; width: 100%; align-items: center; align-content: center; font-size: 24px;">
//             <div style="width: 20px; height: 20px; padding-left: 5px; line-height: 20px;" class="windowToMin">-</div>
//             <div style="width: 20px; height: 20px; padding-left: 5px; line-height: 20px;" class="windowClose">x</div>
//         </div>`);
//         this.controller.append(windowActionElement);

//         const openIcon = $(
//             `<div class="openIcon" style="z-index: 1000; width: 20px; height: 20px; position: fixed; right: 50px; top: 50px; background: red;"></div>`
//         );
//         $(document.body).append(openIcon);
//         openIcon.hide();
//         openIcon.on('click', () => {
//             this.container.show();
//             openIcon.hide();
//         });
//         windowActionElement.find('.windowClose').on('click', () => {
//             this.container.hide();
//         });
//         windowActionElement.find('.windowToMin').on('click', () => {
//             this.container.hide();
//             openIcon.show();
//         });
//     }

//     /**
//      * ????????????
//      */
//     saerchView() {
//         const input = this.search.find('.search-input');
//         const search = this.search.find('.search-btn');
//         const result = this.search.find('.search-result');
//         search.on('click', () => {
//             const value = input.val();
//             if (!value) {
//                 return this.show('???????????????');
//             }
//             this.emit(EventEmitType.USER_SEARCH, value);
//         });
//         this.on(EventEmitType.USER_SEARCH_RESULT, ({ status, data }: { status: 0 | 1; data?: string[] }) => {
//             if (status !== 0) {
//                 result.text('???????????????');
//                 return;
//             }
//             result.text(data?.join('\n') || '');
//         });
//     }

//     viewController() {
//         const controllerContainer = this.container.find('.autoFindController');
//         controllerContainer.find('.pause').on('click', () => {
//             this.emit(EventEmitType.AUTO_FIND_PAUSE);
//         });
//         controllerContainer.find('.play').on('click', () => {
//             this.emit(EventEmitType.AUTO_FIND_PLAY);
//         });

//         controllerContainer.find('.reset').on('click', () => {
//             this.emit(EventEmitType.REFIND_QUESTION);
//         });
//     }

//     timer: any = null;

//     show(message: string) {
//         clearTimeout(this.timer);
//         this.message.text(message);
//         return {
//             close: () => {
//                 this.message.text('');
//             },
//         };
//     }
// }

window.addEventListener('load', () => {
    const application = new View();

    const serviceAdapterManager = ServiceAdapterManager.getInstance();
    serviceAdapterManager.register(new ICodef());

    application.register(new WindowController());
    application.register(new ServiceAdapterChange());
    application.register(new SearchController());
    application.register(new Message());
    application.register(new AnswerView());
    application.start();
    $(document.body).append(application.container);
});
