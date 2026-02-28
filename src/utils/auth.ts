import request from '@/utils/request';

export interface CurrentUser {
  id: number | string;
  username: string;
  role?: string;
  [key: string]: any;
}

// 从本地存储读取当前用户，如果没有则尝试调用 /api/auth/me 获取
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cached = localStorage.getItem('userInfo');
    if (cached) {
      const user = JSON.parse(cached);
      if (user && (user.id || user.username)) {
        return user;
      }
    }

    // 如果本地没有完整 userInfo，则调用后端接口获取
    const res: any = await request.get('/api/auth/me');
    if (res && res.code === 0 && res.data) {
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      if (res.data.username) {
        localStorage.setItem('username', res.data.username);
      }
      return res.data;
    }
  } catch (e) {
    // 静默失败，返回 null，由调用方兜底
    console.error('获取当前用户信息失败', e);
  }
  return null;
}


