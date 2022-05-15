import { Question, QuestionAdapter, QuestionItem, QuetionType } from "../../core/question";

function questions2json(questions: JQuery<HTMLElement>): QuestionItem[] {
    return questions
        .map((index, question) => ({
            type: QuetionType.Radio,
            question: $(question).find('.subject_stem .subject_describe').text(),
            options: $(question)
                .find('.subject_node .nodeLab')
                .map((index, option) => {
                    const optionel = $(option);
                    const prefix = optionel.find('.ABCase').text().trim();
                    const body = optionel.find('.node_detail').text().trim();
                    return {
                        prefix: prefix.slice(0, prefix.indexOf('.')),
                        body,
                    };
                })
                .toArray(),
        }))
        .toArray();
}

export class QuestionItemFromZHIHUISHU extends QuestionAdapter {
    parse(): Question[] {
        const questionItem = questions2json($('.examPaper_subject'));
        return questionItem.map((item, index) => new QuestionOfZHIHUISHU(index, { question: item.question, options: item.options, type: item.type }));
    }

    match() {
        return /^(.)*:\/\/onlineexamh5new\.zhihuishu\.com\/stuExamWeb\.html.*/.test(location.href);
    }
}

export class QuestionOfZHIHUISHU extends Question {
    constructor(public position: number, question: QuestionItem) {
        super(question.question, question.options);
    }

    select() {
        if (typeof this.position !== 'number') return;
        this.answer?.map(index => {
            $(`.examPaper_subject:eq(${this.position}) .subject_node .nodeLab input[type=radio]:eq(${index})`).click();
        });
    }
}
