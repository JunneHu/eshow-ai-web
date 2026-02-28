
import moment from 'moment';
import { ButtonsAuth } from './types';

/*
一二级页面使用,能获取 window.getAuthButtons()
hasButtonsAuth('lr-statement')

getButtonsAuthStr:一二级页面使用,获取权限并带入三级页面路由,能获取 window.getAuthButtons()
history.push(`/invoice/billdetail/${record.merchantID}?getButtonsAuthStr=${getButtonsAuthStr()}`);

三级页面使用,不能获取 window.getAuthButtons()
const [btnAuthList, setBtnAuthList] = useState(getURLParams()?.getButtonsAuthStr?.split(',') || '');
hasButtonsAuth('lr-make-invoice', btnAuthList, true)

*/

// 判断是否有当前权限
export const hasButtonsAuth = (params: {
  enCode: string;
  authList?: ButtonsAuth[];
  format?: boolean;
  formatList?: string[];
}): boolean => {
  // console.log('hasButtonsAuth', params.authList);

  const enCodeList: string[] = params.format
    ? params.formatList || []
    : params.authList?.map((item) => item.enCode) || [];

  const hasButton = enCodeList.includes(params.enCode);
  return hasButton;
};

// 获取当前模块字符串路由权限
export const getButtonsAuthStr = (
  enCode: string,
  list: ButtonsAuth[]
): string => {
  const buttonList = list.map((item) => item.enCode);
  return buttonList.join(',');
};

// 获取路由参数
export const getURLParams = (
  url: string = window.location.href
): { [key: string]: any } => {
  if (url.indexOf('?') > 0) {
    let paramsStr;
    try {
      paramsStr = decodeURIComponent(url).split('?')[1].split('&');
    } catch (e) {
      paramsStr = url.split('?')[1].split('&');
    }
    let theRequest = {};

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < paramsStr.length; i++) {
      let key = paramsStr[i].split('=')[0];
      let value = paramsStr[i].split('=')[1];
      if (value && value.indexOf('#') > -1) {
        value = value.replace(/\#\S*$/, '');
      }
      // 给对象赋值
      if (key !== '') {
        theRequest[key] = value;
      }
    }
    return theRequest;
  }
  return {};
};

// 水印内容
export const getWatermarkContent = (userName: string) => {
  const date = new Date();
  const currTime = moment().format('YYYY-MM-DD');

  return `客诉售后集成平台 ${userName} ${currTime}`;
};

// JavaScript实现千位分隔符
export const numFormat = (num: number) => {
  const res = num.toString().replace(/\d+/, (n) => {
    // 先提取整数部分
    return n.replace(/(\d)(?=(\d{3})+$)/g, ($1) => {
      return $1 + ',';
    });
  });
  return res;
};

// js获取近一个周

export const getAWeek = () => {
  let end = new Date();
  let year = end.getFullYear();
  let month = end.getMonth() + 1; // 0-11表示1-12月
  let day = end.getDate();
  let dateObj: {
    start: string;
    end: string;
  } = {
    start: '',
    end: '',
  };
  dateObj.end = year + '-' + month + '-' + day;
  if (day - 7 <= 0) {
    // 如果在当月7日之前
    let startMonthDay = new Date(year, Number(month) - 1, 0).getDate(); // 1周前所在月的总天数
    if (month - 1 <= 0) {
      // 如果在当年的1月份
      dateObj.start = year - 1 + '-' + 12 + '-' + (31 - (7 - day));
    } else {
      dateObj.start =
        year + '-' + (month - 1) + '-' + (startMonthDay - (7 - day));
    }
  } else {
    dateObj.start = year + '-' + month + '-' + (day - 7);
  }
  return dateObj;
};
// js获取一个月
export const getAMonth = () => {
  let end = new Date();
  let year = end.getFullYear();
  let month = end.getMonth() + 1; // 0-11表示1-12月
  let day = end.getDate();
  let dateObj: {
    start: string;
    end: string;
  } = {
    start: '',
    end: '',
  };
  dateObj.end = year + '-' + month + '-' + day;
  let endMonthDay = new Date(year, month, 0).getDate(); // 当前月的总天数
  if (month - 1 <= 0) {
    // 如果是1月，年数往前推一年<br>
    dateObj.start = year - 1 + '-' + 12 + '-' + day;
  } else {
    let startMonthDay = new Date(year, Number(month) - 1, 0).getDate();
    if (startMonthDay < day) {
      // 1个月前所在月的总天数小于现在的天日期
      if (day < endMonthDay) {
        // 当前天日期小于当前月总天数
        dateObj.start =
          year +
          '-' +
          (month - 1) +
          '-' +
          (startMonthDay - (endMonthDay - day));
      } else {
        dateObj.start = year + '-' + (month - 1) + '-' + startMonthDay;
      }
    } else {
      dateObj.start = year + '-' + (month - 1) + '-' + day;
    }
  }

  return dateObj;
};

// js获取近一年
export const getAYear = () => {
  const currTime = new Date();
  currTime.setFullYear(currTime.getFullYear() - 1);
  const lastYear = currTime.toLocaleDateString().replace(/\//g, '-');

  return lastYear;
};
/**
 * 获取入参的字面量类型
 * @param {date} value - Date日期构造器的入参
 * @return {string}
 */
export const getType = (v) => {
  return v === undefined
    ? 'undefined'
    : v === null
      ? 'null'
      : v.constructor.name.toLowerCase();
};

/**
 * 清空url参数,重置url
 * @param {string} url - 将会解析为url查询字符串的js对象
 * @param {string[]} reserve - 指定clean时保留的查询参数
 * @return {string} - 返回更新后的url
 */
export const cleanURL = (url = window.location.href, reserve = []) => {
  let urlToBe = url.split('?')[0];
  if (reserve.length) {
    const queries = getURLParams(url);
    const newQueries = reserve
      .map((key) => `${key}=${queries[key] || ''}`)
      .join('&');
    urlToBe += '?' + newQueries;
  }
  window.location.href = urlToBe;
  return urlToBe;
};

/**
 * 将js对象反解为url参数
 * @param {object} object - 将会解析为url查询字符串的js对象
 * @param {string} url - 将会解析为url查询字符串的js对象
 * @param {boolean} type - 是否改动当前url: 为true时，单纯返回查询字符串；否则将之更新到当前url
 * @return {(string|void)} - 如果第三个参数type为false，则更新url，否则直接返回查询参数字符串
 */
export const reverseToURLParams = (
  object,
  url = window.location.href,
  type
) => {
  if (getType(object) !== 'object') {
    console.error({ msg: '反解参数类型应为object', data: object });
    return false;
  }

  // let paramsArray = Object.keys(object).map((key) => {
  //   let val = object[key] || '';
  //   if (val) {
  //     return `${key}=${val}`;
  //   }
  // });
  let paramsArray: any = [];
  Object.keys(object).forEach((key) => {
    let val = object[key] || '';
    if (val) {
      const str: any = `${key}=${val}`;
      paramsArray.push(str);
    }
  });

  let params = paramsArray.join('&');
  if (!type) {
    if (params) {
      // 有参数时再赋给url
      window.location.href = `${cleanURL(url)}?${params}`;
    } else {
      // 没有参数，清空url已有的参数
      cleanURL(window.location.href);
    }
  } else {
    return params;
  }
};
export const secondToTime = (time, type) => {
  let second = parseInt(time),
    min = 0,
    hour = 0,
    day = 0;

  if (second >= 60) {
    min = parseInt(second / 60);
    second %= 60;
  }
  if (min >= 60) {
    hour = parseInt(min / 60);
    min %= 60;
  }
  if (hour >= 24) {
    day = parseInt(hour / 24);
    hour %= 24;
  }

  // 保证格式为两位数
  second = second > 9 ? second : '0' + second;
  min = min > 9 ? min : '0' + min;
  hour = hour > 9 ? hour : '0' + hour;
  day = day > 9 ? day : '0' + day;  // 保证天数也是两位数

  if (type === 'noday') {
    return [hour, min, second]; // 返回格式化的字符串
  }
  return [day, hour, min, second];
}