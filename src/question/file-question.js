import BaseQuestion from './base-question'
import QuestionType from '../constant/question-type'

class FileQuestion extends BaseQuestion {
  constructor (option = {}) {
    super(option);

    this.type = QuestionType.FILE.name;
    this.title = option.title || {zh: QuestionType.FILE.desc};

  }
}

export default FileQuestion
