import axios from 'axios';
import { message } from 'antd';

axios.defaults.withCredentials = true; // 允许跨域且携带 Cookie（或自定义头）。默认值：false
axios.defaults.timeout = 100000; // 设置请求超时时间（ms）不超过半分钟
axios.defaults.headers.common.Authorization = ''; // 携带的自定义头
axios.defaults.headers.common.accept = ''; // 携带的自定义头

axios.defaults.headers.post['Content-Type'] = 'application/json'; // 设置请求提内容类型，其他可选值：application/x-www-form-urlencoded

axios.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const logout = () => {
 
};

axios.interceptors.response.use(
  (response) => {
    if (response.data.code && response.data.code != '0') {
      message.error(response.data.message);
    }
    return response.data;
  },
  (error) => {
    const config = error.config || {};
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message.error(`请求参数（data）格式错误（${config.method + config.url}）`);
          break;
        case 401:
          logout();
          break;
        case 403:
          window.location.href = '/403';
          break;
        case 404:
          message.error(`请求 URL 格式错误（${config.url}）`);
          break;
        case 405:
          message.error(`请求 Method 格式错误（${config.url}）`);
          break;
        case 406:
          message.error(`请求 Content-Type 格式错误（${config.url}）`);
          break;
        case 408:
          message.warning(`请求超时（${config.url}）`);
          break;
        default:
          break;
      }

      const err = /^5\d{2}$/g;
      if (err.test(error.response.status)) {
        // window.location.href = '/500';
      }
    } else if (error.request) {
      // 请求被提出，但是没有收到任何回应
    } else {
      if (error.message === `timeout of ${config.timeout}ms exceeded`) {
        return message.warning('请求超时，请刷新页面重新请求！');
      }
      // 2 ）网络错误
      if (error.message === 'Network Error') {
        window.location.href = '/error';
      }
    }
    return Promise.reject(error);
  },
);

export default axios;
