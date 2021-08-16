import BaseQuestion from './base-question';
import QuestionType from '../constant/question-type';

class InfoQuestion extends BaseQuestion {

    constructor(options = {}) {
        super(options);

        this.required = false;
        this.type = QuestionType.INFO.name;
        this.title = options.title || {zh: QuestionType.INFO.desc};
        this.content = options.content || ''; // 提示题的内容文字，支持富文本，暂时不支持多语言
    }

}

export default InfoQuestion;