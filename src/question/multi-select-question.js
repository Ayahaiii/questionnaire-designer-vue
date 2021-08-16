import ListQuestion from './list-question';
import QuestionType from '../constant/question-type';

class MultiSelectQuestion extends ListQuestion {

  constructor(options = {}) {
    super(options);

    this.type = QuestionType.MULTIPLE.name;
    this.title = options.title || {
      zh: QuestionType.MULTIPLE.desc
    };

    this.from = options.from || '';

    this.min = options.min || 0; // 最小选择选项个数，0-max
    this.max = options.max || 0; // 最大选择选项个数，0表示不限制
    this.isAnswer = options.isAnswer != null ? options.isAnswer : true;//表格题中设置是否必填，默认必填
    this.isHorizental = options.layout == 'horizental' ? true : false
  }

}

export default MultiSelectQuestion;
