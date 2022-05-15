import { Question, QuestionType } from '../core/question';
import { QuestionAnswer, Service } from '../core/service';

export class ICodef extends Service {
    fetch(question: Question): Promise<Success<any> | Failed> {
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

    format(question: Question, data: string): QuestionAnswer {
        const answers: string[] = [];

        switch (question.type) {
            case QuestionType.Checkbox:
                const datas = data.split('#');
                answers.push(...datas);
                break;
            case QuestionType.Radio:
                answers.push(data);
                break;
        }

        return {
            answers,
        };
    }
}
