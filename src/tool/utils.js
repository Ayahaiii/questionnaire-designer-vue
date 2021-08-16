/**
 * 获取指定位数的随机数
 * @param  {int} length
 */
function getRandomStr(length) {
  let s = [];
  let hexDigits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < length; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 62), 1);
  }
  return s.join("");
}

/**
 * 生成4位随机数
 */
function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

/**
 * 通过随机数和时间戳获取一个唯一的标识符
 */
function getGuid() {
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

/**
 * 根据id从指定列表中获取对象
 * @param  {Array} objList 指定要搜索的列表，可以是问题列表、选项列表、表格行列表、表格列列表
 * @param  {string} id 根据对象的id从数据列表中获取对象实例
 */
function getObjectFromListById(objList, id) {
  for (let obj of objList) {
    if (id == obj.id) {
      return obj;
    }
  }
}

/**
 * 滚动到选择器所在的位置
 * @param  {selector} 目标元素的父级元素选择器
 * @param  {selector} 目标元素选择器
 */
function gotoPosition(parentSelector, selector) {
  let top = $(selector).position().top;
  let scrollTop = $(parentSelector).scrollTop();
  $(parentSelector).animate({
    scrollTop: top + scrollTop
  }, 500);
}


/**
 * 如果str是空字符串就替换成replacement
 * @param {*} str 
 * @param {*} replacement 
 */
function ifBlank(str, replacement) {
  if (typeof str == 'string') {
    let tmp = str.replace(/(^\s*)|(\s*$)/g, '');
    if (!tmp) {
      return replacement;
    } else {
      return str;
    }
  } else {
    return '';
  }
}

/**
 * checking the id is repeated or not in some given list
 * @param  {[type]} objList      [description]
 * @param  {[type]} guid         [description]
 * @param  {[type]} id           [description]
 * @return {[type]}              [description]
 */
function checkObjectIdRepeatInList(objList, guid, id) {
  for (let obj of objList) {
    if (id == obj.id && guid != obj.guid) {
      return true;
    }
  }
  return false;
}


// 验证逻辑、验证表达式
function _validate_filter_expr(expr) {
  let S_NORMAL = 0;
  let S_ERR = -1;
  let S_REF_0 = 10;
  let S_REF_1 = 11;
  let i = -1;
  let state = S_NORMAL;
  let err = "";

  if (typeof expr !== 'string' || expr.length == 0) {
    return {
      valid: true,
      index: -1,
      err: ""
    }
  }

  for (i = 0; i < expr.length; ++i) {
    let c = expr[i];
    if (c === '#') {
      if (state !== S_NORMAL) {
        state = S_ERR;
        err = "变量引用格式错误"
      } else {
        state = S_REF_0;
      }
    } else if (c === '{') {
      if (state !== S_REF_0) {
        state = S_ERR;
        err = "变量引用格式错误"
      } else {
        state = S_REF_1;
      }
    } else if (c === '}') {
      if (state !== S_REF_1) {
        state = S_ERR;
        err = "结束符号}不匹配"
      } else {
        state = S_NORMAL;
      }
    } else if (c === '!' && i === 0 && expr[i + 1] === '(' && expr[expr.length - 1] === ')') {
      _validate_filter_expr(expr.slice(2, -1))
    } else if (c === '!' && i === 0 && expr[i + 1] === '(' && expr[expr.length - 1] !== ')') {
      state = S_ERR;
      err = "缺少结束符号')'"
    } else if (c === '=' || c === '!' || c === '>' || c === '<') {
      if (state === S_NORMAL) {
        if (i < expr.length - 1 && expr[i + 1] === '=') {
          ++i;
          continue;
        } else {
          state = S_ERR;
          err = "逻辑符号错误，请使用'=='和'!='和'>='和'<='"
        }
      }
    }
    if (state === S_REF_1) {
      if (!((c >= '0' && c <= '9') ||
          (c >= 'a' && c <= 'z') ||
          (c >= 'A' && c <= 'Z') ||
          c == '.' || c == '{')) {
        state = S_ERR;
        err = "变量标识符格式错误"
      }
    }
    if (state === S_ERR) {
      break;
    }
  }

  if (state === S_REF_1) {
    state = S_ERR;
    err = "缺少},变量引用未结束"
  }

  return {
    valid: state != S_ERR,
    index: i,
    err: err
  }
}

// 处理富文本复制的文本
function pasteTextHandle(content) {
  if (content == '' && !content) return ''
  let str = content
  str = str.replace(/<xml>[\s\S]*?<\/xml>/ig, '')
  str = str.replace(/<style>[\s\S]*?<\/style>/ig, '')
  str = str.replace(/<\/?[^>]*>/g, '')
  str = str.replace(/[ | ]*\n/g, '\n')
  str = str.replace(/&nbsp;/ig, '')
  return str
}


export {
  getRandomStr,
  getGuid,
  getObjectFromListById,
  gotoPosition,
  ifBlank,
  checkObjectIdRepeatInList,
  _validate_filter_expr,
  pasteTextHandle
};
