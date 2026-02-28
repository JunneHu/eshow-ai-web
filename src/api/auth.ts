// 简化版认证 API：仅提供 BasicLayout 需要的修改密码能力
import request from '@/utils/request';

export const changePassword = (data: { oldPassword: string; newPassword: string }) => {
  // 如果后端暂时没有实现修改密码接口，可以在这里直接返回 resolved Promise
  // return Promise.resolve({ code: 0, message: 'ok' });
  return request.post<any>('/api/auth/change-password', data);
};

export default {
  changePassword,
};

