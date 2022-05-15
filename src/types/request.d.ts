interface Success<T> {
    code: 1 | -1;
    data: T;
    msg: string;
}

interface Failed {
    code: 0;
    data: string;
    msg: string;
}

interface GM_xmlhttpRequestParams {
    method: string;
    url: string; // 'http://cx.icodef.com/wyn-nb',
    headers: { [key: string]: string };
    data: string;
    onload: (data: XMLHttpRequest) => void;
    onerror: (err: any) => void;
}

function GM_xmlhttpRequest(params: GM_xmlhttpRequestParams): void;
