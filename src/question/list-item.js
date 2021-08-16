import * as Utils from '../tool/utils';

/**
 *  列表选项
 */
class ListItem {

  constructor(options = {}) {

    this.id = options.id || (options.id === 0 ? 0 : '');
    this.guid = options.guid || Utils.getGuid(); // item在内存中的唯一标识符
    this.name = options.name || {
      zh: ""
    }; // 写成name属性
    this.rightlabel = options.rightlabel || ''; // 赋值题选项输入框右边的文字内容

    this.score = options.score || ""; // 选项分值
    this.resurl = options.resurl || "";
    this.restype = options.restype || "";
    this.goto = options.goto || ''; // 单选、多选选项选中时的跳转目标题号
    this.group = options.group || 0; // 多选题选项分组
    this.userDefinedGroup = options.userDefinedGroup || ''; // 自定义分组
    this.value = options.value || (options.value === 0 ? 0 : ''); // 选项的默认值

    this.visible = options.visible != null ? options.visible : true;
    this.required = options.required != null ? options.required : true; // 适用于赋值题
    // this.calc = options.calc != null ? options.calc : false; // 适用于赋值题
    this.enabled = options.enabled != null ? options.enabled : true;

    this.hasinput = options.hasinput != null ? options.hasinput : false; // 是否有输入项，默认为false，且赋值题没有输入项
    this.inputtype = options.inputtype || ""; // 输入项类型,string|int|float
    this.inputrequired = options.inputrequired != null ? options.inputrequired : false; // 输入项是否必填
    this.inputsize = options.inputsize || 0; // 输入项的长度限制
    this.inputvalue = options.inputvalue || ''; // 输入项的默认值

    this.parentId = options.parentId || ''; // 级联时，选项的所属组
    this.order = options.order || ''; // 多选题选项是否固定底部
    this.visibleDependent = options.visibleDependent || ''; // 可见依赖
  }

}

export default ListItem;
