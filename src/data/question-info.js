import QuestionType from '../constant/question-type.js'
import * as Utils from '../tool/utils';
import permission from '../permission';

import BaseQuestion from '../question/base-question';
import InfoQuestion from '../question/info-question';
import SingleSelectQuestion from '../question/single-select-question';
import DropdownQuestion from '../question/dropdown-select-question';
import MultiSelectQuestion from '../question/multi-select-question';
import TextQuestion from '../question/text-question';
import TextareaQuestion from '../question/textarea-question';
import IntegerQuestion from '../question/integer-question';
import FloatQuestion from '../question/float-question';
import DatetimeQuestion from '../question/datetime-question';
import AssignmentQuestion from '../question/assignment-question';
import SortQuestion from '../question/sort-question';
import ScaleQuestion from '../question/scale-question';
import MatrixQuestion from '../question/matrix-question';
import PhotoQuestion from '../question/photo-question';
import RecordingQuestion from '../question/recording-question';
import LocationQuestion from '../question/location-question';
import ProvCityQuestion from '../question/prov-city-question';
import CascadeQuestion from '../question/cascade-question';
import SearchQuestion from '../question/search-question';
import FileQuestion from '../question/file-question';
import SignatureQuestion from '../question/signature-question';

import ListItem from '../question/list-item.js';
import MatrixRow from '../question/matrix-row';
import ListQuestion from '../question/list-question';

import Filter from '../filter/filter';
import FilterIf from '../filter/filter-if';
import FilterAction from '../filter/filter-action';
import Validator from '../validator/validator';
import Section from '../section/section.js';

export default {
  createQuestion, // export to be using in survml-reader
  state: {
    QuestionList: [], // deposit questions
    FilterList: [], // deposit filters 
    ValidatorList: [], // deposit validations
    VariableList: [], // deposit variables
    SectionList: [], // deposit sections
    CatalogList: [], // questions are not in section
    currentQuestionInfo: null, // the editing question
    infoQuestionContent: '', // info question content
    currentOption: null, // the option of singleselect or multiselect question when insert option's resource
    addGuid: null
  },
  mutations: {
    /**
     * create a question object
     * @param  {JSON} options the attributes that included in the question,in witch the type is required
     */
    addQuestion(state, opt) {
      let languages = opt.languages;
      let role = opt.role;
      let option = opt.option;
      let newQuestionList = state.QuestionList.filter(question => question.type != 'section');

      let questionLimitNum = permission[role].question_num;
      let currentQuestionLength = newQuestionList.length;

      if (currentQuestionLength < questionLimitNum || questionLimitNum == null) {
        let question = createQuestion(option, newQuestionList, languages)
        state.addGuid = question.guid
        state.QuestionList.push(question);
        state.CatalogList.push(question);
      } else {
        alert(`您当前的权限最多只能添加${questionLimitNum}道题`)
      }
    },

    /**
     * reorder the questions in QuestionList
     */
    reorderQuestion(state) {
      if (state.SectionList.length > 0) {
        let newQuestionList = []
        // 重新设置分页标签的id和title,重置QuestionList
        state.SectionList = state.SectionList.filter(section => section.content.length != 0)
        state.SectionList.forEach(function (section, index) {
          section.begin = section.content[0].id;
          section.end = section.content[section.content.length - 1].id;

          newQuestionList.push(section);
          newQuestionList = newQuestionList.concat(section.content);
          newQuestionList.push(section);

        })
        if (newQuestionList.length > 0) {
          state.QuestionList = newQuestionList;
        }
        if (state.CatalogList.length > 0) {
          state.QuestionList = state.QuestionList.concat(state.CatalogList);
        }
      } else {
        state.QuestionList = state.CatalogList;
      }
    },

    /**
     * delete a question in QuestionList
     * @param {*} questionIndex  the index of the question in QuestionList
     */
    deleteQuestion(state, option) {
      let flag = option.flag;
      let sectionIndex = option.sectionIndex;
      let questionIndex = option.questionIndex;
      let question = option.question;
      let questionIndexInQuesList = state.QuestionList.findIndex(item => item.guid == question.guid);

      if (confirm(`确定要删除问题${option.question.id}吗？`)) {
        if (flag == 'section') {
          state.SectionList[sectionIndex].content.splice(questionIndex, 1);
          state.QuestionList.splice(questionIndexInQuesList, 1);
        } else {
          state.CatalogList.splice(questionIndex, 1);
          state.QuestionList.splice(questionIndexInQuesList, 1);
        }
      }
    },

    /**
     * copy a question in QuestionList
     * @param {Object} option  including the question to be copied and the index of the question
     */
    copyQuestion(state, option) {
      let flag = option.flag;
      let sectionIndex = option.sectionIndex;
      let questionIndex = option.questionIndex;
      let question = option.question;
      let questionIndexInQuesList = state.QuestionList.findIndex(item => item.guid == question.guid);
      let newQuestionList = state.QuestionList.filter(question => question.type != 'section');
      let newQuestion = copy(question, newQuestionList);

      state.addGuid = newQuestion.guid

      if (flag == 'section') {
        state.SectionList[sectionIndex].content.splice(questionIndex + 1, 0, newQuestion);
        state.QuestionList.splice(questionIndexInQuesList + 1, 0, newQuestion);
      } else {
        state.CatalogList.splice(questionIndex + 1, 0, newQuestion);
        state.QuestionList.splice(questionIndexInQuesList + 1, 0, newQuestion);
      }
    },

    /**
     * change question's type (matrix questions need special process)
     */
    changeQuestion(state, option) {
      let questionType = option.type;
      let languages = option.languages;
      let question = state.QuestionList.find(obj => obj.guid == state.currentQuestionInfo.guid);

      // when the question's type isn't matrix
      if (question.type != QuestionType.MATRIX.name && questionType != question.type) {
        let copyedQuestion = copy(question, state.QuestionList);
        copyedQuestion.type = questionType;
        copyedQuestion.guid = question.guid;
        copyedQuestion.id = state.currentQuestionInfo.id;
        state.currentQuestionInfo = formatQuestion(createQuestion(copyedQuestion, state.QuestionList, languages));
      }

      // when the question's type is matris and the matrixtype is dimensions
      if (question.type == QuestionType.MATRIX.name && question.matrixtype == 'dimensions' && questionType != question.type) {
        let copyedQuestion = copy(question, state.QuestionList);
        copyedQuestion.type = questionType;
        copyedQuestion.guid = question.guid;
        copyedQuestion.id = state.currentQuestionInfo.id;
        state.currentQuestionInfo = formatQuestion(createQuestion(copyedQuestion, state.QuestionList, languages));
      }

      // when the question's type is matrix and the col question is singleselect question
      if (question.type == QuestionType.MATRIX.name && question.matrixtype == 'singledimension' && question.cols[0].type == QuestionType.SINGLE.name && questionType != QuestionType.MATRIXSINGLE.name) {
        let copyedQuestion = copy(question, state.QuestionList);
        copyedQuestion.type = questionType;
        copyedQuestion.guid = question.guid;
        copyedQuestion.id = state.currentQuestionInfo.id;
        state.currentQuestionInfo = formatQuestion(createQuestion(copyedQuestion, state.QuestionList, languages));
      }

      // when the question's type is matrix and the col question is multiselect question
      if (question.type == QuestionType.MATRIX.name && question.matrixtype == 'singledimension' && question.cols[0].type == QuestionType.MULTIPLE.name && questionType != QuestionType.MATRIXMULTIPLE.name) {
        let copyedQuestion = copy(question, state.QuestionList);
        copyedQuestion.type = questionType;
        copyedQuestion.guid = question.guid;
        copyedQuestion.id = state.currentQuestionInfo.id;
        state.currentQuestionInfo = formatQuestion(createQuestion(copyedQuestion, state.QuestionList, languages));
      }
    },

    /**
     * select and edit a question
     */
    questionEdit(state, question) {
      Utils.gotoPosition('#questionnaire-block', `[data-question-guid="${question.guid}"]`);

      let clonedQuestion = cloneQuestion(question);
      state.currentQuestionInfo = formatQuestion(clonedQuestion);

      if (question instanceof InfoQuestion) {
        state.infoQuestionContent = state.currentQuestionInfo.content;
      }

      state.FilterList = getFilterList(question);
      state.ValidatorList = getValidatorList(question);
    },

    /**
     * save the editing content of the question
     */
    saveQuestionEdit(state, currentLanguage) {
      let questionIndex = state.QuestionList.findIndex(obj => obj.guid == state.currentQuestionInfo.guid);
      let question = unformatQuestion(state.currentQuestionInfo);

      let editorHintList = ['<p><br></p>', '<h1><br></h1>', '<h2><br></h2>', '<h3><br></h3>', '<h4><br></h4>', '<h5><br></h5>']
      if (editorHintList.indexOf(question.hint[currentLanguage]) !== -1) {
        question.hint[currentLanguage] = '';
      }

      if (question instanceof InfoQuestion) {
        question.content = state.infoQuestionContent;
        state.infoQuestionContent = '';
      }

      if (question instanceof ListQuestion) {
        question.itemlist = filterData(question.itemlist, currentLanguage);
        let beforeFilter = state.FilterList.filter(item => item.type == 'before')[0]
        // 支持可见依赖，将自定义的逻辑条件同步添加到前置逻辑中
        if (question.isSupportVisible) {
          let oldBeforeFilterScripts = beforeFilter ? beforeFilter.scripts : []
          let isConcat = true
          let itemList = question.itemlist
          let newFilter = new Filter({
            type: 'before'
          })
          itemList.forEach(item => {
            let idx;
            let oldTmpArr = [];
            let script = new FilterIf({ objName: 'if', test: item.visibleDependent, addFrom: 'visibleDependent'});
            let trueAction = {
              attribute: 'visible',
              objName: 'action',
              option: item.id,
              target: question.id,
              type: 'setoption',
              value: true,
              xmlContent: `<setoption target="${question.id}" option="${item.id}" attribute="visible" value="true" />`
            };
            let falseAction = {
              attribute: 'visible',
              objName: 'action',
              option: item.id,
              target: question.id,
              type: 'setoption',
              value: false,
              xmlContent: `<setoption target="${question.id}" option="${item.id}" attribute="visible" value="false" />`
            };
            script.trueActions.push(trueAction);
            script.falseActions.push(falseAction);

            // 判断当前的可见依赖是否已经存在前置逻辑中
            let sIndex = oldBeforeFilterScripts.findIndex(before => {
              if (before instanceof FilterIf && before.trueActions.length !== 0) {
                return before.trueActions[0].option == script.trueActions[0].option && before.trueActions[0].type == script.trueActions[0].type && before.trueActions[0].target == script.trueActions[0].target
              }
            })
            if (sIndex == -1 && script.test !== '') {
              newFilter.scripts.push(script)
            }

            state.FilterList.forEach((val, index) => {
              if (val.type == 'before') {
                idx = index;
              }
            })
            
            // 将原有的前置逻辑添加到新的逻辑中，将可见依赖中删除的条件从对应的逻辑中删除
            oldBeforeFilterScripts.forEach(oldItem => {
              let index
              let isDelete = false
              if (oldItem.addFrom == 'visibleDependent') {
                let oldIndex = itemList.findIndex(curItem => curItem.visibleDependent == oldItem.test)
                if (oldIndex == -1) {
                  isDelete = true
                }
              }

              if (oldItem.objName == 'action') {
                index = newFilter.scripts.findIndex(newItem => {
                  return oldItem.objName == newItem.objName && oldItem.xmlContent == newItem.xmlContent
                })
              } else if (oldItem.objName == 'if') {
                index = newFilter.scripts.findIndex(newItem => {
                  return oldItem.objName == newItem.objName && oldItem.test == newItem.test
                })
              }
              if (index == -1 && !isDelete) {
                oldTmpArr.push(oldItem)
              }
              
            })

            if (isConcat) {
              newFilter.scripts = oldTmpArr.concat(newFilter.scripts)
              isConcat = false
            }
            
            if (idx == undefined) {
              state.FilterList.push(newFilter)
            } else {
              state.FilterList[idx] = newFilter
            }
          })

        } else { // 不支持可见依赖，将选项原有的可依赖条件从对应的前置逻辑中删除
          if (state.FilterList.length != 0) {
            let itemList = state.currentQuestionInfo.itemlist
            let tmpArr = []
            if (beforeFilter) {
              beforeFilter.scripts.forEach((script, index) => {
                let scriptIndex = itemList.findIndex(item => {
                  if (script.trueActions && script.trueActions.length !== 0) {
                    return item.id == script.trueActions[0].option
                  }
                })
                if (scriptIndex == -1) {
                  tmpArr.push(script)
                }
              })
              beforeFilter.scripts = tmpArr
            }
          }
        }
      }

      if (question instanceof MatrixQuestion) {
        let newFilter = new Filter({
          type: 'before'
        })
        let idx;
        question.rows = filterData(question.rows, currentLanguage);
        question.rows.forEach(val => {
          if (val.script != '') {
            let script = new FilterIf({ objName: 'if', test: val.script })    
            newFilter.scripts.push(script)
          }
        })
        state.FilterList.forEach((val, index) => {
          if (val.type == 'before') {
            idx = index;
          }
        })

        if (idx == undefined) {
          state.FilterList.push(newFilter)
        } else {
          state.FilterList[idx] = newFilter
        }

        if (question.matrixtype == 'singledimension') {
          question.cols[0].itemlist = filterData(question.cols[0].itemlist, currentLanguage);
        }

        if (question.matrixtype == 'dimensions') {
          question.cols.forEach(function (colQuestion, index) {
            if (!colQuestion.id) {
              colQuestion.id = getNewIndexFromList(question.cols, index + 1, 'matrix');
            }
            if (colQuestion instanceof ListQuestion) {
              colQuestion.itemlist = filterData(colQuestion.itemlist, currentLanguage);
            }
          });
        }
      }

      if (question instanceof CascadeQuestion) {
        question.cdata = filterData(question.cdata, currentLanguage, 'cascade');
      }

      // save filters of the question
      question.filters = saveFilters(state.FilterList);
      state.FilterList = [];

      // save validators of the question
      question.validation = saveValidators(state.ValidatorList, state.currentQuestionInfo);
      state.ValidatorList = [];

      state.QuestionList.splice(questionIndex, 1, question);

      // 修改题号后，同步刷新目录
      state.SectionList.forEach(sectionItem => {
        sectionItem.content.forEach((question, index, arr) => {
          if (question.guid == state.currentQuestionInfo.guid) {
            sectionItem.content.splice(index, 1, state.currentQuestionInfo);
            if (index == 0) {
              sectionItem.begin = state.currentQuestionInfo.id;
            }
            if (index == arr.length - 1) {
              sectionItem.end = state.currentQuestionInfo.id;
            }
          }
        })
      });
      // questions are not in section
      state.CatalogList.forEach((question, index) => {
        if (question.guid == state.currentQuestionInfo.guid) {
          state.CatalogList.splice(index, 1, state.currentQuestionInfo);
        }
      })
    },

    /**
     * add a new option of list questions or matrix question (dimensions) when the col question 
     * is a list question(singleselect or multiselect question)
     */
    createOption(state, colQuestionIndex) {
      let item = new ListItem();
      if (state.currentQuestionInfo instanceof ListQuestion) {
        state.currentQuestionInfo.itemlist.push(item);
      }
      if (state.currentQuestionInfo instanceof MatrixQuestion && state.currentQuestionInfo.matrixtype == 'dimensions') {
        state.currentQuestionInfo.cols[colQuestionIndex].itemlist.push(item);
      }
    },

    /**
     * batch edit options of list questions or matrix question (dimensions) when the col question 
     * is a list question(singleselect or multiselect question)
     */
    createBatchOption(state, option) {
      let itemInTextArr = option.itemInTextArr;
      let colQuestionIndex = option.colQuestionIndex;
      let newItemList = [];
      let reg = /^(\[(.*?)\])?(.+)/;

      for (let itemInText of itemInTextArr) {
        if (reg.test(itemInText)) {
          let itemId = RegExp.$2;
          let itemName = RegExp.$3;
          let option = new ListItem({
            id: itemId,
            name: {
              zh: itemName
            }
          });
          newItemList.push(option);

        }
      }
      if (state.currentQuestionInfo instanceof ListQuestion) {
        state.currentQuestionInfo.itemlist = newItemList;
      }
      if (state.currentQuestionInfo instanceof MatrixQuestion && state.currentQuestionInfo.matrixtype == 'dimensions') {
        state.currentQuestionInfo.cols[colQuestionIndex].itemlist = newItemList;
      }
    },

    /**
     * delete a option of list questions or matrix question (dimensions) when the col question 
     * is a list question(singleselect or multiselect question)
     */
    deleteOption(state, option) {
      let itemIndex = option.optionIndex;
      let colQuestionIndex = option.questionIndex;
      if (state.currentQuestionInfo instanceof ListQuestion) {
        state.currentQuestionInfo.itemlist.splice(itemIndex, 1);
      }
      if (state.currentQuestionInfo instanceof MatrixQuestion && state.currentQuestionInfo.matrixtype == 'dimensions') {
        state.currentQuestionInfo.cols[colQuestionIndex].itemlist.splice(itemIndex, 1);
      }
    },

    /**
     * add a item of cascade question
     */
    addCasItem(state) {
      let itemId = state.currentQuestionInfo.cdata.length;
      let newItem = {
        id: itemId,
        title: '',
        options: ''
      };

      state.currentQuestionInfo.cdata.push(newItem);
    },

    /**
     * delete a item of cascade question
     */
    deleteCasItem(state, itemIndex) {
      state.currentQuestionInfo.cdata.splice(itemIndex, 1);
    },

    /**
     * add a new row of matrix question
     */
    createRow(state) {
      let row = new MatrixRow();
      state.currentQuestionInfo.rows.push(row)
    },

    /**
     * edit rows of matrix questions by batch
     */
    createBatchRow(state, rowInTextArr) {
      let newRowList = [];
      let reg = /^(\[(.*?)\])?(.+)/;

      for (let rowInText of rowInTextArr) {
        if (reg.test(rowInText)) {
          let rowId = RegExp.$2;
          let rowName = RegExp.$3;
          let row = new MatrixRow({
            id: rowId,
            name: {
              zh: rowName
            }
          });
          newRowList.push(row);
          state.currentQuestionInfo.rows = newRowList;
        }
      }
    },

    /**
     * delete a row of matrix quetion
     */
    deleteRow(state, rowIndex) {
      state.currentQuestionInfo.rows.splice(rowIndex, 1);
    },

    /**
     * add a new col of matrix question
     */
    createCol(state, options) {
      if (state.currentQuestionInfo.matrixtype == 'singledimension') {
        let item = new ListItem();
        state.currentQuestionInfo.cols[0].itemlist.push(item);
      }
      if (state.currentQuestionInfo.matrixtype == 'dimensions') {
        let type = options.type;
        let question = null;

        options.from = 'MatrixQuestion'

        switch (type) {
          case QuestionType.SINGLE.name: 
            question = new SingleSelectQuestion(options);
            break;
          case QuestionType.MULTIPLE.name:
            question = new MultiSelectQuestion(options);
            break;
          case QuestionType.DROPDOWN.name:
            question = new DropdownQuestion(options);
            break;
          case QuestionType.TEXT.name:
            question = new TextQuestion(options);
            break;
          case QuestionType.INTEGER.name:
            question = new IntegerQuestion(options);
            break;
          case QuestionType.FLOAT.name:
            question = new FloatQuestion(options);
            break;
        }
        state.currentQuestionInfo.cols.push(question)
      }
    },

    /**
     * batch edit cols of matrix questions（singledimension）
     */
    createBatchCol(state, itemInTextArr) {
      if (state.currentQuestionInfo.matrixtype == 'singledimension') {
        let newItemList = [];
        let reg = /^(\[(.*?)\])?(.+)/;

        for (let itemInText of itemInTextArr) {
          if (reg.test(itemInText)) {
            let itemId = RegExp.$2;
            let itemName = RegExp.$3;
            let option = new ListItem({
              id: itemId,
              name: {
                zh: itemName
              }
            });
            newItemList.push(option);
            state.currentQuestionInfo.cols[0].itemlist = newItemList;
          }
        }
      }
    },

    /**
     * delete a col of matrix question
     */
    deleteCol(state, itemIndex) {
      if (state.currentQuestionInfo.matrixtype == 'singledimension') {
        state.currentQuestionInfo.cols[0].itemlist.splice(itemIndex, 1)
      }
      if (state.currentQuestionInfo.matrixtype == 'dimensions') {
        state.currentQuestionInfo.cols.splice(itemIndex, 1)
      }
    },

    /**
     * add filters of the question
     */
    createFilter(state, filterType) {
      if (state.FilterList.length > 0) {
        state.FilterList.forEach(function (script, index) {
          if (Object.values(script).includes(filterType)) {
            let fiter = new FilterAction();
            state.FilterList[index].scripts.push(fiter);
          } else {
            let newFilter = new Filter({
              type: filterType
            });
            let script = new FilterAction();
            newFilter.scripts.push(script);
            state.FilterList.push(newFilter);
          }
        })
      } else {
        let newFilter = new Filter({
          type: filterType
        });
        let script = new FilterAction();
        newFilter.scripts.push(script);
        state.FilterList.push(newFilter);
      }
    },

    /**
     * reset the data of the question when import a new xml
     */
    resetQuestionData(state) {
      state.QuestionList = [];
      state.SectionList = [];
      state.VariableList = [];
      state.CatalogList = [];
    },

    /**
     * create a new section
     */
    addSection(state, languages) {
      if (state.CatalogList.length == 0) {
        alert('请先添加题目');
        return false;
      } else {
        let begin, end = '';
        let section = null;
        if (state.SectionList.length == 0) {
          begin = state.CatalogList[0].id;
          end = state.CatalogList[state.CatalogList.length - 1].id;
          let options = {
            begin: begin,
            end: end,
            content: state.CatalogList
          }
          section = createSection(state.SectionList, languages, options);
          state.CatalogList = [];
          begin = end = '';
        } else {
          if (state.CatalogList.length == 0) {
            alert('请先添加题目');
            return false;
          } else {
            begin = state.CatalogList[0].id;
            end = state.CatalogList[state.CatalogList.length - 1].id;
            let options = {
              begin: begin,
              end: end,
              content: state.CatalogList
            }
            section = createSection(state.SectionList, languages, options);
            state.CatalogList = [];
            begin = end = '';
          }
        }
        state.QuestionList.push(section);
        state.SectionList.push(section);
      }
    },

    /**
     * insert a new section when finishing creating question
     */
    insertSection(state, option) {
      let flag = option.flag;
      let sectionIndex = option.sectionIndex;
      let questionIndex = option.questionIndex;
      let question = option.question;
      let languages = option.languages;

      // the questions that are not in section
      if (flag == 'catalog') {
        let begin = state.CatalogList[0].id;
        let end = question.id;
        let beginIndexQuestionList = state.QuestionList.findIndex(item => item.id == begin);
        let indexInQuestionList = state.QuestionList.findIndex(item => item.id == question.id);
        let content = state.CatalogList.filter((item, index) => index <= questionIndex);
        let options = {
          begin: begin,
          end: end,
          content: content
        }
        let section = createSection(state.SectionList, languages, options);

        state.SectionList.push(section);
        state.QuestionList.splice(beginIndexQuestionList, 0, section);
        state.QuestionList.splice(indexInQuestionList + 2, 0, section);
        state.CatalogList = state.CatalogList.filter((item, index) => index > questionIndex);
      } else { // questions are already in section
        let contentList = state.SectionList[sectionIndex].content

        if (contentList.length == 1) {
          alert('只有一道题目不可再拆分');
          return false;
        }

        if (question.id == state.SectionList[sectionIndex].end) {
          alert('每页至少添加一道题');
          return false;
        }

        let begin = contentList[questionIndex + 1].id; // 双击那一题的下面一题的id，从这里开始分页
        let end = state.SectionList[sectionIndex].end; // 双击那一题的分页index的最后一题的id(题号),到这里结束
        let firstPart = contentList.filter((item, index) => index <= questionIndex); // 拆分后的上一页
        let latterPart = contentList.filter((item, index) => index > questionIndex); // 拆分后的下一页
        let option = {
          begin: begin,
          end: end,
          content: latterPart,
          id: `P${state.SectionList.length + 1}`,
          title: {
            zh: `第${state.SectionList.length + 1}页`
          }
        }

        let newSection = new Section(option);

        state.SectionList.splice(sectionIndex + 1, 0, newSection);
        state.SectionList[sectionIndex].end = question.id;
        state.SectionList[sectionIndex].content = firstPart;

        // refresh section id and title
        let idList = [];
        let isStop = false;
        state.QuestionList.forEach(function (question, qIndex) {
          state.SectionList.forEach(function (section, index) {
            if (section.id.search('P') !== -1) {
              section.id = `P${index + 1}`
              section.title['zh'] = `第${index + 1}页`
            }
            if (section.end == question.id) {
              idList.push({
                qid: question.id,
                section: section
              });
            }
            if (index == state.SectionList.length - 1) {
              isStop = true;
            }
          });
          if (isStop) {
            return false;
          }
        });

        // refresh section in question list
        state.QuestionList = state.QuestionList.filter(item => item.type != 'section');
        idList.forEach(function (item, index) {
          let beginIndex = state.QuestionList.findIndex(question => question.id == item.section.begin);
          let endIndex = state.QuestionList.findIndex(question => question.id == item.qid);
          state.QuestionList.splice(beginIndex, 0, item.section);
          state.QuestionList.splice(endIndex + 2, 0, item.section);
        });
      }
    },

    /**
     * delete a section 
     */
    deleteSection(state, option) {
      let index = option.index;
      let section = option.section;
      let currentLanguage = option.currentLanguage;

      if (index == 0) {
        alert('第一页不能删除')
      } else {
        if (confirm(`确定要删除分页“${section.title[currentLanguage] || section.title['zh']}”吗？`)) {
          // refresh section list
          let contentArr = state.SectionList[index - 1].content.concat(section.content);
          let begin = contentArr[0].id;
          let end = contentArr[contentArr.length - 1].id;

          // 将删除掉的分页内的题目放到上一页中
          state.SectionList[index - 1].content = contentArr;
          // 重新设置上一页分页的开始题号
          state.SectionList[index - 1].begin = begin;
          // 重新设置上一页分页的结束题号
          state.SectionList[index - 1].end = end;
          // 将删除的分页标签从分页list中移除
          state.SectionList.splice(index, 1);

          // refresh section id and title
          let idList = [];
          let isStop = false;
          state.QuestionList.forEach(function (question, qIndex) {
            state.SectionList.forEach(function (section, index) {
              if (section.id.search('P') !== -1) {
                section.id = `P${index+1}`;
                section.title['zh'] = `第${index+1}页`;
                if (section.end == question.id) {
                  idList.push({
                    qid: question.id,
                    section: section
                  });
                }
                if (index == state.SectionList.length - 1) {
                  isStop = true;
                }
              }
            });
            if (isStop) {
              return false;
            }
          });

          // refresh section in question list
          state.QuestionList = state.QuestionList.filter(item => item.type != 'section');
          idList.forEach(function (item, index) {
            let beginIndex = state.QuestionList.findIndex(question => question.id == item.section.begin);
            let endIndex = state.QuestionList.findIndex(question => question.id == item.qid);
            state.QuestionList.splice(beginIndex, 0, item.section);
            state.QuestionList.splice(endIndex + 2, 0, item.section);
          });
        }
      }
    },

    /**
     * insert a resource of the question or options of singleselect and multiselect question
     */
    insertResource(state, option) {
      let restype = option.restype;
      let resurl = option.resurl;

      if (state.currentQuestionInfo && !state.currentOption) {
        state.currentQuestionInfo.restype = restype;
        state.currentQuestionInfo.resurl = resurl;
      } else if (state.currentQuestionInfo && state.currentOption) {
        state.currentOption.restype = restype;
        state.currentOption.resurl = resurl;
        state.currentOption = null;
      }
    },

    /**
     * delete a resource of the question or options of singleselect and multiselect question
     */
    removeResource(state, option) {
      state.currentOption = option;
      if (state.currentQuestionInfo && !state.currentOption) {
        state.currentQuestionInfo.restype = '';
        state.currentQuestionInfo.resurl = '';
      } else if (state.currentQuestionInfo && state.currentOption) {
        state.currentOption.restype = '';
        state.currentOption.resurl = '';
        state.currentOption = null;
      }
    },

    /**
     * save variable
     */
    saveVariableList(state, option) {
      state.VariableList = option
    },

    /**
     * edit page name
     */
    saveEditPageName(state, option) {
      let sectionId = option.question.id
      let editSectionArr = state.QuestionList.filter(item => item.id == sectionId)
      editSectionArr.forEach(section => {
        section.name = option.pageName
      })
    }
  },
  actions: {
    addQuestion({
      commit,
      rootState
    }, options) {
      let languages = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.languages;
      let role = rootState.role
      commit('toggleSelected', '')
      commit('addQuestion', {
        option: options,
        languages: languages,
        role: role
      });
      commit('changeEditStatus', {
        openEditBox: false,
        questionEdit: false
      });
    },
    reorderQuestion({
      commit
    }) {
      commit('reorderQuestion');
    },
    deleteQuestion({
      commit
    }, option) {
      commit('deleteQuestion', option)
    },
    copyQuestion({
      commit
    }, option) {
      commit('copyQuestion', option)
    },
    changeQuestion({
      commit,
      rootState
    }, questionType) {
      let languages = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.languages;
      commit('changeQuestion', {
        type: questionType,
        languages: languages
      })
    },
    questionEdit({ commit }, option) {
      let question = option.question;
      if (question.type != 'section') {
        let tagName = option.e.target.tagName.toLowerCase();
        let tagArr = ['label', 'input', 'select', 'textarea', 'button', 'span', 'li'];
        // Do not edit when clicking on special elements.
        if (tagArr.indexOf(tagName) == -1) {
          commit('toggleSelected', question.id);
          commit('questionEdit', question);
          commit('changeEditStatus', {
            openEditBox: true,
            questionEdit: true
          });
        }
      }
    },
    saveQuestionEdit({
      commit,
      rootState
    }) {
      let currentLanguage = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.currentLanguage;
      commit('saveQuestionEdit', currentLanguage);
      commit('changeEditStatus', {
        openEditBox: false,
        questionEdit: false
      });
    },
    createOption({
      commit
    }, colQuestionIndex) {
      commit('createOption', colQuestionIndex);
    },
    createBatchOption({
      commit
    }, option) {
      commit('createBatchOption', option);
    },
    deleteOption({
      commit
    }, option) {
      commit('deleteOption', option);
    },
    addCasItem({
      commit
    }) {
      commit('addCasItem');
    },
    deleteCasItem({
      commit
    }, itemIndex) {
      commit('deleteCasItem', itemIndex);
    },
    createRow({
      commit
    }) {
      commit('createRow');
    },
    createBatchRow({
      commit
    }, rowInTextArr) {
      commit('createBatchRow', rowInTextArr);
    },
    deleteRow({
      commit
    }, rowIndex) {
      commit('deleteRow', rowIndex);
    },
    createCol({
      commit
    }, options) {
      commit('createCol', options)
    },
    createBatchCol({
      commit
    }, itemInTextArr) {
      commit('createBatchCol', itemInTextArr)
    },
    deleteCol({
      commit
    }, colIndex) {
      commit('deleteCol', colIndex)
    },
    createFilter({
      commit
    }, filterType) {
      commit('createFilter', filterType)
    },
    addSection({
      commit,
      rootState
    }) {
      let languages = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.languages;
      commit('addSection', languages);
    },
    insertSection({
      commit,
      rootState
    }, option) {
      let languages = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.languages;
      commit('insertSection', {
        ...option,
        languages
      });
    },
    deleteSection({
      commit,
      rootState
    }, option) {
      let currentLanguage = rootState.QuestionnaireInfoMoudle.QuestionnaireInfo.currentLanguage;
      commit('deleteSection', {
        ...option,
        currentLanguage
      });
    },
    insertResource({
      commit
    }, option) {
      commit('insertResource', option);
    },
    removeResource({
      commit
    }, option) {
      commit('removeResource', option);
    },
    saveVariableList({
      commit
    }, option) {
      commit('saveVariableList',option)
    },
    saveEditPageName({ commit }, option) {
      commit('saveEditPageName', option)
    }
  }
}


/**
 * create and return a question object
 * @param  {JSON} options  the attributes that included in the question,in witch the type is required
 * @param  {array} languages 
 */
function createQuestion(options, QuestionList, languages) {
  let type = options.type;
  let question = null;
  if (!options.id) {
    let id = _getNewQuestionId(QuestionList.length + 1, QuestionList);
    options.id = id;
  }
  switch (type) {
    case QuestionType.INFO.name:
      question = new InfoQuestion(options);
      break;
    case QuestionType.SINGLE.name:
      question = new SingleSelectQuestion(options);
      break;
    case QuestionType.DROPDOWN.name:
      question = new DropdownQuestion(options);
      break;
    case QuestionType.MULTIPLE.name:
      question = new MultiSelectQuestion(options);
      break;
    case QuestionType.TEXT.name:
      question = new TextQuestion(options);
      break;
    case QuestionType.TEXTAREA.name:
      question = new TextareaQuestion(options);
      break;
    case QuestionType.INTEGER.name:
      question = new IntegerQuestion(options);
      break;
    case QuestionType.FLOAT.name:
      question = new FloatQuestion(options);
      break;
    case QuestionType.DATETIME.name:
      question = new DatetimeQuestion(options);
      break;
    case QuestionType.ASSIGNMENT.name:
      question = new AssignmentQuestion(options);
      break;
    case QuestionType.SORT.name:
      question = new SortQuestion(options);
      break;
    case QuestionType.SCALE.name:
      question = new ScaleQuestion(options);
      break;
    case QuestionType.MATRIX.name:
      question = new MatrixQuestion(options);
      break;
    case QuestionType.MATRIXSINGLE.name:
      if (!options.title) {
        options.title = {
          zh: QuestionType.MATRIXSINGLE.desc
        }
      }
      options.matrixtype = 'singledimension';
      question = new MatrixQuestion(options);
      break;
    case QuestionType.MATRIXMULTIPLE.name:
      if (!options.title) {
        options.title = {
          zh: QuestionType.MATRIXMULTIPLE.desc
        }
      }
      options.cols = MatrixQuestion.getDefaultColQuestion(QuestionType.MULTIPLE.name);
      options.matrixtype = 'singledimension';
      question = new MatrixQuestion(options);
      break;
    case QuestionType.PHOTO.name:
      question = new PhotoQuestion(options);
      break;
    case QuestionType.LOCATION.name:
      question = new LocationQuestion(options);
      break;
    case QuestionType.PROVCITY.name:
      question = new ProvCityQuestion(options);
      break;
    case QuestionType.SEARCH.name:
      question = new SearchQuestion(options);
      break;
    case QuestionType.RECORDING.name:
      question = new RecordingQuestion(options);
      break;
    case QuestionType.CASCADE.name:
      question = new CascadeQuestion(options);
      break;
    case QuestionType.FILE.name:
      question = new FileQuestion(options);
      break;
    case QuestionType.SIGNATURE.name:
      question = new SignatureQuestion(options);
      break;
    default:
      throw `不支持的问题类型[type=${type}, id=${options.id}]`;
  }

  // if the questionnaire support multi language then initialize the content of other languages into Chinese
  for (let language of languages) {
    question.title[language] = question.title[language] || question.title['zh'];
  }
  return question;
}

/**
 * create a new section object
 * @param {JSON} [options={}] 
 */
function createSection(SectionList, languages, options = {}, ) {
  let index = getNewIndexFromList(SectionList, SectionList.length + 1);
  if (!options.id) {
    options.id = `P${index}`;
  }
  options['title'] = options['title'] || {
    zh: `第${index}页`
  };

  let section = new Section(options);

  // if the questionnaire support multi language then initialize the content of other languages into Chinese
  for (let language of languages) {
    section.title[language] = section.title[language] || section.title['zh'];
  }

  return section;
}


/**
 * create question id
 * @param index question index in given list
 */
function _getNewQuestionId(index, objList) {
  let id = `Q${index}`;
  if (checkObjectIdRepeatInList(objList, '', id)) {
    return _getNewQuestionId(++index, objList);
  } else {
    return id;
  }
}

/**
 * get new and non-repetitive index from given list
 * @param  {[type]} objList [description]
 * @param  {[type]} index   [description]
 * @return {[type]}         [description]
 */
function getNewIndexFromList(objList, index, type) {
  let newIndex = '';
  if (type == 'matrix') {
    newIndex = `c${index}`;
  } else {
    newIndex = index;
  }

  if (checkObjectIdRepeatInList(objList, '', newIndex)) {
    index += 1;
    return getNewIndexFromList(objList, index);
  } else {
    return newIndex;
  }
}

/**
 * checking the id is repeated or not in some given list
 * @param  {[type]} objList      [description]
 * @param  {[type]} guid         [description]
 * @param  {[type]} id           [description]
 * @return {[type]}              [description]
 */
function checkObjectIdRepeatInList(objList, guid, id) {
  for (let obj of objList) {
    if (id == obj.id && guid != obj.guid) {
      return true;
    }
  }
  return false;
}

/**
 * clone and return a question the same as previous one
 * @param {any} question 
 * @returns 
 */
function cloneQuestion(question) {
  let newQuestion = null;
  let jsonStr = JSON.stringify(question);
  let options = JSON.parse(jsonStr);
  switch (question.type) {
    case QuestionType.INFO.name:
      newQuestion = new InfoQuestion(options);
      break;
    case QuestionType.SINGLE.name:
      newQuestion = new SingleSelectQuestion(options);
      break;
    case QuestionType.DROPDOWN.name:
      newQuestion = new DropdownQuestion(options);
      break;
    case QuestionType.MULTIPLE.name:
      newQuestion = new MultiSelectQuestion(options);
      break;
    case QuestionType.INTEGER.name:
      newQuestion = new IntegerQuestion(options);
      break;
    case QuestionType.FLOAT.name:
      newQuestion = new FloatQuestion(options);
      break;
    case QuestionType.TEXT.name:
      newQuestion = new TextQuestion(options);
      break;
    case QuestionType.TEXTAREA.name:
      newQuestion = new TextareaQuestion(options);
      break;
    case QuestionType.DATETIME.name:
      newQuestion = new DatetimeQuestion(options);
      break;
    case QuestionType.ASSIGNMENT.name:
      newQuestion = new AssignmentQuestion(options);
      break;
    case QuestionType.SORT.name:
      newQuestion = new SortQuestion(options);
      break;
    case QuestionType.SCALE.name:
      newQuestion = new ScaleQuestion(options);
      break;
    case QuestionType.MATRIX.name:
      newQuestion = new MatrixQuestion(options);
      break;
    case QuestionType.PHOTO.name:
      newQuestion = new PhotoQuestion(options);
      break;
    case QuestionType.LOCATION.name:
      newQuestion = new LocationQuestion(options);
      break;
    case QuestionType.PROVCITY.name:
      newQuestion = new ProvCityQuestion(options);
      break;
    case QuestionType.SEARCH.name:
      newQuestion = new SearchQuestion(options);
      break;
    case QuestionType.RECORDING.name:
      newQuestion = new RecordingQuestion(options);
      break;
    case QuestionType.CASCADE.name:
      newQuestion = new CascadeQuestion(options);
      break;
    case QuestionType.FILE.name:
      newQuestion = new FileQuestion(options);
    default:
      newQuestion = new BaseQuestion(options);
      break;
  }
  return newQuestion;
}

/**
 * deeply copy a question and return a new question
 * @param  {Question} question         the question to be copied
 * @param  {QuestionList} QuestionList
 */
function copy(question, QuestionList) {
  let newQuestion = null;
  let jsonStr = JSON.stringify(question);
  let options = JSON.parse(jsonStr);

  switch (question.type) {
    case QuestionType.INFO.name:
      newQuestion = new InfoQuestion(options);
      break;
    case QuestionType.SINGLE.name:
      newQuestion = new SingleSelectQuestion(options);
      break;
    case QuestionType.DROPDOWN.name:
      newQuestion = new DropdownQuestion(options);
      break;
    case QuestionType.MULTIPLE.name:
      newQuestion = new MultiSelectQuestion(options);
      break;
    case QuestionType.INTEGER.name:
      newQuestion = new IntegerQuestion(options);
      break;
    case QuestionType.FLOAT.name:
      newQuestion = new FloatQuestion(options);
      break;
    case QuestionType.TEXT.name:
      newQuestion = new TextQuestion(options);
      break;
    case QuestionType.TEXTAREA.name:
      newQuestion = new TextareaQuestion(options);
      break;
    case QuestionType.DATETIME.name:
      newQuestion = new DatetimeQuestion(options);
      break;
    case QuestionType.ASSIGNMENT.name:
      newQuestion = new AssignmentQuestion(options);
      break;
    case QuestionType.SORT.name:
      newQuestion = new SortQuestion(options);
      break;
    case QuestionType.SCALE.name:
      newQuestion = new ScaleQuestion(options);
      break;
    case QuestionType.MATRIX.name:
      newQuestion = new MatrixQuestion(options);
      break;
    case QuestionType.PHOTO.name:
      newQuestion = new PhotoQuestion(options);
      break;
    case QuestionType.LOCATION.name:
      newQuestion = new LocationQuestion(options);
      break;
    case QuestionType.PROVCITY.name:
      newQuestion = new ProvCityQuestion(options);
      break;
    case QuestionType.SEARCH.name:
      newQuestion = new SearchQuestion(options);
      break;
    case QuestionType.RECORDING.name:
      newQuestion = new RecordingQuestion(options);
      break;
    case QuestionType.CASCADE.name:
      newQuestion = new CascadeQuestion(options);
      break;
    case QuestionType.FILE.name:
      newQuestion = new FileQuestion(options);
    default:
      newQuestion = new BaseQuestion(options);
      break;
  }

  // In order to ensure the id and guid are unique, they must be rewrited
  newQuestion.id = _getNewQuestionId(QuestionList.length + 1, QuestionList);
  newQuestion.guid = Utils.getGuid();
  return newQuestion;
}

/**
 * handle the special attributes of the question
 * *@param  {object} question 
 */
function formatQuestion(question) {
  let newQuestion = question;

  newQuestion.visible = !newQuestion.visible;
  newQuestion.needaudio = !newQuestion.needaudio;

  if (newQuestion.type == 'singleselect' || newQuestion.type == 'multiselect') {
    if (newQuestion.showid == true) {
      newQuestion.showid = "true";
    } else if (newQuestion.showid == false) {
      newQuestion.showid = "false";
    }
  }
  return newQuestion;
}

function unformatQuestion(question) {
  let newQuestion = question;

  newQuestion.visible = !newQuestion.visible;
  newQuestion.needaudio = !newQuestion.needaudio;

  if (newQuestion.type == 'singleselect' || newQuestion.type == 'multiselect') {
    if (newQuestion.showid == "true") {
      newQuestion.showid = true;
    } else if (newQuestion.showid == "false") {
      newQuestion.showid = false;
    }
    newQuestion.itemlist.forEach(item => {
      if (item.inputtype !== '') {
        item.hasinput = true
      }
    })
  }
  return newQuestion;
}

/**
 * remove null data of qustion
 */
function filterData(list, currentLanguage, type) {
  let newList = [];

  list.forEach(function (item, index) {
    if (type == 'cascade') {
      if (item.title && item.options) {
        newList.push(item)
      }
    } else {
      if (item.name[currentLanguage] || item.name['zh']) {
        if (!item.id) {
          item.id = getNewIndexFromList(list, index + 1);
        }
        newList.push(item);
      }
    }

  })
  if (newList.length > 0) {
    return newList;
  }
}

/** 
 * get filters
 */
function getFilterList(question) {
  let filters = [];
  for (let filter of question.filters) {
    let cloneFilter = new Filter(filter);
    for (let script of cloneFilter.scripts) {
      if (script.objName == 'action') {
        if (script.value === true) {
          script.value = "true"
        }
        if (script.value === false) {
          script.value = "false"
        }
      } else if (script.objName == 'if') {
        for (let action of script.falseActions) {
          if (action.value === true) {
            action.value = "true"
          }
          if (action.value === false) {
            action.value = "false"
          }
        }
        for (let action of script.trueActions) {
          if (action.value === true) {
            action.value = "true"
          }
          if (action.value === false) {
            action.value = "false"
          }
        }
      }
    }
    filters.push(cloneFilter);
  }
  return filters;
}

/** 
 * get validators
 * @param  {object} question
 */
function getValidatorList(question) {
  let validators = []
  for (let validator of question.validation) {
    let newValidator = new Validator(validator);
    if (validator.type == 'embedded' && validator.test.indexOf('scope') != -1) {
      let reg = /^scope\((-?\d+),\s*(-?\d+)\)$/;
      let match = reg.test(validator.test);
      let scopeMin = RegExp.$1;
      let scopeMax = RegExp.$2;

      newValidator.scopeMin = Number(scopeMin);
      newValidator.scopeMax = Number(scopeMax);
      newValidator.test = 'scope';

    } else if (validator.type == 'embedded' && validator.test.indexOf('pointnum') != -1) {
      let reg = /^pointnum\((-?\d+),\s*(-?\d+)\)$/;
      let match = reg.test(validator.test);
      let minNum = RegExp.$1;
      let maxNum = RegExp.$2;

      newValidator.minNum = Number(minNum);
      newValidator.maxNum = Number(maxNum);
      newValidator.test = 'pointnum';
    }
    validators.push(newValidator);
  }
  return validators;
}

/**
 * save filters
 * @param {array} FilterList 
 */
function saveFilters(FilterList) {
  let newFilterList = FilterList;
  newFilterList.forEach(function (filter, index) {
    if (filter.scripts.length > 0) {
      for (let script of filter.scripts) {
        if (script.objName == "action") {
          if (script.value == "true") {
            script.value = true;
          }
          if (script.value == "false") {
            script.value = false;
          }
          script.xmlContent = createXmlContent(script, 'action');
        }

        if (script.objName == "if") {
          for (let action of script.trueActions) {
            if (action.value == "true") {
              action.value = true;
            }
            if (action.value == "false") {
              action.value = false;
            }
            action.xmlContent = createXmlContent(action, 'if');
          }
          for (let action of script.falseActions) {
            if (action.value == "true") {
              action.value = true;
            }
            if (action.value == "false") {
              action.value = false;
            }
            action.xmlContent = createXmlContent(action, 'if');
          }
        }

      }
    } else {
      if (!filter.cdata) {
        newFilterList.splice(index, 1);
      }
    }
  });
  return newFilterList;
}

/**
 * 
 * @param {array} qidArr 目标题号的id数组
 * @param {*object} newAction 
 * @param {*string} type 
 */
let getRangQuestionList = (qidArr, newAction, type, conditionType) => {
  let curId = this.a.state.currentQuestionInfo.id;
  qidArr.forEach((qid, index, arr) => {
    let tmpQid = qid.split(':');
    if (tmpQid.length == 2) { // 范围选择
      let questionList = this.a.state.QuestionList
      let beignQidIndex = questionList.findIndex(item => item.id == tmpQid[0]); // 开始题号
      let endQidIndex = questionList.findIndex(item => item.id == tmpQid[1]); // 结束题号
      let rangQuestionList = questionList.slice(beignQidIndex, endQidIndex + 1); // 开始题号与结束题号之间的问题
      rangQuestionList.forEach((item, rangIndex, rangArr) => {
        if (item.id != curId && !(item instanceof Section)) {
          switch (type) {
            case 'setq': {
              if (rangIndex != rangArr.length - 1 || index != arr.length - 1) {
                newAction.xmlContent += `<setq target="${item.id}" attribute="${newAction.attribute}" value="${newAction.value}"/>\n`;
              } else {
                newAction.xmlContent += `<setq target="${item.id}" attribute="${newAction.attribute}" value="${newAction.value}"/>`;
              }
            }
            break;
            case 'setoption': {
              if (rangIndex != rangArr.length - 1 || index != arr.length - 1) {
                newAction.xmlContent += `<setoption target="${item.id}" ${newAction.col ? `col="${newAction.col}"` : ''} option="${newAction.option}" attribute="${newAction.attribute}" value="${newAction.value}"/>\n`;
              } else {
                newAction.xmlContent += `<setoption target="${item.id}" ${newAction.col ? `col="${newAction.col}"` : ''} option="${newAction.option}" attribute="${newAction.attribute}" value="${newAction.value}"/>`;
              }
            }
            break;
            case 'setrow': {
              if (rangIndex != rangArr.length - 1 || index != arr.length - 1) {
                newAction.xmlContent += `<setrow target="${item.id}" row="${newAction.row}" attribute="${newAction.attribute}" value="${newAction.value}"/>\n`;
              } else {
                newAction.xmlContent += `<setrow target="${item.id}" row="${newAction.row}" attribute="${newAction.attribute}" value="${newAction.value}"/>`;
              }
            }
            break;
            case 'repeat-once': {
              if (rangIndex != rangArr.length - 1 || index != arr.length - 1) {
                newAction.xmlContent += `<repeat-once target="${item.id}"/>\n`;
              } else {
                newAction.xmlContent += `<repeat-once target="${item.id}"/>`;
              }
            }
            break;
            case 'repeat': {
              if (rangIndex != rangArr.length - 1 || index != arr.length - 1) {
                newAction.xmlContent += `<repeat target="${item.id}" param="${newAction.param}"/>\n`;
              } else {
                newAction.xmlContent += `<repeat target="${item.id}" param="${newAction.param}"/>`;
              }
            }
            break;
            case 'goto': {
              if (rangIndex != rangArr.length - 1 || index != arr.length - 1) {
                newAction.xmlContent += `<goto target="${item.id}"/>\n`;
              } else {
                newAction.xmlContent += `<goto target="${item.id}"/>`;
              }
            }
            break;
            case 'clear': {
              if (rangIndex != rangArr.length - 1 || index != arr.length - 1) {
                newAction.xmlContent += `<clear target="${item.id}" ${newAction.row ? `row="${newAction.row}"` : ''} ${newAction.col ? `col="${newAction.col}"` : ''}/>\n`;
              } else {
                newAction.xmlContent += `<clear target="${item.id}" ${newAction.row ? `row="${newAction.row}"` : ''} ${newAction.col ? `col="${newAction.col}"` : ''}/>`;
              }
            }
            break;
          }
        }
      })
    } else if (tmpQid.length == 1) {
      if (conditionType == 'action' || conditionType == 'if') {
        switch (type) {
          case 'setq': {
            if (index == arr.length - 1) {
              newAction.xmlContent += `<setq target="${tmpQid[0]}" attribute="${newAction.attribute}" value="${newAction.value}"/>`;
            } else {
              newAction.xmlContent += `<setq target="${tmpQid[0]}" attribute="${newAction.attribute}" value="${newAction.value}"/>\n`;
            }
          }
          break;
          case 'setoption': {
            if (index == arr.length - 1) {
              newAction.xmlContent += `<setoption target="${tmpQid[0]}" ${newAction.col ? `col="${newAction.col}"` : ''} option="${newAction.option}" attribute="${newAction.attribute}" value="${newAction.value}"/>`;
            } else {
              newAction.xmlContent += `<setoption target="${tmpQid[0]}" ${newAction.col ? `col="${newAction.col}"` : ''} option="${newAction.option}" attribute="${newAction.attribute}" value="${newAction.value}"/>\n`;
            }
          }
          break;
          case 'setrow': {
            if (index == arr.length - 1) {
              newAction.xmlContent += `<setrow target="${tmpQid[0]}" row="${newAction.row}" attribute="${newAction.attribute}" value="${newAction.value}"/>`;
            } else {
              newAction.xmlContent += `<setrow target="${tmpQid[0]}" row="${newAction.row}" attribute="${newAction.attribute}" value="${newAction.value}"/>\n`;
            }
          }
          break;
          case 'repeat-once': {
            if (index == arr.length - 1) {
              newAction.xmlContent += `<repeat-once target="${tmpQid[0]}"/>`;
            } else {
              newAction.xmlContent += `<repeat-once target="${tmpQid[0]}"/>\n`;
            }
          }
          break;
          case 'repeat': {
            if (index == arr.length - 1) {
              newAction.xmlContent += `<repeat target="${tmpQid[0]}" param="${newAction.param}"/>`;
            } else {
              newAction.xmlContent += `<repeat target="${tmpQid[0]}" param="${newAction.param}"/>\n`;
            }
          }
          break;
          case 'goto': {
            if (index == arr.length - 1) {
              newAction.xmlContent += `<goto target="${tmpQid[0]}"/>`;
            } else {
              newAction.xmlContent += `<goto target="${tmpQid[0]}"/>\n`;
            }
          }
          break;
          case 'clear': {
            if (index == arr.length - 1) {
              newAction.xmlContent += `<clear target="${tmpQid[0]}" ${newAction.row ? `row="${newAction.row}"` : ''} ${newAction.col ? `col="${newAction.col}"` : ''}/>`;
            } else {
              newAction.xmlContent += `<clear target="${tmpQid[0]}" ${newAction.row ? `row="${newAction.row}"` : ''} ${newAction.col ? `col="${newAction.col}"` : ''}/>\n`;
            }
          }
          break;
        }
      }
    }
  })
}

let createXmlContent = (option, conditionType) => {
  let newAction = option;
  let qidArr = newAction.target.split(',');
  newAction.xmlContent = '';
  switch (option.type) {
    case 'setq': getRangQuestionList(qidArr, newAction, 'setq', conditionType);
      break;
    case 'setoption': getRangQuestionList(qidArr, newAction, 'setoption', conditionType);
      break;
    case 'setrow': getRangQuestionList(qidArr, newAction, 'setrow', conditionType);
      break;
    case 'setlang':
      newAction.xmlContent = `<setlang value="${newAction.value}"/>`;
      break;
    case 'setv':
      newAction.xmlContent = `<setv id="${newAction.id}" value="${newAction.value}"/>`;
      break;
    case 'repeat-once': getRangQuestionList(qidArr, newAction, 'repeat-once', conditionType);
      break;
    case 'repeat': getRangQuestionList(qidArr, newAction, 'repeat', conditionType);
      break;
    case 'goto': getRangQuestionList(qidArr, newAction, 'goto', conditionType);
      break;
    case 'alert':
      newAction.xmlContent = `<alert message="${newAction.message}"/>`;
      break;
    case 'clear': getRangQuestionList(qidArr, newAction, 'clear', conditionType);
      break;
    case 'skip':
      break;
    case 'setexit':
      newAction.xmlContent = `<setexit status="${newAction.status}"/>`;
      break;
    case 'exit':
      newAction.xmlContent = `<exit ${newAction.status ? `status="${newAction.status}"` : ''}/>`;
      break;
  }
  return newAction.xmlContent;
}

/**
 * save validators
 * @param {array}  ValidatorList 
 * @param {object} question 
 */
function saveValidators(ValidatorList, question) {
  let newValidatorList = ValidatorList;
  for (let validator of newValidatorList) {
    if (question instanceof IntegerQuestion || question instanceof FloatQuestion) {
      if (validator.type == 'embedded') {
        validator.test == 'scope' ? validator.test = `scope(${validator.scopeMin},${validator.scopeMax})` : validator.test = `pointnum(${validator.minNum},${validator.maxNum})`;
      }
    }
  }
  return newValidatorList;
}
