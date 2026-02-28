// 获取地址栏参数
const commonFun = {};
commonFun.GetQueryString = function (paramStr, name, isTrim) {
  if (!paramStr) {
    return;
  }
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
  const r = paramStr.match(reg);
  if (r != null) {
    if (isTrim) {
      decodeURIComponent(r[2]).replace(/^\s*|\s*$/g, "");
    }
    return decodeURIComponent(r[2])
  };
  return null;
};

// 格式化时间
commonFun.formatTodayDate = function (date) {
  const d = date ? new Date(date) : new Date();
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = d.getFullYear();

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;
  return {
    beginTime: `${[year, month, day].join('-')} ` + `00:00:00`,
    endTime: `${[year, month, day].join('-')} ` + `23:59:59`,
    today: [year, month, day].join('-'),
  };
};

// 格式化金额
commonFun.formatMoney = function (s, n) {
  if (s === '' || s == 'underfined') {
    return;
  }
  n = n > 0 && n <= 20 ? n : 4;
  s = `${parseFloat(`${s}`.replace(/[^\d\.-]/g, '')).toFixed(n)}`;
  const l = s.split('.')[0].split('').reverse();
  const r = s.split('.')[1];
  let t = '';
  for (let i = 0; i < l.length; i++) {
    t += l[i] + ((i + 1) % 3 == 0 && i + 1 != l.length ? ',' : '');
  }
  return `${t.split('').reverse().join('')}.${r}`;
};

// 转换金额不保留小数
commonFun.toMoney = function (num) {
  num = num.toFixed(2);
  num = parseFloat(num)
  num = num.toLocaleString();
  return num;
}

// 解析url
commonFun.urlParse = (query) => {
  const obj = {};
  const reg = /[?&][^?&]+=[^?&]+/g;
  const arr = query.match(reg);
  if (arr) {
    arr.forEach((item) => {
      const tempArr = item.substring(1).split('=');
      const key = decodeURIComponent(tempArr[0]);
      const val = decodeURIComponent(tempArr[1]);
      obj[key] = val;
    });
  }
  return obj;
};

// 去除前后空格
const removeSpace = function (e) {
  const { form } = this.props;
  const obj = {};
  const { value } = e.target;
  obj[e.target.id] = value.replace(/(^\s*)|(\s*$)/g, '');
  form.setFieldsValue(obj);
};

// 去除前后空格
const normSpace = function (e) {
  let { value } = e.target;
  value = value.replace(/(^\s*)|(\s*$)/g, '');
  return value;
};

// 限制输入数字
const normNumber = function (e) {
  let { value } = e.target;
  value = value.replace(/[\D]/g, '');
  return value;
};

// 限制输入2位小数
const normDecimalTwo = function (e) {
  let { value } = e.target;
  value = value.replace(/[^\d.]/g, '');
  value = value.replace(/^\./g, '');
  value = value.replace(/\.{2,}/g, '.');
  value = value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
  value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
  return value;
};

// 限制输入4位小数
const normDecimalFour = function (e) {
  let { value } = e.target;
  value = value.replace(/[^\d.]/g, '');
  value = value.replace(/^\./g, '');
  value = value.replace(/\.{2,}/g, '.');
  value = value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
  value = value.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/, '$1$2.$3');
  return value;
};

// 格式化
const formatCount = function (s) {
  if (!s || s == '' || s == 'underfined') {
    return 0;
  }
  s = `${parseFloat(`${s}`.replace(/[^\d\.-]/g, ''))}`;
  const l = s.split('.')[0].split('').reverse();
  let t = '';
  for (let i = 0; i < l.length; i++) {
    t += l[i] + ((i + 1) % 3 == 0 && i + 1 != l.length ? ',' : '');
  }
  return t.split('').reverse().join('');
};

// 计算
commonFun.calc = function (arg1, symbol, arg2) {
  switch (symbol) {
    case '+':
      return accAdd(arg1, arg2);
    case '-':
      return Subtr(arg1, arg2);
    case '*':
      return accMul(arg1, arg2);
    case '/':
      return accDiv(arg1, arg2);
  }
};

commonFun.format_number = function (srcNumber, n) {
  // n是要保留的位数
  let dstNumber = parseFloat(srcNumber);
  if (isNaN(dstNumber)) {
    return srcNumber;
  }
  if (dstNumber >= 0) {
    dstNumber = parseInt(dstNumber * Math.pow(10, n) + 0.5) / Math.pow(10, n); // 关键点
  } else {
    const tmpDstNumber = -dstNumber;
    dstNumber = -parseInt(tmpDstNumber * Math.pow(10, n) + 0.5) / Math.pow(10, n);
  }
  let dstStrNumber = dstNumber.toString();
  let dotIndex = dstStrNumber.indexOf('.');
  if (dotIndex < 0) {
    dotIndex = dstStrNumber.length;
    dstStrNumber += '.';
  }

  while (dstStrNumber.length <= dotIndex + n) {
    dstStrNumber += '0';
  }
  return dstStrNumber;
};

// 除法
function accDiv(arg1, arg2) {
  let t1 = 0;
  let t2 = 0;
  let r1;
  let r2;
  // eslint-disable-next-line no-empty
  try {
    t1 = arg1.toString().split('.')[1].length;
  } catch (e) { }
  // eslint-disable-next-line no-empty
  try {
    t2 = arg2.toString().split('.')[1].length;
  } catch (e) { }
  r1 = Number(arg1.toString().replace('.', ''));
  r2 = Number(arg2.toString().replace('.', ''));
  return accMul(r1 / r2, Math.pow(10, t2 - t1));
}

// 乘法
function accMul(arg1, arg2) {
  let m = 0;
  const s1 = arg1.toString();
  const s2 = arg2.toString();
  // eslint-disable-next-line no-empty
  try {
    m += s1.split('.')[1].length;
  } catch (e) { }
  // eslint-disable-next-line no-empty
  try {
    m += s2.split('.')[1].length;
  } catch (e) { }
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m);
}

// 加法
function accAdd(arg1, arg2) {
  let r1;
  let r2;
  let m;
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2));
  return (arg1 * m + arg2 * m) / m;
}

// 减法
function Subtr(arg1, arg2) {
  let r1;
  let r2;
  let m;
  let n;
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2));
  n = r1 >= r2 ? r1 : r2;
  return ((arg1 * m - arg2 * m) / m).toFixed(n);
}

export default commonFun;

function mergeRows(data, mergeRowKeys) {
  if (!(mergeRowKeys && mergeRowKeys.length)) return data;
  if (data.length == 0) return data;
  mergeRowKeys.forEach((fieldName, filterIndex) => {
    const fieldValueArr = mergeRowKeys
      .filter((value, i) => {
        return i < filterIndex;
      })
      .map((value) => {
        return {
          fieldName: value,
          value: data[0][value],
        };
      });
    var pauseIndex = 0;
    var value = data[0][fieldName];
    let rowSpan = 1;
    for (let i = 1; i < data.length; i++) {
      var condition = value != data[i][fieldName];
      fieldValueArr.forEach(function (item, idx) {
        condition = condition || item.value != data[i][item.fieldName];
        if (item.value != data[i][item.fieldName]) {
          item.value = data[i][item.fieldName];
        }
      });
      if (condition) {
        data[pauseIndex][`${fieldName}rowSpan`] = rowSpan;
        pauseIndex = i;
        value = data[i][fieldName];
        rowSpan = 1;
      } else {
        data[i][`${fieldName}rowSpan`] = 0;
        rowSpan++;
      }
      if (pauseIndex == data.length - 1) {
        data[data.length - 1][`${fieldName}rowSpan`] = rowSpan;
      } else {
        data[pauseIndex][`${fieldName}rowSpan`] = rowSpan;
      }
    }
  });
  return data;
}

const filterOption = (inputValue, option) => {
  try {
    const input = inputValue || '';
    const children = option.props.children || [];
    const str = typeof children === 'string' ? children : children.join('');
    if (str.toLowerCase().indexOf(input.toLowerCase()) > -1) {
      return true;
    }
    return false;
  } catch (error) {
    return true;
  }
};

function hasValue(v) {
  return v || v === 0 || v === false;
}

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

function genRowKey(record = {}) {
  return Object.entries(record)
    .map((kv) => `${kv[0]}=${kv[1]}`)
    .join('_');
}
function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var reg_rewrite = new RegExp('(^|/)' + name + '/([^/]*)(/|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  var q = window.location.pathname.substr(1).match(reg_rewrite);
  if (r != null) {
    return unescape(r[2]);
  } else if (q != null) {
    return unescape(q[2]);
  } else {
    return null;
  }
}

function changeURLParam(url, name, value) {
  if (typeof value === 'string') {
    value = value.toString().replace(/(^\s*)|(\s*$)/, ""); // 移除首尾空格
  }
  let url2;
  if (!value) { // remove
    let reg = eval('/(([\?|&])' + name + '=[^&]*)(&)?/i');
    let res = url.match(reg);
    if (res) {
      if (res[2] && res[2] === '?') { // before has ?
        if (res[3]) { // after has &
          url2 = url.replace(reg, '?');
        } else {
          url2 = url.replace(reg, '');
        }
      } else {
        url2 = url.replace(reg, '$3');
      }
    }
  } else {
    let reg = eval('/([\?|&]' + name + '=)[^&]*/i');
    if (url.match(reg)) { // edit
      url2 = url.replace(reg, '$1' + value);
    } else { // add
      let reg = /([?](\w+=?)?)[^&]*/i;
      let res = url.match(reg);
      url2 = url;
      if (res) {
        if (res[0] !== '?') {
          url2 += '&';
        }
      } else {
        url2 += '?';
      }
      url2 += name + '=' + value;
    }
  }
  return url2;
}
function changeURLStatic(name, value) {
  let url = changeURLParam(location.href, name, value); // 修改 URL 参数
  history.replaceState(null, null, url);  // 替换地址栏
}

export {
  removeSpace,
  normSpace,
  normNumber,
  normDecimalTwo,
  normDecimalFour,
  formatCount,
  filterOption,
  hasValue,
  isPromise,
  genRowKey,
  mergeRows,
  getQueryString,
  changeURLStatic,
};
