import BaseQuestion from './base-question';
import QuestionType from '../constant/question-type';

class RecordingQuestion extends BaseQuestion {

    constructor(options = {}) {
        super(options);

        this.type = QuestionType.RECORDING.name;
        this.title = options.title || {zh: QuestionType.RECORDING.desc};
        
        this.count = options.count || 1;   // 音频数量
		this.quality = options.quality || "high";  // 音频的清晰度
    }
}

export default RecordingQuestion;