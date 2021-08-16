import BaseQuestion from './base-question';
import QuestionType from '../constant/question-type';

class TextQuestion extends BaseQuestion {

  constructor(options = {}) {
    super(options);

    this.type = QuestionType.TEXT.name;
    this.title = options.title || {
      zh: QuestionType.TEXT.desc
    };

    this.from = options.from || '';

    this.encryp = options.encryp != null ? options.encryp : false; // 输入内容是否要加密，true | false
    this.isAnswer = options.isAnswer != null ? options.isAnswer : true;//表格题中设置是否必填，默认必填
  }

}

export default TextQuestion;
