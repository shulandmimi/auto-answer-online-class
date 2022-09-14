export default function cancelAttachShadow() {
    const callback = function () {};
    callback.toString = function () {
        return 'function () { [native code] }';
    };

    // @ts-ignore
    (unsafeWindow || window).Element.prototype.attachShadow = callback;
}
