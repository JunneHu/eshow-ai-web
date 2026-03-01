import React, { useEffect, useMemo, useState } from 'react';
import { Card, Input, Pagination, Typography } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout';
import { getNewsList } from '@/api/news';
import PageState from '@/components/PageState';
import { useToolNavItems } from '@/hooks/useToolNavItems';
import { track } from '@/utils/tracking';
import '../Tools/index.less';

const { Title, Text, Paragraph } = Typography;

const NEWS_LIST_CACHE_TTL_MS = 30 * 1000;
const newsListCache = new Map<string, { at: number; data: any }>();

/** 相对时间：如 6个月前 */
function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const m = moment(dateStr);
  if (!m.isValid()) return '';
  return m.locale('zh-cn').fromNow();
}

const NewsListPage: React.FC = () => {
  const history = useHistory();
  const { navItems } = useToolNavItems();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [list, setList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  const fetchData = async (p: number = page, ps: number = pageSize, kw: string = keyword) => {
    const cacheKey = `${p}:${ps}:${String(kw || '').trim()}`;
    const cached = newsListCache.get(cacheKey);
    if (cached && Date.now() - cached.at < NEWS_LIST_CACHE_TTL_MS) {
      const data = cached.data;
      if (data && Array.isArray(data.list)) {
        setList(data.list);
        setTotal(typeof data.total === 'number' ? data.total : data.list.length);
        setPage(typeof data.page === 'number' ? data.page : p);
        setPageSize(typeof data.pageSize === 'number' ? data.pageSize : ps);
      }
    }

    if (!cached) setLoading(true);
    setError(null);
    try {
      const res: any = await getNewsList({ page: p, pageSize: ps, keyword: kw || undefined });
      const data = res && res.data;
      if (data && Array.isArray(data.list)) {
        newsListCache.set(cacheKey, { at: Date.now(), data });
        setList(data.list);
        setTotal(typeof data.total === 'number' ? data.total : data.list.length);
        setPage(typeof data.page === 'number' ? data.page : p);
        setPageSize(typeof data.pageSize === 'number' ? data.pageSize : ps);
      } else {
        const arr = Array.isArray(data) ? data : [];
        newsListCache.set(cacheKey, { at: Date.now(), data: { list: arr, total: arr.length, page: p, pageSize: ps } });
        setList(arr);
        setTotal(arr.length);
        setPage(p);
        setPageSize(ps);
      }
    } catch {
      setList([]);
      setTotal(0);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'AI资讯 - AI工具集';
    }
    fetchData(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuClick = (key: string) => {
    history.push('/', { state: { scrollTo: key } });
  };

  const Layout = BasicLayout as any;

  const cards = useMemo(() => {
    return (list || []).map((item: any) => {
      const id = item.id;
      const title = item.title ? String(item.title) : '';
      const summary = item.summary ? String(item.summary) : '';
      const cover = item.coverImageUrl ? String(item.coverImageUrl) : '';
      const publishAt = item.publishAt ? String(item.publishAt) : '';
      const timeAgo = formatTimeAgo(publishAt);

      const handleClick = () => {
        track('news_click', { newsId: id });
        history.push(`/news/${id}`);
      };

      return (
        <div
          key={id}
          className="ai-news-card ai-news-card-row-single"
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
          <Card hoverable className="ai-news-card-inner">
            <div className="ai-news-card-row">
              <div className="ai-news-cover-wrap">
                {cover ? (
                  <img className="ai-news-cover" src={cover} alt={title} />
                ) : (
                  <div className="ai-news-cover ai-news-cover-empty" />
                )}
              </div>
              <div className="ai-news-body">
                <div className="ai-news-title" title={title}>
                  {title}
                </div>
                {summary ? (
                  <Paragraph className="ai-news-summary" ellipsis={{ rows: 3 }}>
                    {summary}
                  </Paragraph>
                ) : null}
                <div className="ai-news-card-footer">
                  <span className="ai-news-tag">
                    <span className="ai-news-tag-icon">{React.createElement(UnorderedListOutlined as any)}</span>
                    AI快讯
                  </span>
                  {timeAgo ? <span className="ai-news-time">{timeAgo}</span> : null}
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    });
  }, [history, list]);

  return (
    <Layout navItems={navItems} activeKey="news" onMenuClick={handleMenuClick} headerLeft="AI工具集" headerRight={null}>
      <div className="ai-tools-page">
        <main className="ai-tools-content">
          {/* 列表页头上搜索，与分类/工具列表样式一致 */}
          <div className="ai-tools-search-bar">
            <Input.Search
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              placeholder="搜索资讯标题/摘要"
              size="large"
              onSearch={(kw) => {
                const next = String(kw || '').trim();
                setKeyword(next);
                fetchData(1, pageSize, next);
              }}
            />
          </div>

          <section className="ai-tools-section">
            <div className="ai-tools-section-header">
              <Title level={4} className="ai-tools-section-title">
                AI资讯
              </Title>
              <Text type="secondary" className="ai-tools-section-count">
                共 {total} 条
              </Text>
            </div>

            {loading || error || list.length === 0 ? (
              <PageState
                loading={loading}
                error={error}
                empty={!loading && !error && list.length === 0}
                emptyText={<Paragraph style={{ marginBottom: 0 }}>暂无资讯</Paragraph>}
                onRetry={() => fetchData(1, pageSize, keyword)}
                height={140}
              />
            ) : (
              <div className="ai-news-list">{cards}</div>
            )}

            {total > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  showSizeChanger
                  pageSizeOptions={[10, 20, 50] as any}
                  onChange={(p, ps) => fetchData(p, ps, keyword)}
                />
              </div>
            ) : null}
          </section>
        </main>
      </div>
    </Layout>
  );
};

export default NewsListPage;
