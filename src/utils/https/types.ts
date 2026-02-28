import { AxiosRequestConfig } from 'axios';

// 定制业务相关的网络请求响应格式， T 是具体的接口返回类型数据
export interface CustomSuccessData<T> {
  data?: T;
  code: string;
  message: string;
  messageType: number;
}

export interface CustomRes {
  body?: object;
}

export interface CustomOpts {
  showError?: boolean;
  showLoading?: boolean;
  showSuccess?: boolean;
  loadingType?: number;
  errorHandler?: () => {};
}

export type Get = <T>(
  url: string,
  params?: object,
  options?: CustomOpts,
  config?: AxiosRequestConfig
) => Promise<CustomSuccessData<T>>;

export type Post = <T>(
  url: string,
  params?: object,
  options?: CustomOpts,
  config?: AxiosRequestConfig
) => Promise<CustomSuccessData<T>>;

/**
 * 接口请求状态定义
 */
export enum STATUSCODE {
  SUCCEED = '0', // 成功
  JURISDICTION = '401', //
  ERROR = '-500',
}
