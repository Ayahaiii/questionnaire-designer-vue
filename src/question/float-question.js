import BaseQuestion from './base-question';
import QuestionType from '../constant/question-type';

class FloatQuestion extends BaseQuestion {

    constructor(options = {}) {
        super(options);

        this.type = QuestionType.FLOAT.name;
        this.title = options.title || {zh: QuestionType.FLOAT.desc};

        this.from = options.from || '';
        
        this.encryp = options.encryp != null ? options.encryp : false; // 输入内容是否要加密，true | false
        this.calc = options.calc != null ? options.calc : false;  // 是否显示计算器
        this.isAnswer = options.isAnswer != null ? options.isAnswer : true;//表格题中设置是否必填，默认必填
    }

}

export default FloatQuestion;