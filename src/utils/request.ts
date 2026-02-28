import axios from 'axios';
import { message } from 'antd';

// 创建 axios 实例
const request = axios.create({
  baseURL: window.configs.host.webapi,
  // AI 分析接口可能需要较长时间（DeepSeek/大数据聚合等），默认超时提升到 30s
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 仅附加认证 token，避免多余自定义请求头导致 CORS 问题
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response;
    console.log('收到响应:', response.config.url, data);
    
    // 统一处理响应格式
    if (data.code === 0) {
      return data;
    } else {
      // 业务错误
      message.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message || '请求失败'));
    }
  },
  (error) => {
    // 网络错误或其他错误
    let errorMessage = '网络错误，请稍后重试';
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          errorMessage = '未授权，请重新登录';
          // 清除本地存储的认证信息
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          // 跳转到登录页
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          errorMessage = '没有权限访问该资源';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = data?.message || `请求失败 (${status})`;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请稍后重试';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    message.error(errorMessage);
    return Promise.reject(error);
  }
);

export default request;
