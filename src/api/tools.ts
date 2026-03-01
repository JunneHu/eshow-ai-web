import request from '@/utils/request';

// 工具 / 分类相关 API（C 端展示使用）

// 获取全部工具（可按需传入查询参数）
export const getTools = (params?: any) =>
  (request as any).get('/api/tools', { params });

// 获取单个工具详情（按数据库自增 id）
export const getToolDetail = (id: number) =>
  (request as any).get(`/api/tools/${id}`);

// 获取分类列表
export const getCategories = () =>
  (request as any).get('/api/categories');

// 获取单个分类及其下的工具列表
export const getCategoryDetail = (id: number) =>
  (request as any).get(`/api/categories/${id}`);

// 获取广告列表（C 端按 position）
export const getAdsByPosition = (position: string) =>
  (request as any).get('/api/public/ads', { params: { position } });

// 工具评论（C 端）
export const getToolComments = (params: { toolId: number; page?: number; pageSize?: number }) =>
  (request as any).get('/api/public/tool-comments', { params });

export const createToolComment = (data: any) =>
  request.post<any>('/api/public/tool-comments', data);

