import { Question, QuestionAdapter, QuestionItem, QuestionType } from '../../core/question';
import cancelAttachShadow from '../../breakthrough/cancelAttachShadow';

function questions2json(questions: JQuery<HTMLElement>): QuestionItem[] {
    return questions
        .map((index, question) => ({
            type: QuestionType.Radio,
            question: (() => {
                const nodes = $(question).find('.mark_name').get(0)?.childNodes;
                if (!nodes || !nodes.length) return '';
                return nodes[nodes.length - 1]?.textContent || '';
            })(),
            options: $(question)
                .find('.mark_letter')
                .map((index, option) => {
                    const optionel = $(option).text();
                    const firstSpot = optionel.indexOf('.');
                    const prefix = optionel.slice(0, firstSpot);
                    const body = optionel.slice(firstSpot);
                    return {
                        prefix: prefix.slice(0),
                        body,
                    };
                })
                .toArray(),
        }))
        .toArray();
}

export class QuestionItemFromChaoxing extends QuestionAdapter {
    constructor() {
        super();
        this.on('after_register', () => {
            cancelAttachShadow();
        });
    }

    parse(): Question[] {
        const questionItem = questions2json($('.questionLi'));
        console.log(questionItem);
        return questionItem.map((item, index) => new QuestionOfChaoxing(index, { question: item.question, options: item.options, type: item.type }));
    }

    match() {
        return /^(.)*:\/\/(.)*\.chaoxing\.com\/mooc2\/work/.test(location.href);
    }
}

export class QuestionOfChaoxing extends Question {
    constructor(public position: number, question: QuestionItem) {
        super(question.question, question.options, question.type);
    }

    select() {
        if (typeof this.position !== 'number') return;
        this.answer?.map(index => {
            $(`.queBox .ti-alist:eq(${this.position}) .ti-a .ti-a-i [type=radio]:eq(${index})`).click();
        });
    }
}
