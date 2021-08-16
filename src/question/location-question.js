import BaseQuestion from './base-question';
import QuestionType from '../constant/question-type';

class LocationQuestion extends BaseQuestion {

    constructor(options = {}) {
        super(options);

        this.type = QuestionType.LOCATION.name;
        this.title = options.title || {zh: QuestionType.LOCATION.desc};
        
		this.method = options.method || "gps"; // 定位方式 gps | cell | all
    }

}

export default LocationQuestion;