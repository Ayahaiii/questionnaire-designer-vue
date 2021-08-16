import ListQuestion from './list-question';
import QuestionType from '../constant/question-type';

class DropdownSelectQuestion extends ListQuestion {

    constructor(options = {}) {
        super(options);

        this.from = options.from || '';
        
        this.type = QuestionType.DROPDOWN.name;
        this.title = options.title || {zh: QuestionType.DROPDOWN.desc};
        this.isAnswer = options.isAnswer != null ? options.isAnswer : true;//表格题中设置是否必填，默认必填
        this.isHorizental = options.layout == 'horizental' ? true : false
    }

}

export default DropdownSelectQuestion;