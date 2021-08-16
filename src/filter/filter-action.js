/**
 * 逻辑要执行的动作
 * <setq|setquestion target="qid" attribute="enabled|visible|title|value" value="true|false|(expression)" />
 * 设置问题(target)属性(attribute)的值(value)，值可以是表达式(expression)
 * 
 * <setv|setvariable id="" value=""/> 
 * 设置变量(id)的值(value)
 * 
 * <setrow target="qid" row="rowid" attribute="enabled|visible|title" value="true|false|(expression)" />
 * 设置表格题(target)某一行(row)某个属性(attribute)的值(value)，值可以是表达式(expression)
 * 
 * <setoption target="qid" option="optionid" attribute="visible|title|enabled" col="rowid.colid" value="true|false|(expression)">
 * 设置带选项的题目(target)某一个选项(option)的某个属性(attribute)的值(value)，值可以是表达式(expression)
 * 设置多维表格题(target)某一个单元格(col)中某一个选项(option)的某个属性(attribute)的值(value)，值可以是表达式(expression)
 * 
 * <setlang value="zh" />
 * 设置问卷使用哪种语言(value)
 *
 * <repeat-once target="Q1" />
 * 指定某道题(target)循环提问一次
 *
 * <repeat target="Q1" param="3" />
 * 指定某道题(target)循环提问多少次(param)，其中param可以是整数或者数组
 * 
 * <goto target="" />
 * 跳转到指定的题目(target)
 *
 * <alert message="" />
 * 弹出提示信息(message)
 * 
 * <clear target="" row="" col=""/>
 * 重置某一道题(target)为未作答的状态
 * 重置多维表格题(target)某个单元格(row,col)为未作答的状态
 * 
 * <skip />
 * 跳过本题
 * 
 * <exit status="" />
 * 退出问卷，状态(status)为可选的自定义的退出说明
 * 
 */
class FilterAction {
    constructor(options = {}) {
        this.type = options.type || ''; // 动作类型，包括goto,skip,setv,setq,clear,exit等

        this.target = options.target || '';// 动作的目标，skip，exit不存在此项
        this.attribute = options.attribute || '';// 目标的属性
        this.value = (typeof options.value == 'boolean') ? options.value : (options.value ? options.value : (options.value === 0 ? 0 : ''));// 目标的属性的值
        this.id = options.id || '';// 设置变量时，变量的id
        this.option = options.option || '';// setoption动作专有
        this.row = options.row || '';// setrow动作专有
        this.col = options.col || '';// clear中清除特定列或者setoption中设置特定单元格
        this.status = options.status || '';// exit的status属性
        this.message = options.message || '';
        this.param = options.param || (options.param == 0 ? 0 : ''); // 循环逻辑的参数
        
        this.xmlContent = options.xmlContent || ''; // action生成的xml节点
        this.objName = 'action';
    }
}

export default FilterAction;