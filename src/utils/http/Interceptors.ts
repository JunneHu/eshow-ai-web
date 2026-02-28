import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
export class Interceptors {
  public instance;

  public constructor() {
    this.instance = axios.create({
      baseURL: window.configs.host.webapi,
      withCredentials: true,
      timeout: 1000 * 30,
    });
    // 初始化拦截器
    this.initInterceptors();
  }
  // 为了让http.ts中获取初始化好的axios实例
  public getInterceptors() {
    return this.instance;
  }
  // 初始化拦截器
  public initInterceptors() {
    this.instance.defaults.headers.common.Authorization = '';
    this.instance.defaults.headers.common.accept = '';
    this.instance.defaults.headers.post['Content-Type'] =
      'application/x-www-form-urlencoded';

    // 请求拦截器
    this.instance.interceptors.request.use(
      (res: AxiosRequestConfig) => {
        res.headers!.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
        return res;
      },
      (error: AxiosError) => {
        console.log('error-----', error);
        return Promise.resolve({ res: error });
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (res: AxiosResponse<any>) => {
        // console.log('响应拦截器', res);
        const body = res.data || {};
        const { ec } = body;

        if (ec === 200 || ec === 0) {
          body.res = true;
          return Promise.resolve(body);
        } else {
          body.res = false;
          return Promise.resolve(body);
        }
      },
      (error: AxiosError) => {
        console.log(error);
        // return Promise.resolve({ res: false });
        return Promise.resolve({ res: error });
      }
    );
  }
}
