// import { QuestionnaireInfo } from '../data/data-store';

import BaseQuestion from './base-question';
import ListItem from './list-item';

import Questionnaire from '../data/questionnaire-info';

class ListQuestion extends BaseQuestion {

    constructor(options = {}) {
        super(options);
        
        this.layout = options.layout || ""; // 选项布局属性，竖排或横排  vertical | horizental
        this.col = options.col || ""; // 水平显示一列多少个选项，可选值：2、3、4、5，默认值0，显示所有
        this.order = options.order || "normal";// 选项显示顺序，normal | random | reverse
        this.showid = options.showid != null ? options.showid : true; // 是否显示选项的id，true | false 
        this.itemlist = parseItemList(options.itemlist) || getDefaultItemList();

        this.itemSource = options.itemSource || 'custom'; // 选项定义方式，自定义 | 来自变量
        this.isCascade = options.isCascade || false ;// 是否级联
        this.options = options.options || ''; // 适用于选项来自变量
        this.parent = options.parent || '';  // 级联题目

        this.isBatchEdit = options.isBatchEdit || false; // 控制选项题是否批量编辑
        this.batchEditContent = options.batchEditContent || ''; // 批量编辑的内容
        this.isSupportVisible = options.isSupportVisible || false; // 是否支持可见依赖
    }

}

function parseItemList(arr = []) { 
    let itemList = [];
    for(let item of arr) {
        itemList.push(new ListItem(item));
    }
    return itemList.length > 0 && itemList;
}

function getDefaultItemList() {
    let itemList = [];
    itemList.push(new ListItem({
        id : "1",
        name : {zh: "选项1"}
    }));
    itemList.push(new ListItem({
        id : "2",
        name : {zh: "选项2"}
    }));
    itemList.push(new ListItem({
        id : "3",
        name : {zh: "选项3"}
    }));
    
    let languages = Questionnaire.state.QuestionnaireInfo.languages;
    for(let item of itemList){
        for(let language of languages) {
            item.name[language] = item.name['zh'];
        }
    }
    return itemList;
}

export default ListQuestion;