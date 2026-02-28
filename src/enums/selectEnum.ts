import moment from 'moment';
export interface ProTableSelectObjDict {
  [key: number | string]: string;
}
export interface ProTableSelectObjMoreDict {
  [key: number | string]: {
    text: string;
    status?: ValueEnumStatus;
    color?: string;
    type?: number;
    key?: string;
  };
}

type ValueEnumStatus =
  | 'Warning'
  | 'Default'
  | 'Processing'
  | 'Success'
  | 'Error';

export interface TabsItemDict {
  label: string;
  key: string | number;
  children: any;
}

interface SelectList {
  value: number | string | boolean;
  label: string;
  color?: string;
  time?: string;
}

export const selectPeriodDict: SelectList[] = [
  { value: '1h', label: '近1小时', time: moment().subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss')},
  { value: '24h', label: '近24小时', time: moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss')},
  { value: '7d', label: '近7天', time: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss')},
  { value: '30d', label: '近30天', time: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss')},
];

// 通用
// 这个是通用的 不能改 true：是 false：否
export const isTrueDict: SelectList[] = [ 
  { value: true, label: '是' },
  { value: false, label: '否' },
];

// 所有1是 0否通用
export const yesOrNoDict: SelectList[] = [
  { value: 0, label: '否' },
  { value: 1, label: '是' },
];

// 所有启用禁用通用
export const isEnableDict: SelectList[] = [
  { value: true, label: '启用' },
  { value: false, label: '禁用' },
];
// 结束
// 所有启用禁用通用
export const platformDict: SelectList[] = [
  { value: 'Android', label: 'Android' },
  { value: 'iOS', label: 'iOS' },
  { value: 'JS', label: 'JS' },
  { value: 'Android,JS', label: 'Android,JS' },
];
