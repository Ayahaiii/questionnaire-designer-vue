import BaseQuestion from './base-question';
import QuestionType from '../constant/question-type';

class PhotoQuestion extends BaseQuestion {

  constructor(options = {}) {
    super(options);

    this.type = QuestionType.PHOTO.name;
    this.title = options.title || {
      zh: QuestionType.PHOTO.desc
    };

    this.source = 0; // 来源
    this.count = options.count || 1; // 图片数量
    this.quality = options.quality || "high"; // 图片精度 high | medium | low
  }

}

export default PhotoQuestion;
