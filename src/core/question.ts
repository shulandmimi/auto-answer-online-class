import { LifeCycleEvents } from '../lifecycle';

export abstract class Question {
    abstract position: number;
    answer?: number[];
    rawAnswer?: string[];
    constructor(public question: string = '', public options: Option[] = [], public type: QuestionType = QuestionType.Radio) {}

    set_answer(answer: number[]) {
        this.answer = answer;
    }

    match_answer(answers: string[], format: (type: QuestionType, data: string) => string): number[] {
        return this.options
            .map((item, index) => [format(this.type, item.body), index] as const)
            .filter(([option]) => {
                return answers.some(answer => option.includes(answer) || option === answer);
            })
            .map(([_, index]) => index);
    }

    abstract select(): Promise<void> | void;
}

export abstract class QuestionAdapter extends LifeCycleEvents<{}> {
    abstract parse(...args: any[]): Question[];
    abstract match(): boolean;
}
export interface Option {
    prefix: string;
    body: string;
}

export interface QuestionItem {
    question: string;
    options: Option[];
    type: QuestionType;
    answer?: number;
}

export enum QuestionType {
    /** 单选 */
    Radio = 0,
    /** 多选 */
    Checkbox = 1,
    /** 判断 */
    Judge = 3,
    /** 填空 */
    InBlank = 2,
}

export enum QuestionMatchStatus {
    NOTFOUND,
    NOTMATCH,
    MATCHED,
}
