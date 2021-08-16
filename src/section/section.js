import * as Utils from '../tool/utils';

/**
 * section对象
 */
class Section {
    
    constructor(options = {}) {
      this.guid = options.guid || Utils.getGuid();    // js对象属性，不生成到xml中

      this.id = options.id || '';                    // section名称
      this.begin = options.begin || '';              // section从哪一题开始
      this.end = options.end || '';                  // section到哪一题结束
      this.title = options.title || {zh: ''}         // section标题
      this.subsection = options.subsection || null;  // 嵌套的子section
      this.type = options.type || 'section';
      this.content = options.content || [];           // section 对响应的内容
      this.isRepeat = options.isRepeat || false; // section是否需要循环
      this.repeatTimes = options.repeatTimes || ''; // section循环的次数
    }
    
}

export default Section;