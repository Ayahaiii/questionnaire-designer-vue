import ListQuestion from './list-question';
import QuestionType from '../constant/question-type';

class SortQuestion extends ListQuestion {

    constructor(options = {}) {
        super(options);

        this.type = QuestionType.SORT.name;
        this.title = options.title || {zh: QuestionType.SORT.desc};
        
        this.min = options.min || 0; // 最小选择选项个数，0-max
    	this.max = options.max || 0; // 最大选择选项个数，0表示不限制
    }

}

export default SortQuestion;