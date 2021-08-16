import BaseQuestion from './base-question'
import QuestionType from '../constant/question-type'

class SignatureQuestion extends BaseQuestion {
  constructor (option = {}) {
    super(option);

    this.type = QuestionType.SIGNATURE.name;
    this.title = option.title || {zh: QuestionType.SIGNATURE.desc}
  }
}

export default SignatureQuestion
