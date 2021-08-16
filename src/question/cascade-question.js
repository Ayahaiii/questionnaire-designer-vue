import BaseQuestion from './base-question';
import QuestionType from '../constant/question-type';

class CascadeQuestion extends BaseQuestion {

    constructor(options = {}) {
        super(options);

        this.type = QuestionType.CASCADE.name;
        this.title = options.title || {zh: QuestionType.CASCADE.desc};
        
        this.cdata = options.cdata || getDefaultLevelList(); // 级联题的内容
        this.layout = options.layout || false;
    }

}


function getDefaultLevelList() {
    let levelList = [];
    levelList.push({
        id : "1",
        title:'',
        options:''
    });
    levelList.push({
        id : "2",
        title:'',
        options:''
    });
    levelList.push({
        id : "3",
        title:'',
        options:''
    });
    return levelList;
}

export default CascadeQuestion;