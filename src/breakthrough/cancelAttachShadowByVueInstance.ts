export default function cancelAttachShadowByVueInstance() {
    for (const div of Array.from(document.querySelectorAll('.subject_describe > div'))) {
        // @ts-ignore
        div.__vue__.$el.innerHTML = div.__vue__._data.shadowDom.textContent;
    }
}
