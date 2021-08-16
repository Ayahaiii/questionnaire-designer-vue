import ListQuestion from './list-question';
import QuestionType from '../constant/question-type';

class SingleSelectQuestion extends ListQuestion {

    constructor(options = {}) {
        super(options);
        
        this.type = QuestionType.SINGLE.name;
        this.title = options.title || {zh: QuestionType.SINGLE.desc};

        this.from = options.from || '';
        this.isAnswer = options.isAnswer != null ? options.isAnswer : true;//表格题中设置是否必填，默认必填
        this.isHorizental = options.layout == 'horizental' ? true : false
    }

}

export default SingleSelectQuestion;