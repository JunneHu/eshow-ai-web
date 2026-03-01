import request from '@/utils/request';

export const getNewsList = (params?: { page?: number; pageSize?: number; keyword?: string }) =>
  (request as any).get('/api/public/news', { params });

export const getNewsDetail = (id: number) =>
  (request as any).get(`/api/public/news/${id}`);

export const getNewsComments = (params: { newsId: number; page?: number; pageSize?: number }) =>
  (request as any).get('/api/public/news-comments', { params });

export const createNewsComment = (data: any) =>
  request.post<any>('/api/public/news-comments', data);
