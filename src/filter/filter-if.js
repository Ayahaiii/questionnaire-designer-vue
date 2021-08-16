import FilterAction from './filter-action';

class FilterIF {

    constructor(options = {}) {
        this.test = options.test || '';// 条件表达式
        this.trueActions = parseActionList(options.trueActions) || []; // 条件表达式成立时执行的动作
        this.falseActions = parseActionList(options.falseActions) || [];
        
        this.objName = 'if';
        this.addFrom = options.addFrom || ''; // FilterIf来自可见依赖
    }
}

function parseActionList(arr = []) {
    let scriptList = [];
    
    for(let options of arr) {
        scriptList.push(new FilterAction(options));
    }

    return scriptList.length > 0 && scriptList;
}

export default FilterIF;