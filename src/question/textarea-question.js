import BaseQuestion from './base-question';
import QuestionType from '../constant/question-type';

class TextAreaQuestion extends BaseQuestion {

    constructor(options = {}) {
        super(options);

        this.type = QuestionType.TEXTAREA.name;
        this.title = options.title || {zh: QuestionType.TEXTAREA.desc};
        
		this.multiline = options.multiline || 1;// 多行文本开放题的显示高度
    }

}

export default TextAreaQuestion;