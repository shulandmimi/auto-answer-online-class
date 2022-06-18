import { Question, QuestionItem, QuestionType } from './question';

interface ServiceFetchParams extends Omit<GM_xmlhttpRequestParams, 'onload' | 'onerror'> {}

export interface QuestionAnswer {
    answers: string[];
}

export abstract class Service {
    abstract name: string;
    static fetch(params: ServiceFetchParams): Promise<XMLHttpRequest> {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                ...params,
                onload(data) {
                    resolve(data);
                },
                onerror(error) {
                    reject(error);
                },
            });
        });
    }
    abstract fetch(question: QuestionItem): Promise<Success<any> | Failed>;

    abstract format_answer(type: QuestionType, data: string): QuestionAnswer;
    abstract format_option(type: QuestionType, option: string): string;
}
