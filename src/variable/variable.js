/**
 * 变量对象
 */
class Variable {
    
    constructor(options = {}) {
        this.id = options.id || ''; // 变量名称
        this.type = options.type || 'int'; // 变量类型，默认为int，有int、float、string、boolean
        this.value = options.value || (options.value === 0 ? 0 : ''); // 变量的值
        this.readonly = options.readonly || false // 变量是否可编辑，默认为可编辑
    }
    
}

export default Variable;