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
        adapter.emit('before_match_questions');
        Object.assign(this.runningContext, {
            data: adapter.parse(),
        });
        adapter.emit('after_match_questions');
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
