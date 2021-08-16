import ListQuestion from './list-question';
import QuestionType from '../constant/question-type';

class SearchQuestion extends ListQuestion {

    constructor(options = {}) {
        super(options);

        this.type = QuestionType.SEARCH.name;
        this.title = options.title || {zh: QuestionType.SEARCH.desc};
        
        this.dynamic = options.dynamic != null ? options.dynamic : false;
		this.searchdata = options.searchdata || "";
    }

}

export default SearchQuestion;