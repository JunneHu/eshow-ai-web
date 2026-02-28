import moment from 'moment';

const DTAE_FORMAT_NORAML = 'YYYY-MM-DD';
const DTAE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DTAE_FORMAT_mm = 'YYYY-MM-DD HH:mm:ss';

const typeMap = {
    YYYY: 'YYYY',
    MM: 'YYYY-MM',
    DD: 'YYYY-MM-DD',
    HH: 'YYYY-MM-DD ',
    mm: 'YYYY-MM-DD HH:mm',
    ss: 'YYYY-MM-DD HH:mm:ss',
};

const getDefaultDateWithHHmmss = () => {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${handlePrefixZero(d.getMonth() + 1)}-${handlePrefixZero(d.getDate())}`;
    return [moment(`${todayStr} 00:00:00`, DTAE_FORMAT), moment(`${todayStr} 23:59:59`, DTAE_FORMAT)];
};

const getDefaultRangeDateOffset = (day = 6) => {
    const end = new Date();
    const start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * day);
    return [moment(`${concatDate(start)} 00:00:00`, DTAE_FORMAT),
        moment(`${concatDate(end)} 23:59:59`, DTAE_FORMAT)];
};

const getDefaultSameMonthOffset = () => {
    const end = new Date();
    const start = new Date();
    const same = start.getDate() - 1;
    start.setTime(start.getTime() - 3600 * 1000 * 24 * same);
    return [moment(`${concatDate(start)} 00:00:00`, DTAE_FORMAT),
        moment(`${concatDates(end)} 23:59:59`, DTAE_FORMAT)];
};
const concatDate = (d) => {
    return `${d.getFullYear()}-${handlePrefixZero(d.getMonth() + 1)}-${handlePrefixZero(d.getDate())}`;
};

const concatDates = (d) => {
    return `${d.getFullYear()}-${handlePrefixZero(d.getMonth() + 1)}-${handlePrefixZero(d.getDate() == 1 ? d.getDate() : d.getDate() - 1)}`;
};

const formatDate = (d) => {
    return d.format && d.format(DTAE_FORMAT_NORAML);
};

const formatDateWithHHmmss = (d, begin = true) => {
    return d.format && d.format(DTAE_FORMAT);
};

const formatDateWithHHmm = (d) => {
    return d.format && d.format(DTAE_FORMAT_mm);
};

const handlePrefixZero = (s) => {
    return `0${s}`.slice(-2);
};

// 获取时间范围
const getDateRange = (startDiff, endDiff, format = DTAE_FORMAT_NORAML) => {
    const start = moment().subtract(startDiff, 'days').format(format);
    const end = moment().subtract(endDiff, 'days').format(format);
    return [start, end];
};

function getOffsetDay(offset = 0, format = 'MM-DD') {
    return moment().subtract(offset, 'days').format(format);
}

function formatMoment(m, type = 'ss') {
    return m.format(typeMap[type]);
}

function formatMomentRange([ms, me], type = 'ss') {
    return [ms ? formatMoment(ms, type) : '', me ? formatMoment(me, type) : ''];
}

// 带过期时间的 localStorage 辅助函数
function storageSetItem(key, value, ttl = 0.5 * 60 * 60 * 1000) {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
}
function storageGetItem(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    const now = new Date();
    
    // 如果已过期，删除该项并返回 null
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
}

export {
    DTAE_FORMAT_NORAML,
    DTAE_FORMAT,
    formatDate,
    handlePrefixZero,
    getDefaultDateWithHHmmss,
    getDefaultRangeDateOffset,
    getDefaultSameMonthOffset,
    formatDateWithHHmmss,
    formatDateWithHHmm,
    getDateRange,
    getOffsetDay,
    formatMoment,
    formatMomentRange,
    storageSetItem,
    storageGetItem,
};
