
/**
 * 验证器对象
 * <validator type="embedded|expression" test="embedded expression|expression" message="" />
 * 验证器分两种类型(type)，系统预定义(type="embedded")和用户自定义(type="expression")
 * 预定义的类型(test)包括scope(1,20), phone, email, post, mobile, idcard, dial
 * 
 */
import * as Utils from '../tool/utils';
class Validator {

    constructor(options = {}) {
        this.type = options.type || 'expression';
        this.guid = options.guid || Utils.getGuid(); // js对象属性，不生成到xml中

        this.test = options.test || ''; // 自定义验证器的条件表达式或者已定义的scope等
        this.message = options.message || ''; // 验证器要显示的信息
        this.force = options.force || false; // 验证器是否强制触发
        this.skip_on_input = options.skip_on_input || false;// 验证器是否强制触发

        this.scopeMin = options.scopeMin || 1;
        this.scopeMax = options.scopeMax || 1;
        this.minNum = options.minNum || 1; // 小数最小位数
        this.maxNum = options.maxNum || 1; // 小数最大位数
    }

}

export default Validator;