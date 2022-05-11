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
