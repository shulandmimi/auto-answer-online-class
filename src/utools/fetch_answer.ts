import { Question } from '../core/question';

export default async function fetch_answer(question: Question): Promise<Success<string> | Failed> {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'http://cx.icodef.com/wyn-nb',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: '',
            },
            data: `question=${encodeURIComponent(question.question)}`,
            onload(data: any) {
                resolve($.parseJSON(data.responseText) || {});
            },
            onerror(error: any) {
                reject(error);
            },
        });
    });
}
