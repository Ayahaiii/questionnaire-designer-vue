import BaseQuestion from './base-question';
import QuestionType from '../constant/question-type';

class DatetimeQuestion extends BaseQuestion {

    constructor(options = {}) {
        super(options);

        this.type = QuestionType.DATETIME.name;
        this.title = options.title || {zh: QuestionType.DATETIME.desc};
        
		this.format = options.format || "yy-mm-dd"; // 日期格式yy-mm-dd | hh:mm:ss | yy-mm-dd hh:mm:ss
    }

}

export default DatetimeQuestion;