import ListQuestion from './list-question';
import QuestionType from '../constant/question-type';

class AssignmentQuestion extends ListQuestion {

  constructor(options = {}) {
    super(options);

    this.type = QuestionType.ASSIGNMENT.name;
    this.title = options.title || {
      zh: QuestionType.ASSIGNMENT.desc
    };

    this.valuetype = options.valuetype || "string"; // 输入值的类型，int|float|string
    this.calc = options.calc != null ? options.calc : false;  // 是否显示计算器
  }

}

export default AssignmentQuestion;
