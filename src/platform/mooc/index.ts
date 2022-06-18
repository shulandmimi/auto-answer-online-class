import { Question, QuestionAdapter, QuestionItem, QuestionType } from "../../core/question";

function questions2json(questions: JQuery<HTMLElement>): QuestionItem[] {
    return questions
        .map((index, question) => ({
            type: QuestionType.Radio,
            question: $(question).find('.ti-q-c').text(),
            options: $(question)
                .find('.ti-alist .ti-a')
                .map((index, option) => {
                    const optionel: JQuery = $(option);
                    const prefix = optionel.find('.ti-a-i').text().trim();
                    const body = optionel.find('.ti-a-c').text().trim();
                    return {
                        prefix: prefix.slice(0, prefix.indexOf('.')),
                        body,
                    };
                })
                .toArray(),
        }))
        .toArray();
}

export class QuestionItemFromMooc extends QuestionAdapter {
    parse(): Question[] {
        const questionItem = questions2json($('.queBox'));
        return questionItem.map((item, index) => new QuestionOfMooc(index, { question: item.question, options: item.options, type: item.type }));
    }

    match() {
        return /^(.)*:\/\/(.)*\.uooc\.net\.cn\/exam/.test(location.href);
    }
}

export class QuestionOfMooc extends Question {
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
