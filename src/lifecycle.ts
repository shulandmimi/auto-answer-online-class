import EventEmitter from './core/eventEmitter';

export type LifeCycles = {
    before_match_questions: () => void;
    after_match_questions: () => void;
};

export class LifeCycleEvents<T> extends EventEmitter<LifeCycles & T> {}
