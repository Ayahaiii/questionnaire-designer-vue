import Filter from '../filter/filter';
import Validator from '../validator/validator';
import * as Utils from '../tool/utils';

class BaseQuestion {

    constructor(options = {}) {
        this.type = options.type || ''; // 类型
        this.id = options.id || '';
        this.guid = options.guid || Utils.getGuid(); // js对象属性，不生成到xml中
        this.title = options.title || {zh: ''}; // 标题
        this.resurl = options.resurl || ''; // 资源文件路径
        this.restype = options.restype || ''; // 资源文件类型：img | voice | video
        this.hint = options.hint || {zh: ''}; // 提示
        this.hintHidden = options.hintHidden != null ? options.hintHidden : false; // 是否显示提示信息，默认显示
        this.varname = options.varname || '';  // 变量名
        this.vardesc = options.vardesc || '';  // 变量标签
        this.required = options.required != null ? options.required : true; // 是否必答，默认必答
        this.visible = options.visible != null ? options.visible : true; // 是否可见，默认可见
        this.needaudio = options.needaudio != null ? options.needaudio : true; // 是否需要录音，默认需要录音
        this.visibleTo = options.visibleTo || '0'; // 0.默认都可见；2.质检员可见、APP不可见、二维码不可见；3.质检员可见、APP可见、二维码不可见
        // this.showid = options.showid || 'true';

        this.value = options.value || (options.value === 0 ? 0 : ''); // 默认值
        this.skip = options.skip != null ? options.skip : false; // 是否跳过，默认不跳过
        this.enabled = options.enabled != null ? options.enabled : true; // 是否可作答，默认可作答
        
        this.validation = parseValidator(options.validation) || []; // 验证逻辑
        this.filters = parseFilters(options.filters) || []; // 前、中、后置逻辑
    }
}

function parseValidator(arr = []) {
    let validatorList = [];

    for(let options of arr) {
        validatorList.push(new Validator(options));
    }
    
    return validatorList.length > 0 && validatorList;
}

function parseFilters(arr = []) {
    let filterList = [];

    for(let options of arr) {
        filterList.push(new Filter(options));
    }
    
    return filterList.length > 0 && filterList;
}

export default BaseQuestion;