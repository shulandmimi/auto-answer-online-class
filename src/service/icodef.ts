import { Question, QuestionType } from '../core/question';
import { QuestionAnswer, Service } from '../core/service';

export class ICodef extends Service {
    fetch(question: Pick<Question, 'question' | 'type'>): Promise<Success<any> | Failed> {
        return new Promise(async resolve => {
            const response = await Service.fetch({
                method: 'POST',
                url: 'http://cx.icodef.com/wyn-nb',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: '',
                },
                data: `question=${encodeURIComponent(question.question)}&type=${question.type}`,
            });
            const data = JSON.parse(response.responseText) as Success<string> | Failed;
            resolve(data);
        });
    }

    format_answer(question: Question, data: string): QuestionAnswer {
        const answers: string[] = [];

        switch (question.type) {
            case QuestionType.Checkbox:
                const datas = data.split('#');
                answers.push(...datas.map(item => item.trim()));
                break;
            case QuestionType.Radio:
                answers.push(data.trim());
                break;
        }

        return {
            answers,
        };
    }

    format_option(type: QuestionType, option: string): string {
        return option.trim().replace(/，/g, ',').replace(/。/g, '.').replace(/（/g, '(').replace(/）/g, ')').replace(/(“|”)/g, '"');
    }
}
