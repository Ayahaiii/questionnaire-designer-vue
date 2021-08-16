import LanguageType from '../constant/language-type';
import QuestionType from '../constant/question-type';
import ListItem from '../question/list-item';
import MatrixRow from '../question/matrix-row';

import Validator from '../validator/validator';
import Filter from '../filter/filter';
import FilterIF from '../filter/filter-if';
import FilterAction from '../filter/filter-action';

import Variable from '../variable/variable';
import Section from '../section/section';

import store from '../data/store.js';
import questionInfo from '../data/question-info.js';

let QuestionnaireInfo = null;
let QuestionList = null;
let SectionList = null;
let CatalogList = null;
let VariableList = null;
let showidNum = 0;

/**
 * 读取file innput中选中的文件内容
 * @param  {HTMLEelement} htmlInputElement file input控件
 * @param  {Function} callback 回调函数
 */
function readSurvmlFile(htmlInputElement, callback) {
  if (window.File && window.Blob && window.FileReader) {
    let file = htmlInputElement.files[0];
    let reader = new FileReader();
    reader.readAsText(file, "utf-8");

    reader.onload = function (e) {
      let data = this.result;
      callback(data);
    };
    htmlInputElement.value = '';
  } else {
    alert("您的浏览器不支持从本地导入问卷！");
  }
}

function parseSurvml(xmlContent) {
  QuestionnaireInfo = store.state.QuestionnaireInfoMoudle.QuestionnaireInfo;
  QuestionList = store.state.QuestionInfoModule.QuestionList;
  SectionList = store.state.QuestionInfoModule.SectionList;
  CatalogList = store.state.QuestionInfoModule.CatalogList;
  VariableList = store.state.QuestionInfoModule.VariableList;


  if (!xmlContent) {
    alert('加载的内容为空');
    return;
  }

  // console.log('xmlContent', xmlContent)
  let xmlDoc = $.parseXML(xmlContent),
    $xml = $(xmlDoc),
    $survml = $xml.find('survml');

  // 解析问卷头部
  let $heads = $survml.children('head');
  if ($heads.length != 1) {
    throw "解析错误：必须且只能有一个head节点";
  } else {
    _parseHead($heads[0]);
  }

  // 解析问卷主体
  let $bodys = $survml.children('body');
  if ($bodys.length != 1) {
    throw "解析错误：必须且只能有一个body节点";
  } else {
    _parseBody($bodys[0]);
  }

  _getShowId();
}

function _parseHead(head) {
  let $head = $(head);

  // 解析问卷id
  let $ids = $head.children('id');
  if ($ids.length !== 1) {
    throw "解析错误：head节点中，id节点有且只能有一个";
  } else {
    QuestionnaireInfo.id = $ids.text();
  }

  // 解析问卷标题
  let $titles = $head.children('title');
  if ($titles.length != 1) {
    throw "解析错误：head节点中，title节点有且只有一个";
  } else {
    QuestionnaireInfo.title = $titles.text();
  }

  // 解析问卷说明
  let $descriptions = $head.children('description');
  if ($descriptions.length > 0) {
    QuestionnaireInfo.description = $descriptions.text();
  }

  // 解析meta属性
  let $metas = $head.children('meta');
  if ($metas.length > 0) {
    _parseMeta($metas);
  }
}

function _parseMeta($metas) {
  for (let meta of $metas) {
    let $meta = $(meta);
    let type = $(meta).attr('type');
    let text = $(meta).text();

    if (type == 'lang') {
      QuestionnaireInfo.languages = text.split(',');
    } else if (type == 'theme') {
      QuestionnaireInfo.metas[0].text = text;
    } else {
      QuestionnaireInfo.metas.push({
        type: type,
        text: text
      });
    }
  }

}

function _parseBody(body) {
  let $body = $(body);
  
  // 解析变量
  let $variables = $body.children('variables');
  if ($variables.length > 1) {
    throw "解析错误：body节点中，只能有一个variables节点";
  } else if ($variables.length == 1) {
    let $variableList = $($variables[0]).children('variable');
    for (let variable of $variableList) {
      _parseVariable(variable);
    }
  }

  // 解析问题
  let $questions = $body.children('questions');
  if ($questions.length != 1) {
    throw "解析错误：body节点中，必须且只能有一个questions节点";
  } else {
    let $questionList = $($questions[0]).children('question');
    for (let question of $questionList) {
      _parseQuestion(QuestionList, question);
    }

    if (QuestionList.length == 0) {
      throw "解析错误：body节点中，questions节点必须要有子节点";
    }
  }

  // 解析section
  let $sectionsList = $body.children('sections');
  if ($sectionsList.length > 0) {
    let $sectionList = $($sectionsList[0]).children('section');
    for (let section of $sectionList) {
      _parseSection(SectionList, section);
    }

    // 未被分页的题目放到CatalogList中
    let lastQid = SectionList[SectionList.length - 1].end;
    let lastIndex = QuestionList.findIndex((question, index) => question.id == lastQid);
    for (let index = lastIndex + 1; index < QuestionList.length; index++) {
      if (QuestionList[index].type != 'section') {
        CatalogList.push(QuestionList[index]);
      }
    }
  }
}

function _parseVariable(variableNode) {
  let opts = _getAttributesAsOptions(variableNode);
  if (opts.type == 'value') {
    opts.value = JSON.parse($(variableNode).text().trim());

    if (Array.isArray(opts.value)) {
      opts.type = 'list';
    } else {
      opts.type = 'value';
    }
  }
  let variable = new Variable(opts);
  VariableList.push(variable);
}

function _parseQuestion(questionList, questionNode) {
  let questionOpts = _getAttributesAsOptions(questionNode);
  let $question = $(questionNode);
  let $title = $question.children('title');
  let $hint = $question.children('hint');
  let $control = $question.children('control');
  let $validation = $question.children('validation');
  let $before = $question.children('before');
  let $middle = $question.children('middle');
  let $after = $question.children('after');

  Object.assign(questionOpts, _getAttributesAsOptions($control[0]));

  if ($hint.length > 0) {
    Object.assign(questionOpts, _getAttributesAsOptions($hint[0]));
    questionOpts['hintHidden'] = questionOpts['hidden'];
  }
  // console.log(`解析问题[type=${questionOpts.type}, id=${questionOpts.id}]`);

  _parseQuestionTitle(questionOpts, $title);
  _parseQuestionHint(questionOpts, $hint);
  _parseQuestionControl(questionOpts, $control);
  if (questionOpts.name && !questionOpts.title['zh']) {
    questionOpts.title['zh'] = questionOpts.name;
  }
  _parseQuestionValidation(questionOpts, $validation);

  // 解析前、中、后置验证逻辑
  questionOpts.filters = [];
  _parseQuestionFilter(questionOpts, $before, 'before');
  _parseQuestionFilter(questionOpts, $middle, 'middle');
  _parseQuestionFilter(questionOpts, $after, 'after');

  let languages = QuestionnaireInfo.languages;
  let question = questionInfo.createQuestion(questionOpts, questionList, languages);
  questionList.push(question);
}

function _parseQuestionTitle(questionOpts, $title) {
  questionOpts.title = {};
  questionOpts.title['zh'] = $title.contents().filter(function () {
    return this.nodeType == 3;
  }).text().trim();

  for (let language in LanguageType) {
    let text = $title.children(language).text().trim();
    if (text) {
      questionOpts.title[language] = text;
    }
  }
}

function _parseQuestionHint(questionOpts, $hint) {
  questionOpts.hint = {};
  questionOpts.hint['zh'] = $hint.contents().filter(function () {
    return this.nodeType == 4
  }).text().trim();

  for (let language in LanguageType) {
    let text = $hint.children(language).text().trim();
    if (text) {
      questionOpts.hint[language] = text;
    }
  }
}

function _parseQuestionControl(questionOpts, $control) {
  if ($control.parent()[0].tagName == 'col' && questionOpts.isAnswer !== undefined) {
    questionOpts.from = 'MatrixQuestion';
  } else if ($control.parent()[0].tagName == 'col') {
    questionOpts.from = 'MatrixQuestionSingledimension'
  }

  switch (questionOpts.type) {
    case QuestionType.INFO.name:
      questionOpts.content = $control.text().trim() || '';
      break;
    case QuestionType.SINGLE.name:
    case QuestionType.DROPDOWN.name:
    case QuestionType.MULTIPLE.name:
    case QuestionType.ASSIGNMENT.name:
    case QuestionType.SORT.name:
    case QuestionType.SEARCH.name:
      _parseItemList(questionOpts, $control);
      break;
    case QuestionType.SCALE.name:
      _parseDesc(questionOpts, $control);
      break;
    case QuestionType.MATRIX.name:
      _parseMatrixQuestion(questionOpts, $control);
      break;
    case QuestionType.CASCADE.name:
      questionOpts.cdata = JSON.parse($control.text().trim()) || '';
      if (questionOpts.layout == 'verticle') {
        questionOpts.layout = true
      } else {
        questionOpts.layout = false
      }
      break;
  }

  if (questionOpts.showid === false) {
    showidNum++
  }
}

function _parseMatrixQuestion(questionOpts, $control) {
  // 解析表格行
  questionOpts.rows = [];
  let $rowList = $control.find("row");
  for (let rowNode of $rowList) {
    let $row = $(rowNode);
    let opts = _getAttributesAsOptions(rowNode);
    opts.name = {
      zh: opts.name
    };

    opts.name['zh'] = $row.contents().filter(function () {
      return this.nodeType == 3
    }).text().trim() || opts.name['zh'];

    for (let language in LanguageType) {
      let text = $row.children(language).text().trim();
      if (text) {
        opts.name[language] = text;
      }
    }

    let row = new MatrixRow(opts);
    questionOpts.rows.push(row);
  }
  
  // 解析表格列
  questionOpts.cols = [];
  let $colList = $control.find("col");
  for (let colNode of $colList) {
    _parseQuestion(questionOpts.cols, colNode);
  }
}

function _parseDesc(questionOpts, $control) {
  let $minDesc = $control.find("mindesc");
  let $maxDesc = $control.find("maxdesc");

  questionOpts.mindesc = {};
  questionOpts.mindesc['zh'] = $minDesc.contents().filter(function () {
    return this.nodeType == 3;
  }).text().trim();
  for (let language in LanguageType) {
    let text = $minDesc.children(language).text().trim();
    if (text) {
      questionOpts.mindesc[language] = text;
    }
  }

  questionOpts.maxdesc = {};
  questionOpts.maxdesc['zh'] = $maxDesc.contents().filter(function () {
    return this.nodeType == 3;
  }).text().trim();
  for (let language in LanguageType) {
    let text = $maxDesc.children(language).text().trim();
    if (text) {
      questionOpts.maxdesc[language] = text;
    }
  }

}

function _parseItemList(questionOpts, $control) {
  questionOpts.itemlist = [];
  let $itemList = $control.children('li');
  for (let itemNode of $itemList) {
    let $item = $(itemNode);
    let opts = _getAttributesAsOptions(itemNode);
    opts.name = {
      zh: opts.name
    };

    opts.name['zh'] = $item.contents().filter(function () {
      return this.nodeType == 3
    }).text().trim() || opts.name['zh'];

    for (let language in LanguageType) {
      let text = $item.children(language).text().trim();
      if (text) {
        opts.name[language] = text;
      }
    }

    if (!(/^0|1|2|3$/.test(opts.group))) {
      opts.userDefinedGroup = opts.group
      opts.group = '自定义'
    }

    let item = new ListItem(opts);
    questionOpts.itemlist.push(item);
  }
  if (questionOpts.layout == 'horizental') {
    questionOpts.layout = true
  } else {
    questionOpts.layout = false
  }
}

function _parseQuestionValidation(questionOpts, $validation) {
  questionOpts.validation = [];
  let $validatorList = $validation.children();
  for (let validatorNode of $validatorList) {
    _parseValidator(questionOpts.validation, validatorNode);
  }
}

function _parseValidator(validatorList, validatorNode) {
  let validatorOpts = _getAttributesAsOptions(validatorNode);
  let validator = new Validator(validatorOpts);
  validatorList.push(validator);
}

function _parseQuestionFilter(questionOpts, $filter, type) {
  let filter = new Filter({
    type: type
  });

  let $childrenList = $filter.children();
  for (let ifOrActionNode of $childrenList) {
    if (ifOrActionNode.nodeName == 'if') {
      _parseIf(filter.scripts, ifOrActionNode);
    } else {
      _parseAction(filter.scripts, ifOrActionNode);
    }
  }

  if (filter.scripts.length == 0) {
    let cdata = $filter.text().trim();
    filter.cdata = cdata;
  }

  if (filter.scripts.length > 0 || filter.cdata) {
    questionOpts.filters.push(filter);
  }
}

function _parseIf(scriptList, ifNode) {
  let $if = $(ifNode);
  let $childNodeList = $if.children();

  let filterIf = new FilterIF({
    test: $if.attr('test')
  });

  for (let trueOfFalseNode of $childNodeList) {
    if (trueOfFalseNode.nodeName == 'true') {
      for (let actionNode of $(trueOfFalseNode).children()) {
        _parseAction(filterIf.trueActions, actionNode);
      }
    }
    if (trueOfFalseNode.nodeName == 'false') {
      for (let actionNode of $(trueOfFalseNode).children()) {
        _parseAction(filterIf.falseActions, actionNode);
      }
    }
  }

  scriptList.push(filterIf);
}

// 解析action，包括goto等
function _parseAction(scriptList, node) {
  let actionOpts = {
    type: node.nodeName
  }
  Object.assign(actionOpts, _getAttributesAsOptions(node));

  if (actionOpts.type == 'setv') {
    actionOpts.id = actionOpts.id.replace(/#/, '').replace(/{/, '').replace(/}/, '');
  }

  // 拼凑动作表达式
  let xmlContent = `<${node.nodeName}`;
  for (let attrNode of node.attributes) {
    xmlContent += ` ${attrNode.nodeName}="${attrNode.nodeValue}"`;
  }
  xmlContent += `/>`;
  actionOpts.xmlContent = xmlContent;

  let action = new FilterAction(actionOpts);
  scriptList.push(action);
  
}


function _parseSection(sectionList, sectionNode) {
  let section = _getSectionObj(sectionNode);
  let beginIndex = QuestionList.findIndex(question => question.id == section.begin);
  let endIndex = QuestionList.findIndex(question => question.id == section.end);
  sectionList.push(section);
  QuestionList.splice(beginIndex, 0, section);
  QuestionList.splice(endIndex + 2, 0, section);
}

function _getSectionObj(sectionNode) {
  let sectionOpts = _getAttributesAsOptions(sectionNode);

  let $section = $(sectionNode);
  let $title = $section.children('title');
  let $subsection = $section.children('section');

  _parseSectionTitle(sectionOpts, $title);
  _parseSectionContent(sectionOpts);
  if ($subsection.length > 0) {
    sectionOpts.subsection = _getSectionObj($subsection[0]);
  }

  return new Section(sectionOpts);
}

function _parseSectionTitle(sectionOpts, $title) {
  sectionOpts.title = {};
  sectionOpts.title['zh'] = $title.contents().filter(function () {
    return this.nodeType == 3
  }).text().trim();

  for (let language in LanguageType) {
    let text = $title.children(language).text().trim();
    if (text) {
      sectionOpts.title[language] = text;
    }
  }
}

function _parseSectionContent(sectionOpts) {
  let beginIndex = QuestionList.findIndex(question => question.id == sectionOpts.begin);
  let endIndex = QuestionList.findIndex(question => question.id == sectionOpts.end);
  sectionOpts.content = QuestionList.filter((question, index) => index >= beginIndex && index <= endIndex);
}


function _getAttributesAsOptions(node) {
  let opts = {};
  let attributes = node.attributes;
  for (let attribute of attributes) {
    let key = attribute.name;
    let value = attribute.value;

    // 需要特殊处理的属性
    switch (key) {
      case 'right-label':
        key = 'rightlabel';
        break;
      case 'input-type':
        key = 'inputtype';
        break;
      case 'input-size':
        key = 'inputsize';
        break;
      case 'input-required':
        key = 'inputrequired';
        break;
      case 'input-value':
        key = 'inputvalue';
        break;
      case 'search-data':
        key = 'searchdata';
        break;
      case 'visible_to':
        key = 'visibleTo';
        break;
      default:
        key = key;
        break;
    }

    value = _convertValue(value);
    opts[key] = value;

  }
  return opts;
}

function _convertValue(value) {
  if (value == 'true') {
    return true;
  }
  if (value == 'false') {
    return false;
  }
  if ($.isNumeric(value)) {
    return parseInt(value);
  }
  return value;
}

function _getShowId() {
  let questionNum = QuestionList.filter(question => !(question instanceof Section))
  if (showidNum == questionNum.length) {
    QuestionnaireInfo.showid = 'false'
  }
}

export {
  readSurvmlFile,
  parseSurvml
}
