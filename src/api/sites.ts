// 站点相关 API，当前仅用于 BasicLayout 中获取站点列表
import request from '@/utils/request';

export interface Site {
  site_id: string;
  site_name: string;
}

export const getSites = (params?: any) => {
  // 如果后端暂时没有站点接口，可以改成直接返回空数组：
  // return Promise.resolve({ code: 0, data: [] });
  return (request as any).get('/api/sites', { params });
};

export default {
  getSites,
};

