import * as Utils from '../tool/utils';

class MatrixRow {

    constructor(options = {}) {
        this.guid = options.guid || Utils.getGuid();
        this.id = options.id || '';
        this.name = options.name || {zh:''};
        this.script = options.script || '';

        this.enabled = options.enabled != null ? options.enabled : true; // 判断行问题是否可编辑
    }
    
}

export default MatrixRow;