import axios from 'axios';
import * as Utils from '../tool/utils';
import LanguageType from '../constant/language-type'
import QuestionType from '../constant/question-type.js'
import ScaleQuestion from '../question/scale-question';
import Section from '../section/section';

import XLSX from 'xlsx'

import { URL_GET_QUESTIONNAIRE_PAGE_LIST } from '../constant/server-url'

axios.defaults.withCredentials=true;
let $axios = axios.create();
let qs = require('qs');

export default {
    state: {
        QuestionnaireInfo:{
            id: (new Date()).getTime(),
            title: '问卷标题',
            description: '问卷描述',
            metas: [
                {type:'theme',text:'orange'}  // 问卷风格,默认橙色系
            ],
            tag: '',
            responseIdentity: "",  // 答卷标识，由题目id组成的以逗号分隔的字符串
            languages: ['zh'],     // 问卷支持的语言
            currentLanguage: "zh", // 问卷当前所使用的语言
            originSurvml: "",      // 导入问卷时的原始xml内容
            // organizationId: "",    // 当前用户所在组织的ID
            questionnaireId: "",   // 已有问卷在服务器保存的id
            moduleId: "",
            projectId: null,
            // survmlUrl: "",         // 获取已有问卷内容的接口
            // saveurl: "",           // 问卷保存接口的url
            // epidataurl: "",        // 获取epidata解析后的字符串的路径
            // resuploadurl: "",      // 资源文件的上传路径
            // resremoveurl: "",      // 删除资源文件的路径
            periodicVal: 0,        // 是否有循环题目
            periodicPage: '',      // 需要循环的页
            periodicTimes: 1,      // 最大循环次数
            isShowProgress: 0,      // 是否显示进度条
            showid: 'true',         // 是否显示题号
            logoUrl: '',
            bgUrl: '',
            welcomeText: '',
            endText: ''
        },
        currentQuestionnaireInfo:{
            title: "",
            tag: "",
            responseIdentityArr: [], 
            periodicVal: 0,
            periodicPage: '',
            periodicTimes: 1,
            periodicPageList: [],
            isShowProgress: 0,
            showid: 'true',
            logoUrl: '',
            bgUrl: '',
            welcomeText: '',
            endText: ''
        },
        isScreenfull: false
    },
    mutations: {
        questionnaireEdit(state,data){
            state.currentQuestionnaireInfo.title = data.title;
            state.currentQuestionnaireInfo.tag = data.tag;
            state.currentQuestionnaireInfo.responseIdentityArr = data.responseIdentity.split(",");
            state.currentQuestionnaireInfo.periodicVal = data.periodicVal;
            state.currentQuestionnaireInfo.periodicPage = data.periodicPage;
            state.currentQuestionnaireInfo.periodicTimes = data.periodicTimes;
            state.currentQuestionnaireInfo.isShowProgress = data.isShowProgress;
            state.currentQuestionnaireInfo.showid = data.showid;
            state.currentQuestionnaireInfo.logoUrl = data.logoUrl;
            state.currentQuestionnaireInfo.bgUrl = data.bgUrl;
            state.currentQuestionnaireInfo.welcomeText = data.welcomeText;
            state.currentQuestionnaireInfo.endText = data.endText;
        },
        saveQuestionnaireEdit(state,newQuestionnaireInfo){
            state.QuestionnaireInfo.title = newQuestionnaireInfo.title;
            state.QuestionnaireInfo.tag = newQuestionnaireInfo.tag;
            state.QuestionnaireInfo.responseIdentity = newQuestionnaireInfo.responseIdentityArr.join(",");
            state.QuestionnaireInfo.periodicVal = newQuestionnaireInfo.periodicVal;
            state.QuestionnaireInfo.periodicPage = newQuestionnaireInfo.periodicPage;
            state.QuestionnaireInfo.periodicTimes = newQuestionnaireInfo.periodicTimes;
            state.QuestionnaireInfo.isShowProgress = newQuestionnaireInfo.isShowProgress;
            state.QuestionnaireInfo.showid = newQuestionnaireInfo.showid;
            state.QuestionnaireInfo.logoUrl = newQuestionnaireInfo.logoUrl;
            state.QuestionnaireInfo.bgUrl = newQuestionnaireInfo.bgUrl;
            state.QuestionnaireInfo.welcomeText = newQuestionnaireInfo.welcomeText;
            state.QuestionnaireInfo.endText = newQuestionnaireInfo.endText;

            let identityArr = newQuestionnaireInfo.responseIdentityArr;

        },

        /**
         * reset the data when import a new xml
         */
        resetData(state) {
            state.QuestionnaireInfo = {
                id: (new Date()).getTime(),
                title: '问卷标题',
                description: '问卷描述',
                metas: [
                    {type:'theme',text:'orange'}     // 问卷风格,默认橙色系
                ],
                tag: '问卷标签',
                responseIdentity: "",               // 答卷标识，由题目id组成的以逗号分隔的字符串
                languages: ['zh'],                  // 问卷支持的语言
                currentLanguage: "zh",              // 问卷当前所使用的语言
                originSurvml: '',                   // 导入问卷时的原始xml内容
                showid: 'true',
        
                initialurl: state.QuestionnaireInfo.initialurl || "",           // 获取问卷初始化的接口地址
                // organizationId: state.QuestionnaireInfo.organizationId || "",   // 组织id，通过initialurl获取
                questionnaireId: state.QuestionnaireInfo.questionnaireId || "", // 已有问卷在服务器保存的id，通过initialurl获取
                // exiturl: state.QuestionnaireInfo.exiturl || "",                 // 问卷退出的url，通过initialurl获取
                // survmlUrl: state.QuestionnaireInfo.saveurl || "",               // 获取已有问卷内容的接口
                // saveurl: state.QuestionnaireInfo.saveurl || "",                 // 问卷保存接口的url，通过initialurl获取
                // exporturl: state.QuestionnaireInfo.exporturl || "",             // 问卷导出xml的url，通过initialurl获取
                // pdfturl: state.QuestionnaireInfo.pdfturl || "",                 // 问卷导出pdf的url，通过initialurl获取
                // previewurl: state.QuestionnaireInfo.previewurl || "",           // 问卷预览的url，通过initialurl获取
                // epidataurl: state.QuestionnaireInfo.epidataurl || "",           // 获取epidata解析后的字符串的路径，通过initialurl获取
                // resuploadurl: state.QuestionnaireInfo.resuploadurl || "",       // 资源文件的上传路径，通过initialurl获取
                // resremoveurl: state.QuestionnaireInfo.resremoveurl || ""        // 删除资源文件的路径，通过initialurl获取
            };
        },
        
        /**
         * export the questionnaire content
         */
        exportLanguage(state,QuestionList) {
            let filename = "多语言问卷翻译.xlsx";
            let languageCodeSheetName = "语言编码对照表";
            let contentSheetName = "问卷内容";
            let indexKey = '编号';
            let languageCodeData = [
                ['编码', '语言']
            ]
            let contentData = []
            let titleRow = [indexKey]

            for (let code in LanguageType) {
                titleRow.push(code)
                languageCodeData.push([code, LanguageType[code]])
            }
            contentData.push(titleRow)

            // TODO format questionnaire content
            writeContentToData(contentData,QuestionList)

            let workbook = XLSX.utils.book_new()
            let languageCodeSheet = XLSX.utils.aoa_to_sheet(languageCodeData)
            let contentSheet = XLSX.utils.aoa_to_sheet(contentData)

            XLSX.utils.book_append_sheet(workbook, languageCodeSheet, languageCodeSheetName)
            XLSX.utils.book_append_sheet(workbook, contentSheet, contentSheetName)
            XLSX.writeFile(workbook, filename)
        },
         
        /**
         * import the translations of quesrionnaire
         */
        importLanguage(state,option) {
            let e = option.e
            let QuestionList = option.QuestionList
            let file = e.target.files[0];
            let reader = new FileReader();
            reader.onload = function (e) {
                let data = e.target.result;
                let workbook = XLSX.read(data, { type: 'binary' });
                let contentSheetName = workbook.SheetNames[1]
                let contentList = XLSX.utils.sheet_to_json(workbook.Sheets[contentSheetName])
                
                if (contentList.length > 0) {
                    processTranslation(contentList,state.QuestionnaireInfo,QuestionList);
                }

            };
            reader.readAsBinaryString(file);
            e.target.value = '';
        },

        /**
         * get questionnaire's page list
         */
        getPeriodicPageList(state,option) {
          $axios({
            method: 'post',
            url: URL_GET_QUESTIONNAIRE_PAGE_LIST,
            data: qs.stringify({
              questionnaireId: state.QuestionnaireInfo.questionnaireId
            })
          }).then((result) => {
            if (result.data.success) {
              state.currentQuestionnaireInfo.periodicPageList = result.data.data
            }
          })
        },

        /**
         * toggle full screen state
         */
        toggleScreenfull(state, option) {
          state.isScreenfull = option
        },

        setLogoUrl(state, option) {
            state.currentQuestionnaireInfo.logoUrl = option.url
        },

        setBgUrl(state, option) {
            state.currentQuestionnaireInfo.bgUrl = option.url
        }
    },
    actions: {
        questionnaireEdit({commit},QuestionnaireInfo){
            commit('toggleSelected','0');
            commit("questionnaireEdit",QuestionnaireInfo);
            commit('changeEditStatus',{openEditBox:true,questionEdit:false});
        },
        saveQuestionnaireEdit({commit, rootState, state},newQuestionnaireInfo){
            commit("saveQuestionnaireEdit",newQuestionnaireInfo);
            commit('changeEditStatus',{openEditBox:false,questionEdit:false});
        },
        resetData({commit}) {
            commit('resetData');
            commit('resetQuestionData')   // mutations of question module
        },
        exportLanguage({commit,rootState}) {
            commit('exportLanguage',rootState.QuestionInfoModule.QuestionList);
        },
        importLanguage({commit,rootState},e) {
            commit('importLanguage',{e:e,QuestionList:rootState.QuestionInfoModule.QuestionList});
            commit('changeEditStatus',{openEditBox:false,questionEdit:false});
        },
        getPeriodicPageList({commit, rootState}) {
          commit('getPeriodicPageList');
        },
        setLogoUrl({commit}, payload) {
            commit('setLogoUrl', payload)
        },
        setBgUrl({commit}, payload) {
            commit('setBgUrl', payload)
        }
    },
    getters: {

    }
}


/**
 * write content to a excel
 * @param {*} dataList       the content that to be writen in the excel
 * @param {*} QuestionList   the list that includes all the questions have been created
 */
function writeContentToData(dataList,QuestionList) {
        for (let question of QuestionList) {
        // prepare title and hint
        let titleRow = [`${question.id}.title`]
        let hintRow = [`${question.id}.hint`]
        for (let code in LanguageType) {
          if (!(question instanceof Section)) {
            titleRow.push(question.title[code])
            hintRow.push(question.hint[code])
          }
        }
        dataList.push(titleRow)
        dataList.push(hintRow)
    
        // prepare list question's option title
        if (question.type == QuestionType.SINGLE.name || question.type == QuestionType.DROPDOWN.name || question.type == QuestionType.MULTIPLE.name || 
            question.type == QuestionType.ASSIGNMENT.name || question.type == QuestionType.SORT.name) {
            let itemList = question.itemlist || [] // search question has no itemlist
            for (let item of itemList) {
                let rowContent = [`${question.id}.${item.id}.name`]
            for (let code in LanguageType) {
                rowContent.push(item.name[code])
            }
            dataList.push(rowContent)
            }
        }
    
        // prepare scale question's mindesc and maxdesc
        if(question instanceof ScaleQuestion) {
            let mindescRow = [`${question.id}.mindesc`];
            let maxdescRow = [`${question.id}.maxdesc`];
    
            for (let code in LanguageType) {
                mindescRow.push(question.mindesc[code])
                maxdescRow.push(question.maxdesc[code])
            }
            dataList.push(mindescRow)
            dataList.push(maxdescRow)
    
        }
    
        // prepare matrix question's row title and column title
        if (question.type == QuestionType.MATRIX.name || question.type == QuestionType.MATRIXSINGLE.name || question.type == QuestionType.MATRIXMULTIPLE.name) {
            let rowList = question.rows
            for (let row of rowList) {
                let rowContent = [`${question.id}.${row.id}.name`]
            for (let code in LanguageType) {
                rowContent.push(row.name[code])
            }
                dataList.push(rowContent)
            }
    
            let colList = question.cols
            for (let col of colList) {
                let rowContent = [`${question.id}.${col.id}.title`]
            for (let code in LanguageType) {
                rowContent.push(col.title[code])
            }
            dataList.push(rowContent)
    
            // prepare list question's option title
            if (col.itemlist) {
                let itemList = col.itemlist // search question has no itemlist
                for (let item of itemList) {
                    let rowContent = [`${question.id}.${col.id}.${item.id}.name`]
                for (let code in LanguageType) {
                    rowContent.push(item.name[code])
                }
                    dataList.push(rowContent)
                }
            }
            }
        }
    }
}


/**
 *  process the translation content
 *  @param {*} contentList   the translation content from the excel
 */
function processTranslation(contentList,QuestionnaireInfo,QuestionList) {
    let hasTranslation = {}; // 记录每一个语种是否有对应的翻译内容，格式样例：zh: true
    let indexRegExp = /(?:(.*?)\.)?(?:(.*?)\.)?(?:(.*?)\.)?(.*)/;

    for (let content of contentList) {
        let index = content["编号"] || ''
        let matchResult = index.match(indexRegExp)

        if (matchResult) {
            let qid = matchResult[1]               // 一定有值
            let itemOrRowOrColId = matchResult[2]  // 可能是undefined
            let colItemId = matchResult[3]         // 可能是undefined
            let optionName = matchResult[4]       // 一定有值
            let question = Utils.getObjectFromListById(QuestionList, qid)

            if (!question) {
                continue
            }
            if (!itemOrRowOrColId && !colItemId) { // title or hint
                for (let code in LanguageType) {
                    let optionValue = content[code] || '';
                    if (optionValue) {
                        question[optionName.trim()][code] = optionValue
                        hasTranslation[code] = true
                    }
                }
            } else if (!colItemId) { // item or row or col's title
                if (question.type == QuestionType.SINGLE.name || question.type == QuestionType.DROPDOWN.name || question.type == QuestionType.MULTIPLE.name || 
                    question.type == QuestionType.ASSIGNMENT.name || question.type == QuestionType.SORT.name) { // item's title
                    let item = Utils.getObjectFromListById(question.itemlist, itemOrRowOrColId)
                    if (!item) {
                        continue
                    }
                    for (let code in LanguageType) {
                        let optionValue = (content[code] || '').trim()
                        if (optionValue) {
                            item[optionName][code] = optionValue
                            hasTranslation[code] = true
                        }
                    }
                } else if (question.type == QuestionType.MATRIX.name || question.type == QuestionType.MATRIXSINGLE.name || question.type == QuestionType.MATRIXMULTIPLE.name) {
                    if (optionName == 'name') { // row's title
                        let row = Utils.getObjectFromListById(question.rows, itemOrRowOrColId)
                        if (!row) {
                        continue
                        }
                        for (let code in LanguageType) {
                        let optionValue = (content[code] || '').trim()
                        if (optionValue) {
                            row[optionName][code] = optionValue
                            hasTranslation[code] = true
                        }
                        }
                    }
                    if (optionName == 'title') { // col's title
                        let col = Utils.getObjectFromListById(question.cols, itemOrRowOrColId)
                        if (!col) {
                            continue
                        }
                        for (let code in LanguageType) {
                            let optionValue = (content[code] || '').trim()
                            if (optionValue) {
                                col[optionName][code] = optionValue
                                hasTranslation[code] = true
                            }
                        }
                    }
                }
            } else { // col item's title
                let col = Utils.getObjectFromListById(question.cols, itemOrRowOrColId)
                if (col && col.itemlist) {
                    let item = Utils.getObjectFromListById(col.itemlist, colItemId)
                    if (!item) {
                        continue
                    }
                    for (let code in LanguageType) {
                        let optionValue = (content[code] || '').trim()
                        if (optionValue) {
                            item[optionName][code] = optionValue
                            hasTranslation[code] = true
                        }
                    }
                }
            }
        }
    }

    QuestionnaireInfo.languages = []
    for (let code in hasTranslation) {
        if (code) {
            QuestionnaireInfo.languages.push(code)
        }
    }
    if (QuestionnaireInfo.languages.length == 0) {
        QuestionnaireInfo.languages.push('zh')
    }
    alert('翻译完成')
}
