import { Question, QuestionAdapter, QuestionItem, QuestionType } from "../../core/question";
import delay from '../../utools/delay';

const typeRegList: [QuestionType, RegExp][] = [
    [QuestionType.Radio, /单选题/],
    [QuestionType.Checkbox, /多选题/],
];

function questions2json(questions: JQuery<HTMLElement>): QuestionItem[] {
    return questions
        .map((index, question) => {
            const typeText = $(question).find('.subject_type').text();
            const type = typeRegList.reduce((result, rule) => {
                if(rule[1].test(typeText)) return rule[0];
                return result;
            }, QuestionType.Radio);
            return {
                type: type,
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
            };
        })
        .toArray();
}

export class QuestionOfZHIHUISHU extends Question {
    constructor(public position: number, question: QuestionItem) {
        super(question.question, question.options, question.type);
    }

    async select() {
        if (typeof this.position !== 'number') return;
        const answer = this.answer || [];

        switch(this.type) {
            case QuestionType.Checkbox:
                for(const index in this.options) {
                    const el = $(`.examPaper_subject:eq(${this.position}) .subject_node .nodeLab input[type]:eq(${index})`);
                    if((el.get(0) as HTMLInputElement)?.checked) {
                        el.click()
                        await delay(1000);
                    };
                }
                break;
            case QuestionType.Radio:
        }

        for(const index of answer) {
            $(`.examPaper_subject:eq(${this.position}) .subject_node .nodeLab input[type]:eq(${index})`).click();
            await delay(1000);
        }
    }
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