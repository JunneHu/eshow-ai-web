import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Spin, Typography } from 'antd';
import { Link, useHistory, useParams } from 'react-router-dom';
import { MessageOutlined } from '@ant-design/icons';
import DOMPurify from 'dompurify';
import BasicLayout from '@/layouts/BasicLayout';
import { createNewsComment, getNewsComments, getNewsDetail } from '@/api/news';
import CommentSection from '@/components/CommentSection';
import PageState from '@/components/PageState';
import { useToolNavItems } from '@/hooks/useToolNavItems';
import { track } from '@/utils/tracking';
import '../Tools/index.less';

const { Title, Paragraph, Text } = Typography;
const COMMENT_USER_STORAGE_KEY = 'news_comment_user';

const NEWS_DETAIL_CACHE_TTL_MS = 30 * 1000;
const newsDetailCache = new Map<number, { at: number; data: any }>();

function ensureMetaTag(name: string) {
  if (typeof document === 'undefined') return null;
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  return el;
}

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { navItems } = useToolNavItems();
  const commentSectionRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [commentTotal, setCommentTotal] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    const idNum = Number(id);
    const cached = Number.isFinite(idNum) ? newsDetailCache.get(idNum) : null;
    if (cached && Date.now() - cached.at < NEWS_DETAIL_CACHE_TTL_MS) {
      setNews(cached.data || null);
      setLoading(false);
    }

    const run = async () => {
      if (!cached) setLoading(true);
      setError(null);
      try {
        const res: any = await getNewsDetail(idNum);
        const row = res.data || null;
        setNews(row);
        if (Number.isFinite(idNum)) newsDetailCache.set(idNum, { at: Date.now(), data: row });
      } catch {
        setNews(null);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  useEffect(() => {
    if (!news?.id) return;
    getNewsComments({ newsId: news.id, page: 1, pageSize: 1 })
      .then((res: any) => {
        const data = res?.data;
        if (data && typeof data.total === 'number') setCommentTotal(data.total);
      })
      .catch(() => {});
  }, [news?.id]);

  useEffect(() => {
    if (!news?.id) return;
    track('news_view', { newsId: news.id });
  }, [news?.id]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!news) {
      document.title = 'AI资讯 - AI工具集';
      return;
    }
    const title = String(news.title || 'AI资讯');
    document.title = `${title} - AI资讯`;
    const desc = String(news.summary || '').trim() || title;
    const meta = ensureMetaTag('description');
    if (meta) meta.setAttribute('content', desc.slice(0, 180));
  }, [news]);

  const contentHtml = useMemo(() => (news?.content ? String(news.content) : ''), [news?.content]);
  const sanitizedContentHtml = useMemo(
    () => DOMPurify.sanitize(contentHtml || ''),
    [contentHtml],
  );

  const handleMenuClick = (key: string) => {
    history.push('/', { state: { scrollTo: key } });
  };

  const Layout = BasicLayout as any;

  if (loading || error || !news) {
    return (
      <Layout navItems={navItems} activeKey="news" onMenuClick={handleMenuClick} headerLeft="AI工具集">
        <div className="ai-tools-page">
          <main className="ai-tools-content">
            <PageState
              loading={loading}
              error={error}
              empty={!loading && !error && !news}
              emptyText={
                <div>
                  <Paragraph style={{ marginBottom: 8 }}>资讯不存在或已下线。</Paragraph>
                  <Button type="link" onClick={() => history.push('/news')} style={{ padding: 0 }}>
                    返回资讯列表
                  </Button>
                </div>
              }
              onRetry={() => {
                if (!id) return;
                setNews(null);
                setError(null);
                setLoading(true);
                getNewsDetail(Number(id))
                  .then((res: any) => setNews(res.data || null))
                  .catch(() => setError(true))
                  .finally(() => setLoading(false));
              }}
            />
          </main>
        </div>
      </Layout>
    );
  }

  const cover = news.coverImageUrl ? String(news.coverImageUrl) : '';
  const publishAt = news.publishAt ? String(news.publishAt).replace('T', ' ').slice(0, 19) : '';
  const sourceUrl = news.sourceUrl ? String(news.sourceUrl) : '';

  const scrollToComments = () => {
    commentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout
      navItems={navItems}
      activeKey="news"
      onMenuClick={handleMenuClick}
      headerLeft={
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          AI工具集
        </Link>
      }
      headerRight={null}
    >
      <div className="ai-tools-page">
        <main className="ai-tools-content">
          <section className="ai-tools-section">
            {/* 面包屑：首页 > AI资讯 > 文章标题 */}
            <nav className="ai-news-breadcrumb" aria-label="面包屑">
              <Link to="/">首页</Link>
              <span className="ai-news-breadcrumb-sep"> &gt; </span>
              <Link to="/news">AI资讯</Link>
              <span className="ai-news-breadcrumb-sep"> &gt; </span>
              <span className="ai-news-breadcrumb-current">{String(news.title || '').slice(0, 40)}{(news.title || '').length > 40 ? '…' : ''}</span>
            </nav>

            <Title level={3} className="ai-news-detail-title">
              {String(news.title || '')}
            </Title>

            {/* 元信息：发布时间、来源、评论数 */}
            <div className="ai-news-detail-meta">
              {publishAt ? <span className="ai-news-detail-meta-item">{publishAt} 发布</span> : null}
              {sourceUrl ? (
                <a className="ai-news-detail-meta-item ai-news-source" href={sourceUrl} target="_blank" rel="noreferrer">
                  来源链接
                </a>
              ) : null}
              <button type="button" className="ai-news-detail-meta-item ai-news-meta-comments" onClick={scrollToComments}>
                {React.createElement(MessageOutlined as any)} {commentTotal} 条评论
              </button>
            </div>

            {cover ? (
              <div className="ai-news-detail-cover-wrap">
                <img className="ai-news-detail-cover" src={cover} alt={String(news.title || '')} />
              </div>
            ) : null}

            {news.summary ? (
              <Paragraph className="ai-news-detail-summary" type="secondary">
                {String(news.summary)}
              </Paragraph>
            ) : null}

            <div className="ai-tool-rich" dangerouslySetInnerHTML={{ __html: sanitizedContentHtml }} />
          </section>

          <div ref={commentSectionRef}>
            <CommentSection
              title="评论"
              bizId={news.id}
              storageKey={COMMENT_USER_STORAGE_KEY}
              getComments={({ page, pageSize }) => getNewsComments({ newsId: news.id, page, pageSize })}
              createComment={({ parentId, content, nickname, email, website }) =>
                createNewsComment({
                  newsId: news.id,
                  parentId,
                  content,
                  nickname,
                  email,
                  website,
                })
              }
              trackSubmit={({ isReply }) => {
                track('comment_submit', { newsId: news.id, isReply });
              }}
              onSubmitted={() => {
                setCommentTotal((v) => (typeof v === 'number' ? v + 1 : 1));
              }}
            />
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default NewsDetailPage;
