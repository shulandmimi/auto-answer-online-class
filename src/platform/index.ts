import { AdapaterManager } from '../core/adapterManager';
import { QuestionAdapter } from '../core/question';

export class QuestionAdapterManager<T extends QuestionAdapter = QuestionAdapter> extends AdapaterManager<QuestionAdapter> {
    index = 0;
    use() {
        this.adapter = this.adapters[this.index];
        super.use();
    }

    test(adapter: T) {
        return adapter.match();
    }
}
