import QuestionType from '../constant/question-type';
import ListQuestion from '../question/list-question';
import ScaleQuestion from '../question/scale-question';
import SingleSelectQuestion from '../question/single-select-question';
// import { QuestionnaireInfo, QuestionList, SectionList, VariableList } from '../data/data-store';
import * as Utils from '../tool/utils';

import store from '../data/store.js';

import Filter from '../filter/filter'

// responseIdentityArr
let QuestionnaireInfo = null;
let QuestionList = null;
let SectionList = null;
let VariableList = null;

let responseIdentity = null

function writeSurvml() {
  QuestionList = store.state.QuestionInfoModule.QuestionList;
  QuestionnaireInfo = store.state.QuestionnaireInfoMoudle.QuestionnaireInfo;
  SectionList = store.state.QuestionInfoModule.SectionList;
  VariableList = store.state.QuestionInfoModule.VariableList;

  responseIdentity = QuestionnaireInfo.responseIdentity

  if (QuestionList.length <= 0) {
    throw '还没有在问卷中添加题目';
  }

  console.log('生成xml文本...');
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<survml publishVersion="standard">\n`;

  xml += _getHeadSurvml();
  xml += _getBodySurvml();

  xml += `</survml>`;
  return xml;
}

function _getHeadSurvml() {
  let xml = ``;
  xml += `<head>\n`;
  xml += `<id>${QuestionnaireInfo.id}</id>\n`;
  xml += `<title>${QuestionnaireInfo.title}</title>\n`;
  xml += `<description>${QuestionnaireInfo.description}</description>\n`;
  xml += `<meta type="lang">${QuestionnaireInfo.languages.join(',')}</meta>\n`;
  for (let meta of QuestionnaireInfo.metas) {
    xml += `<meta type="${meta.type}">${meta.text}</meta>\n`;
  }
  xml += `<meta type="progress">${QuestionnaireInfo.isShowProgress==0?false:true}</meta>\n`
  xml += `</head>\n`;

  return xml;
}

function _getBodySurvml() {
  let xml = ``;
  xml += `<body>\n`;

  xml += _getVariablesSurvml();
  xml += _getQuestionsSurvml();
  xml += _getSectionsSurvml();

  xml += `</body>\n`;

  return xml;
}

function _getVariablesSurvml() {
  let xml = ``;

  if (VariableList.length <= 0) {
    return xml;
  }

  xml += `<variables>\n`;

  for (let variable of VariableList) {
    let varId = variable.id;
    let varType = variable.type;
    let varReadonly = variable.readonly;
    let varValue = variable.value;

    let reg = /^((\d)|(_))\w*/;
    if (reg.test(varId)) {
      throw `变量${varId}的编号不能由数字或下划线开头`;
    }

    // 检查变量是否重复
    let countOfSameId = 0;
    for (let variable2 of VariableList) {
      if (varId == variable2.id) {
        countOfSameId += 1;
      }
    }
    if (countOfSameId > 1) {
      throw `变量${varId}重复`;
    }

    if (varType == 'list' || varType == 'value') {
      let Value = JSON.stringify(varValue);
      xml += `<variable id="${varId}" type="value" ${varReadonly == true? 'readonly="true"':''}><![CDATA[${Value}]]></variable>\n`;
    } else {
      xml += `<variable id="${varId}" type="${varType}" ${varReadonly == true? 'readonly="true"':''} value="${varValue}" />\n`;
    }
  }

  xml += `</variables>\n`;

  return xml;
}

function _getQuestionsSurvml() {
  let xml = ``;
  xml += `<questions>\n`;

  for (let question of QuestionList) {
    if (question.type != 'section') {
      xml += _getQuestionSurvml(question);
    }
  }

  xml += `</questions>\n`;

  return xml;
}

function _getQuestionSurvml(question) {
  let xml = ``;

  let reg = /^((\d)|(_))\w*/;
  if (reg.test(question.id)) {
    throw `问题${question.id}的编号不能由数字或下划线开头`;
  }

  xml += `<question ${_getQuestionAttrSurvml(question)}>\n`;
  xml += _getQuestionHintSurvml(question);
  xml += _getQuestionTitleSurvml(question);
  xml += `<control ${_getQuestionControlAttrSurvml(question)}>`;
  if (question.type == QuestionType.INFO.name && question.content) { // 提示题
    xml += `<![CDATA[${question.content}]]>`;
  }
  if (question instanceof ScaleQuestion) { // 打分题
    xml += _getDescSurvml(question);
  }
  if (question instanceof ListQuestion) { // 带选项的题目
    if (question.itemSource == 'custom') {
      xml += _getItemlistSurvml(question);
    }
  }
  if (question.type == QuestionType.MATRIX.name) { // 表格题
    xml += _getMatrixRowsAndColsSurvml(question);
  }
  if (question.type == QuestionType.CASCADE.name && question.cdata) { // 级联题
    xml += `<![CDATA[${JSON.stringify(question.cdata)}]]>`;
  }
  xml += `</control>\n`;

  xml += _getQuestionValidationSurvml(question);
  
  identityAfterFilter(question);
  xml += _getQuestionFiltersSurvml(question);

  xml += `</question>\n`;

  return xml;
}

function _getQuestionAttrSurvml(question) {
  var xml = ``;

  if (Utils.checkObjectIdRepeatInList(QuestionList, question.guid, question.id)) {
    throw `问题${question.id}的编号重复`;
  }

  xml += `id="${question.id}"`;
  if (question.varname) {
    xml += ` varname="${question.varname}" vardesc="${question.vardesc}"`;
  }
  if (!(question.from == 'MatrixQuestionSingledimension' || question.from == 'MatrixQuestion')) {
    xml += ` required="${question.required}"`;
  }
  if (!question.visible) {
    xml += ` visible="${question.visible}"`;
  }
  xml += ` needaudio="${question.needaudio}"`;
  if (question.resurl) {
    xml += ` resurl="${question.resurl}"`;
    xml += ` restype="${question.restype}"`;
  }
  if (question.value) {
    xml += ` value="${question.value}"`;
  }
  if (question.visibleTo != 0) {
    xml += ` visible_to="${question.visibleTo}"`;
  }
  return xml;
}

function _getQuestionHintSurvml(question) {
  let xml = ``;
  if (QuestionnaireInfo.languages.length == 1) {
    if (question.hint['zh']) {
      // xml += `<hint hidden="${question.hintHidden}">111111${question.hint['zh'].replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</hint>\n`;
      xml += `<hint hidden="${question.hintHidden}"><![CDATA[${question.hint['zh'].replace(/"/g, "'")}]]></hint>\n`
    }
  } else {
    let hasHint = false;
    let tmpXml = ``;
    for (let language of QuestionnaireInfo.languages) {
      if (question.hint[language]) {
        tmpXml += `<${language}>${question.hint[language]}</${language}>\n`;
        hasHint = true;
      }
    }
    if (hasHint) {
      xml += `<hint hidden="${question.hintHidden}">\n`;
      xml += `${tmpXml}`;
      xml += `</hint>\n`;
    }
  }

  return xml;
}

function _getQuestionTitleSurvml(question) {
  let xml = ``;

  if (QuestionnaireInfo.languages.length == 1) {
    xml += `<title>${question.title['zh'].replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>\n`;
  } else {
    xml += `<title>\n`;
    for (let language of QuestionnaireInfo.languages) {
      xml += `<${language}>${question.title[language] || question.title['zh']}</${language}>\n`;
    }
    xml += `</title>\n`;
  }
  return xml;
}

function _getQuestionControlAttrSurvml(question) {
  let xml = ``;
  let type = question.type;
  xml += `type="${type}"`;
  switch (type) {
    case QuestionType.INTEGER.name: {
      if (question.encryp) {
        xml += ` encryp="true"`;
      }
      if (question.calc) {
        xml += ` calc="true"`;
      }
    }
    break;
    case QuestionType.FLOAT.name: {
      if (question.encryp) {
        xml += ` encryp="true"`;
      }
      if (question.calc) {
        xml += ` calc="true"`;
      }
    }
    break;
    case QuestionType.TEXT.name: {
      if (question.encryp) {
        xml += ` encryp="true"`;
      }
    }
    break;
    case QuestionType.DATETIME.name: xml += ` format="${question.format}"`;
    break;
    case QuestionType.MULTIPLE.name:
    case QuestionType.SORT.name: {
      if (question.min != 0) {
        xml += ` min="${question.min}"`;
      }
      if (question.max != 0) {
        xml += ` max="${question.max}"`;
      }
    }
    break;
    case QuestionType.ASSIGNMENT.name: {
      if (question.valuetype) {
        xml += ` valuetype="${question.valuetype}"`;
      }
      if (question.calc) {
        question.itemlist.forEach(item => item.calc = true)
      }
    }
    break;
    case QuestionType.SCALE.name: {
      if (question.layout != 'drag') {
        xml += ` layout="${question.layout}"`;
      }
      xml += ` maxscale="${question.maxscale}"`;
      xml += ` minscale="${question.minscale}"`;
    }
    break;
    case QuestionType.PHOTO.name: {
      xml += ` source="${question.source}"`;
      xml += ` count="${question.count}"`;
      xml += ` quality="${question.quality}"`;
    }
    break;
    case QuestionType.LOCATION.name: xml += ` method="${question.method}"`;
    break;
    case QuestionType.SEARCH.name: {
      if (question.dynamic === true && question.searchdata) {
        xml += ` dynamic="true" search-data="${question.searchdata}"`;
      } else {
        xml += ` dynamic="false"`;
      }
    }
    break;
    case QuestionType.RECORDING.name: {
      xml += ` count="${question.count}"`;
      xml += ` quality="${question.quality}"`;
    }
    break;
    case QuestionType.MATRIX.name: {
      xml += ` matrixtype="${question.matrixtype}"`;
      if (question.order !== 'normal') {
        xml += ` order="${question.order}"`;
      }
      if (question.layout) {
        xml += ` layout="${question.layout}"`;
      }
      if (question.hscroll) {
        xml += ` hscroll="${question.hscroll}"`;
      }
    }
    break;
    case QuestionType.PROVCITY.name: {
      xml += ` hastown="${question.hastown}"`
    }
    break;
    case QuestionType.CASCADE.name: {
      if (question.layout) {
        xml += ` layout="verticle"`
      }
    }
    break;
  }

  if (QuestionnaireInfo.showid == 'false') {
    xml += ` showid="${QuestionnaireInfo.showid}"`
  }

  if (question.from == 'MatrixQuestion') {
    xml += ` required="${question.isAnswer}" isAnswer="${question.isAnswer}"`
  }

  if (question instanceof ListQuestion) {
    if (question.order != 'normal') {
      xml += ` order="${question.order}"`;
    }
    // if (question.showid == 'false') {
    //   xml += ` showid="${question.showid}"`;
    // }
    if (question.layout) {
      if (question.col) {
        xml += ` layout="horizental" col="${question.col}"`;
      } else {
        xml += ` layout="horizental" col="0"`;
      }
    }
    if (question.isHorizental) {
      xml += ` layout="horizental"`
    }
    if (question.isCascade) {
      xml += ` isCascade="${question.isCascade}"`;
      if (question.parent) {
        xml += ` parent="${question.parent}"`;
      }
    }
    if (question.options) {
      xml += ` options="${question.options}"`;
    }
    if (question.itemSource != "custom") {
      xml += ` itemSource="${question.itemSource}"`;
    }
  }
  if (question.value) {
    xml += ` value="${question.value}"`;
  }
  return xml;
}

function _getDescSurvml(question) {
  let xml = ``;

  if (QuestionnaireInfo.languages.length == 1) {
    xml += `<mindesc>${question.mindesc['zh']}</mindesc>\n`;
    xml += `<maxdesc>${question.maxdesc['zh']}</maxdesc>\n`;
  } else {
    xml += `<mindesc>\n`;
    for (let language of QuestionnaireInfo.languages) {
      xml += `<${language}>${question.title[language] || question.title['zh']}</${language}>\n`;
    }
    xml += `</mindesc>\n`;

    xml += `<maxdesc>\n`;
    for (let language of QuestionnaireInfo.languages) {
      xml += `<${language}>${question.title[language] || question.title['zh']}</${language}>\n`;
    }
    xml += `</maxdesc>\n`;
  }
  return xml;
}

function _getItemlistSurvml(question) {
  let itemList = question.itemlist;
  let xml = ``;

  for (let item of itemList) {
    if (_checkItemRepeat(question, item.guid, item.id)) {
      throw `问题${question.id}的选项${item.id}重复`;
    }

    xml += `<li ${_getItemAttrSurvml(item)}>`;

    if (QuestionnaireInfo.languages.length == 1) {
      xml += `${item.name['zh']}`;
    } else {
      for (let language of QuestionnaireInfo.languages) {
        xml += `\n<${language}>${item.name[language] || item.name['zh']}</${language}>`;
      }
      xml += `\n`;
    }
    xml += '</li>\n';
  }
  return xml;
}

function _getItemAttrSurvml(item) {
  var xml = ``;
  xml += `id="${item.id}"`;
  if (!item.visible) {
    xml += ` visible="${item.visible}"`;
  }
  if (!item.required) {
    xml += ` required="${item.required}"`;
  }
  if (item.resurl) {
    xml += ` resurl="${item.resurl}"`;
    xml += ` restype="${item.restype}"`;
  }
  if (item.group || item.group === 0) {
    item.group == '自定义' ? xml += ` group="${item.userDefinedGroup}"` : xml += ` group="${item.group}"`;
  }
  if (item.goto) {
    xml += ` goto="${item.goto}"`;
  }
  if (item.rightlabel) {
    xml += ` right-label="${item.rightlabel}"`;
  }
  if (item.hasinput && item.inputtype) {
    xml += ` hasinput="${item.hasinput}" input-type="${item.inputtype}" input-required="${item.inputrequired}"`;
    if (item.inputsize != 0) {
      xml += ` input-size="${item.inputsize}"`;
    }
    if (item.inputvalue) {
      xml += ` input-value="${item.inputvalue}"`;
    }
  }
  if (item.value || item.value === 0) {
    xml += ` value="${item.value}"`;
  }
  if (item.parentId) {
    xml += ` parentId="${item.parentId}"`;
  }
  if (item.score) {
    xml += ` score="${item.score}"`;
  }
  if (item.order) {
    xml += ` order="${item.order}"`;
  }
  if (item.calc) {
    xml += ` calc="${item.calc}"`;
  }
  return xml;
}

function _getMatrixRowsAndColsSurvml(question) {
  let xml = ``;
  let rows = question.rows;
  let cols = question.cols;
  let reg = /<[^>]+>/g;

  xml += `<rows>\n`;
  for (let row of rows) {
    if (_checkRowRepeat(question, row.guid, row.id)) {
      throw `矩阵题${question.id}中，行${row.id}重复`;
    }
    if (reg.test(row.name['zh'])) {
      xml += `<row id="${row.id}" name="${row.name['zh'].replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}">`;
    } else {
      xml += `<row id="${row.id}" name="${row.name['zh']}">`;
    }
    if (QuestionnaireInfo.languages.length > 1) {
      for (let language of QuestionnaireInfo.languages) {
        xml += `\n<${language}>${row.name[language] || row.name['zh']}</${language}>`;
      }
    }
    xml += '</row>\n';
  }
  xml += '</rows>\n';
  xml += `<cols>\n`;
  for (let colQuestion of cols) {
    if (Utils.checkObjectIdRepeatInList(cols, colQuestion.guid, colQuestion.id)) {
      throw `矩阵题${question.id}中，列${colQuestion.id}重复`;
    }

    xml += `<col ${_getQuestionAttrSurvml(colQuestion)}>\n`;

    xml += _getQuestionTitleSurvml(colQuestion);
    xml += `<control ${_getQuestionControlAttrSurvml(colQuestion)}>\n`;
    if (colQuestion instanceof ListQuestion) { // 带选项的题目
      xml += _getItemlistSurvml(colQuestion);
    }
    xml += `</control>\n`;
    xml += '</col>\n';
  }
  xml += '</cols>\n';

  return xml;
}

function _getQuestionValidationSurvml(question) {
  let xml = ``;
  let validation = question.validation;
  if (validation.length > 0) {
    xml += '<validation>\n';
    for (let validator of validation) {
      let test = `${validator.test}`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      if (test == 'pointnum') {
        test = `${test}(${validator.minNum}, ${validator.maxNum})`
      }
      xml += `<validator type="${validator.type}" test="${test}" message="${validator.message}"`;
      if (validator.skip_on_input) {
        xml += ` skip_on_input="${validator.skip_on_input}"`;
      }
      if (validator.force) {
        xml += ` force="${validator.force}"`;
      }
      xml += `/>\n`;
    }
    xml += '</validation>\n';
  }
  return xml;
}

function identityAfterFilter(question) {
  if (responseIdentity.split(',').indexOf(question.id) !== -1) {
    let query = {
      type: 'after',
      cdata: `function(env){\nenv.action("put-tag", {target: "${question.id}"});\n}`
    }
    let newAfterFilter = new Filter(query)
    
    let afterFilters = question.filters.filter(item => item.type == 'after')
    let isExist = afterFilters.some(filter => filter.cdata == query.cdata)
    if (!isExist) {
      question.filters.push(newAfterFilter)
    }
  }
}

function _getQuestionFiltersSurvml(question) {
  let xml = ``;
  let filters = question.filters;

  for (let filter of filters) {
    xml += `<${filter.type}>\n`;
    if (filter.cdata) {
      xml += `<![CDATA[${filter.cdata}]]>\n`;
    } else {
      let scriptList = filter.scripts;
      for (let script of scriptList) {
        if (script.objName == 'action') {
          xml += `${script.xmlContent}\n`;
        }
        if (script.objName == 'if') {
          xml += `<if test="${script.test.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}">\n`;
          let trueActions = script.trueActions;
          let falseActions = script.falseActions;
          if (trueActions.length > 0) {
            xml += '<true>\n';
            for (let action of trueActions) {
              xml += `${action.xmlContent}\n`;
            }
            xml += '</true>\n';
          }
          if (falseActions.length > 0) {
            xml += '<false>\n';
            for (let action of falseActions) {
              xml += `${action.xmlContent}\n`;
            }
            xml += '</false>\n';
          }
          xml += `</if>\n`;
        }
      }
    }
    xml += `</${filter.type}>\n`;
  }

  return xml;
}

function _getSectionsSurvml() {
  let xml = `<sections>\n`;
  if (SectionList.length > 0) {
    for (let section of SectionList) {
      xml += _getSectionSurvml(section);
    }
  } else {
    xml += `<section id="page1" begin="${QuestionList[0].id}" end="${QuestionList[QuestionList.length - 1].id}">\n`;
    xml += `<title>第1页</title>\n`;
    xml += `</section>\n`;
  }
  xml += `</sections>\n`;
  return xml;
}

function _getSectionSurvml(section) {
  let xml = ``;
  xml += `<section id="${section.id}" begin="${section.begin}" end="${section.end}">\n`;
  xml += _getSectionTitleSurvml(section);

  if (section.subsection) {
    xml += _getSectionSurvml(section.subsection);
  }

  xml += `</section>\n`;
  return xml;
}

function _getSectionTitleSurvml(section) {
  let xml = ``;
  if (QuestionnaireInfo.languages.length == 1) {
    xml += `<title>${section.title['zh']}</title>\n`;
  } else {
    xml += `<title>\n`;
    for (let language of QuestionnaireInfo.languages) {
      xml += `<${language}>${section.title[language] || section.title['zh']}</${language}>\n`;
    }
    xml += `</title>\n`;
  }

  return xml;
}

function _checkItemRepeat(question, guid, id) {
  for (let item of question.itemlist) {
    if (id == item.id && guid != item.guid) {
      return true;
    }
  }
  return false;
}

function _checkRowRepeat(question, guid, id) {
  for (let row of question.rows) {
    if (id == row.id && guid != row.guid) {
      return true;
    }
  }
  return false;
}

export {
  writeSurvml
};
