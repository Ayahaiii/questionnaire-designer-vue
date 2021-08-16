import BaseQuestion from './base-question';
import QuestionType from '../constant/question-type';

class ScaleQuestion extends BaseQuestion {

    constructor(options = {}) {
        super(options);

        this.type = QuestionType.SCALE.name;
        this.title = options.title || {zh: QuestionType.SCALE.desc};
        
		this.minscale = options.minscale || 1; // 最小刻度
	    this.maxscale = options.maxscale || 5; // 最大刻度
	    this.mindesc = options.mindesc || {zh: '非常不喜欢'}; // 最小部分的描述，如极度厌恶
	    this.maxdesc = options.maxdesc || {zh: '非常喜欢'}; // 最大部分的描述，如极度喜欢
	    this.layout = options.layout || "drag";// drag | star
    }

}

export default ScaleQuestion;