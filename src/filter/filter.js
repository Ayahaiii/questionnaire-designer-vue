import FilterAction from './filter-action';
import FilterIF from './filter-if';

/**
 * 控制器对象
 */
class Filter {

    constructor(options = {}) {
        this.type = options.type || ''; // 控制器类型 before|middle|after
        this.cdata = options.cdata || ''; // 自定义书写js内容，不使用if表达式或者直接action
        this.scripts = parseScriptList(options.scripts) || [];// 控制器用到的脚本，包括IfTest和Action
    }
    
}

function parseScriptList(arr = []) {
    let scriptList = [];
    for(let options of arr) {
        if(options.objName == 'if') {
            scriptList.push(new FilterIF(options));
        } else if(options.objName == 'action') {
            scriptList.push(new FilterAction(options));
        }
    }
    
    return scriptList;
}

export default Filter;