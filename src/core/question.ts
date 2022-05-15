export abstract class Question {
    abstract position: number;
    answer?: number[];
    rawAnswer?: string;
    constructor(public question: string = '', public options: Option[] = [], public type: QuetionType = QuetionType.Radio) {}

    set_answer(answer: number[]) {
        this.answer = answer;
    }

    match_answer(answers: string[]): number[] {
        return this.options
            .map((item, index) => [item, index] as const)
            .filter(([option]) => {
                return answers.some(answer => new RegExp(option.body).test(answer));
            })
            .map(([_, index]) => index);
    }

    abstract select(): void;
}

export abstract class QuestionAdapter {
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
    type: QuetionType;
    answer?: number;
}

export enum QuetionType {
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
