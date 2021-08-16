import BaseQuestion from './base-question';
import QuestionType from '../constant/question-type';

class ProvCityQuestion extends BaseQuestion {

    constructor(options = {}) {
        super(options);

        this.type = QuestionType.PROVCITY.name;
        this.title = options.title || {zh: QuestionType.PROVCITY.desc};
        this.hastown = options.hastown || false;
    }

}

export default ProvCityQuestion;