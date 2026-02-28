import { message } from 'antd';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { Interceptors } from './Interceptors';
import { CustomOpts, CustomSuccessData, Get, Post } from './types';

class HttpService {
  private static instance: HttpService;
  public axios: AxiosInstance;

  public constructor() {
    this.axios = new Interceptors({ url: '111' }).getInterceptors();
  }

  public getInstance() {
    if (!HttpService.instance) {
      HttpService.instance = new HttpService();
    }
    return HttpService.instance;
  }

  // eslint-disable-next-line max-params
  public get: Get = async <T>(
    url: string,
    params?: object,
    options?: CustomOpts,
    config?: AxiosRequestConfig
  ) => {
    try {
      const response: any = await this.axios.get<T>(
        params ? `${url}?${qs.stringify(params)}` : url,
        config
      );

      if (!this.successStatus(response)) {
        this.handleBrowserFail(response, options);
      }
      return response;
    } catch (e) {
      console.log('http get method fail:', e);
      return false;
    }
  };

  // eslint-disable-next-line max-params
  public post: Post = async <T>(
    url: string,
    params?: object,
    options?: CustomOpts,
    config?: AxiosRequestConfig
  ) => {
    try {
      const response: any = await this.axios.post<T>(url, params, config);
      if (!this.successStatus(response)) {
        this.handleBrowserFail(response, options);
      }
      return response;
    } catch (e) {
      console.log('http post method fail:', e);
      return false;
    }
  };

  private successStatus(response: CustomSuccessData<any>): boolean {
    return Number(response.code) === 200 || Number(response.code) === 0;
  }

  // TODO 失败判断
  private handleBrowserFail(
    response: CustomSuccessData<any>,
    options?: CustomOpts
  ) {
    console.log('response', response);
    console.log('options', options);

    let showError = options ? options.showError : false;
    const { code, message: msg } = response;
    // if (Number(code) === 400) {
    //   message.error(`请求参数（data）格式错误`);
    // }
    if (Number(code) === 401) {
      //  登出
      this.logout();
    }
    if (Number(code) === 403) {
      window.location.href = '/403';
    }

    if (Number(code) === 404) {
      // window.location.href = '/404';
    }

    if (!showError) {
      console.log('showError', showError);
      message.destroy();
      message.warning(response?.message || '服务器异常, 请稍后再试');
      // Dialog({
      //   title: '提示',
      //   message: em || '操作无响应',
      // }).then(() => {
      //   console.log(em || '操作无响应');
      // });
    }
  }

  private logout = () => {
    const redirectUrl = window.location.origin;
    const logoutUrl = `${
      window.configs.host.passport.auth
    }/oauth/authorize?client_id=${
      window.configs.authorId || window.configs.clientId
    }&redirect_uri=${encodeURIComponent(
      redirectUrl
    )}&response_type=code&scope=get_user_info&state=xyz`;
    window.location.href = `${
      window.configs.host.passport.auth
    }/user/logout?returnurl=${encodeURIComponent(logoutUrl)}`;
  };
}

export default new HttpService().getInstance();
