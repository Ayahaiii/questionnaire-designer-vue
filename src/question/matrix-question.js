import QuestionType from '../constant/question-type';
import BaseQuestion from './base-question';
import SingleSelectQuestion from './single-select-question';
import MultiSelectQuestion from './multi-select-question';
import DropdownSelectQuestion from './dropdown-select-question';
import IntegerQuestion from '../question/integer-question';
import FloatQuestion from '../question/float-question';
import TextQuestion from '../question/text-question';
import DatetimeQuestion from '../question/datetime-question';
import MatrixRow from './matrix-row';

import Questionnaire from '../data/questionnaire-info';

class MatrixQuestion extends BaseQuestion {

  static getDefaultColQuestion(type = QuestionType.SINGLE.name, matrixtype) {
    let questionList = [];
    
    if (!type) type = QuestionType.SINGLE.name;

    switch (type) {
      case QuestionType.SINGLE.name: {
        if (matrixtype == "dimensions") {
          questionList.push(new SingleSelectQuestion({
            id: 'c1',
            from: 'MatrixQuestion',
            required: false
          }));
        } else {
          questionList.push(new SingleSelectQuestion({
            id: 'c1',
            from: 'MatrixQuestionSingledimension'
          }));
        }
      }
      break;
      case QuestionType.MULTIPLE.name: {
        if (matrixtype == "dimensions") {
          questionList.push(new MultiSelectQuestion({
            id: 'c1',
            from: 'MatrixQuestion',
            required: false
          }));
        } else {
          questionList.push(new MultiSelectQuestion({
            id: 'c1',
            from: 'MatrixQuestionSingledimension'
          }));
        }
      }
      break;
    }

    return questionList;
  }

  constructor(options = {}) {
    super(options);

    this.type = QuestionType.MATRIX.name;
    this.title = options.title || {
      zh: QuestionType.MATRIX.desc
    };
    
    this.required = options.matrixtype == 'singledimension' ? (options.required != null ? options.required : true) : false;
    this.order = options.order || "normal"; // 行显示顺序，normal | random | reverse
    this.matrixtype = options.matrixtype || 'dimensions'; // 表格题类型，singledimension|dimensions
    this.layout = options.layout || ''; // 表格显示样式，responsive是表示自适应，fixed-row-title表示第一列固定，horizental水平
    this.style = options.style || ''; // 表格按照excel形式展示，列不支持选择题
    this.hscroll = options.hscroll != null ? options.hscroll : false; // 是否允许横向滚动，默认不允许
    this.rows = parseRowList(options.rows) || getDefaultRowList();
    this.cols = parseColList(options.cols) || MatrixQuestion.getDefaultColQuestion(null, this.matrixtype);

    this.isBatchEditRow = options.isBatchEdit || false // 是否批量编辑表格行
    this.batchEditRowContent = options.batchEditContent || '' // 批量编辑表格行的内容
  }

}

function parseRowList(arr = []) {
  let rowList = [];
  for (let row of arr) {
    rowList.push(new MatrixRow(row));
  }
  return rowList.length > 0 && rowList;
}

function getDefaultRowList() {
  let rowList = [];
  rowList.push(new MatrixRow({
    id: "1",
    name: {
      zh: "表格行1"
    },
    script: ''
  }));
  rowList.push(new MatrixRow({
    id: "2",
    name: {
      zh: "表格行2"
    },
    script: ''
  }));
  rowList.push(new MatrixRow({
    id: "3",
    name: {
      zh: "表格行3"
    },
    script: ''
  }));

  let languages = Questionnaire.state.QuestionnaireInfo.languages;
  for (let row of rowList) {
    for (let language of languages) {
      row.name[language] = row.name['zh'];
    }
  }
  return rowList;
}

function parseColList(arr = []) {
  let colList = [];
  for (let col of arr) {
    switch (col.type) {
      case QuestionType.SINGLE.name:
        colList.push(new SingleSelectQuestion(col));
        break;
      case QuestionType.MULTIPLE.name:
        colList.push(new MultiSelectQuestion(col));
        break;
      case QuestionType.DROPDOWN.name:
        colList.push(new DropdownSelectQuestion(col));
        break;
      case QuestionType.INTEGER.name:
        colList.push(new IntegerQuestion(col));
        break;
      case QuestionType.FLOAT.name:
        colList.push(new FloatQuestion(col));
        break;
      case QuestionType.TEXT.name:
        colList.push(new TextQuestion(col));
        break;
      case QuestionType.DATETIME.name:
        colList.push(new DatetimeQuestion(col));
        break;
    }
  }

  return colList.length > 0 && colList;
}

export default MatrixQuestion;
