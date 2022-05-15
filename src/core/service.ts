import { Question, QuestionType } from './question';

interface ServiceFetchParams extends Omit<GM_xmlhttpRequestParams, 'onload' | 'onerror'> {
}

export interface QuestionAnswer {
    answers: string[];
}

export abstract class Service {
    static fetch(params: ServiceFetchParams): Promise<XMLHttpRequest> {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                ...params,
                onload(data) {
                    resolve(data);
                },
                onerror(error) {
                    reject(error);
                }
            });
        })

    }
    abstract fetch(question: Question): Promise<Success<any> | Failed>;

    abstract format_answer(question: Question, data: string): QuestionAnswer;
    abstract format_option(type: QuestionType, option: string): string;
}