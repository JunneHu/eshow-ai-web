import React, { useEffect, useMemo, useState } from 'react';
import { Button, Carousel, Spin, Tag, Typography } from 'antd';
import { Link, useHistory, useParams } from 'react-router-dom';
import { LinkOutlined } from '@ant-design/icons';
import BasicLayout from '@/layouts/BasicLayout';
import { createToolComment, getToolComments, getToolDetail, getCategoryDetail, getAdsByPosition } from '@/api/tools';
import CommentSection from '@/components/CommentSection';
import { useToolNavItems } from '@/hooks/useToolNavItems';
import { track } from '@/utils/tracking';
import DOMPurify from 'dompurify';
import './index.less';

const { Title, Paragraph, Text } = Typography;

type AnyObj = Record<string, any>;

const TAG_ZH: Record<string, string> = {
  hot: '热门',
  latest: '最新',
  new: '最新',
};

interface ToolDetailData {
  id: number;
  toolKey: string;
  name: string;
  description?: string;
  websiteUrl?: string | null;
  tags?: any;
  content?: string | null;
  Categories?: { id: number; categoryKey: string; title: string }[];
}

function parseTags(raw: any): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      return raw ? [raw] : [];
    } catch {
      return raw ? [raw] : [];
    }
  }
  return [];
}

function isSearchPlaceholderUrl(url: any): boolean {
  if (!url) return false;
  const s = String(url).trim().toLowerCase();
  return s.includes('bing.com/search');
}

function toZhTag(tag: string): string {
  if (!tag) return tag;
  // 已是中文则直接显示
  if (/[\u4e00-\u9fa5]/.test(tag)) return tag;
  const normalized = String(tag).trim().toLowerCase();
  return TAG_ZH[normalized] || tag;
}

const ToolDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { navItems } = useToolNavItems();

  const [tool, setTool] = useState<ToolDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommend, setRecommend] = useState<any[]>([]);
  const [detailAds, setDetailAds] = useState<any[]>([]);

  const [adExposedSet] = useState(() => new Set<string>());

  const detailAdsDisplayType = useMemo(() => {
    const first = detailAds && detailAds[0];
    return first && first.displayType ? String(first.displayType) : 'tile';
  }, [detailAds]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res: any = await getToolDetail(Number(id));
        const data: ToolDetailData = res.data;
        setTool(data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!tool?.id) return;
    track('tool_view', { toolId: tool.id });
  }, [tool?.id]);

  const tags = useMemo(() => parseTags(tool?.tags), [tool?.tags]);
  const contentHtml = useMemo(() => (tool?.content ? String(tool.content) : ''), [tool?.content]);
  const sanitizedContentHtml = useMemo(
    () => DOMPurify.sanitize(contentHtml || ''),
    [contentHtml],
  );

  const websiteUrl = useMemo(() => {
    const direct = tool?.websiteUrl ? String(tool.websiteUrl) : '';
    return direct && !isSearchPlaceholderUrl(direct) ? direct : '';
  }, [tool?.websiteUrl]);

  // 推荐：优先同分类（取第一个分类），否则退化为同 tag 的工具
  useEffect(() => {
    const run = async () => {
      if (!tool) return;
      try {
        const catId = tool.Categories?.[0]?.id;
        if (catId) {
          const res: any = await getCategoryDetail(catId);
          const data = res.data || {};
          const list = data.Tools || data.tools || [];
          const filtered = list.filter((t: any) => t.id !== tool.id).slice(0, 8);
          setRecommend(filtered);
          return;
        }
      } catch {
        // ignore
      }
      setRecommend([]);
    };
    run();
  }, [tool?.id]);

  useEffect(() => {
    getAdsByPosition('tool_detail_bottom')
      .then((res: any) => {
        setDetailAds(res.data || []);
      })
      .catch(() => {
        setDetailAds([]);
      });
  }, []);

  useEffect(() => {
    if (!detailAds || detailAds.length === 0) return;
    if (typeof window === 'undefined') return;
    if (!(window as any).IntersectionObserver) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const adId = el.getAttribute('data-ad-id');
          const position = el.getAttribute('data-ad-position');
          if (!adId) return;
          const key = `${position || ''}:${adId}`;
          if (adExposedSet.has(key)) return;
          adExposedSet.add(key);
          track('ad_view', {
            adId: Number(adId),
            position: position || 'tool_detail_bottom',
          });
        });
      },
      { threshold: 0.35 },
    );

    const nodes = Array.from(document.querySelectorAll('.ai-ads-section .ai-ad-item[data-ad-id]'));
    nodes.forEach((n) => io.observe(n));
    return () => {
      io.disconnect();
    };
  }, [detailAds.length]);

  const handleMenuClick = (key: string) => {
    history.push('/', { state: { scrollTo: key } });
  };

  const Layout = BasicLayout as any;

  if (loading) {
    return (
      <Layout navItems={navItems} onMenuClick={handleMenuClick} headerLeft="AI工具集">
        <div className="ai-tools-page">
          <main className="ai-tools-content">
            <div className="ai-tools-loading">
              <Spin size="large" />
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  if (!tool) {
    return (
      <Layout navItems={navItems} onMenuClick={handleMenuClick} headerLeft="AI工具集">
        <div className="ai-tools-page">
          <main className="ai-tools-content">
            <div className="ai-tools-empty">
              <Paragraph>工具不存在或已被删除。</Paragraph>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      navItems={navItems}
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
            <div className="ai-tools-section-header">
              <Title level={4} className="ai-tools-section-title">
                {tool.name}是什么
              </Title>
            </div>
            <div
              className="ai-tool-rich"
              dangerouslySetInnerHTML={{ __html: sanitizedContentHtml }}
            />
          </section>

          {detailAds.length > 0 && (
            <section className="ai-tools-section ai-ads-section">
              {detailAdsDisplayType === 'carousel' && detailAds.length > 1 ? (
                <Carousel autoplay dots>
                  {detailAds.map((ad: any) => {
                    const href = ad.linkUrl ? String(ad.linkUrl) : '';
                    const img = ad.imageUrl ? String(ad.imageUrl) : '';
                    return (
                      <a
                        key={ad.id}
                        className="ai-ad-item"
                        data-ad-id={String(ad.id)}
                        data-ad-position="tool_detail_bottom"
                        href={href || undefined}
                        target={href ? "_blank" : undefined}
                        rel={href ? "noreferrer" : undefined}
                        onClick={() => {
                          track('ad_click', {
                            adId: ad.id,
                            position: 'tool_detail_bottom',
                            linkUrl: href,
                          });
                        }}
                      >
                        {img ? <img className="ai-ad-image" src={img} alt={String(ad.name || '')} /> : null}
                      </a>
                    );
                  })}
                </Carousel>
              ) : (
                <div
                  className={`ai-ads-grid ${
                    detailAds.length === 1 ? 'ai-ads-grid-1' : detailAds.length === 2 ? 'ai-ads-grid-2' : ''
                  }`}
                >
                  {detailAds.map((ad: any) => {
                    const href = ad.linkUrl ? String(ad.linkUrl) : '';
                    const img = ad.imageUrl ? String(ad.imageUrl) : '';
                    return (
                      <a
                        key={ad.id}
                        className="ai-ad-item"
                        data-ad-id={String(ad.id)}
                        data-ad-position="tool_detail_bottom"
                        href={href || undefined}
                        target={href ? "_blank" : undefined}
                        rel={href ? "noreferrer" : undefined}
                        onClick={() => {
                          track('ad_click', {
                            adId: ad.id,
                            position: 'tool_detail_bottom',
                            linkUrl: href,
                          });
                        }}
                      >
                        {img ? <img className="ai-ad-image" src={img} alt={String(ad.name || '')} /> : null}
                      </a>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          <section className="ai-tools-section">
            <div className="ai-tools-section-header">
              <Title level={4} className="ai-tools-section-title">
                类似于{tool.name}的工具推荐
              </Title>
              {/* {tool.Categories?.[0]?.id ? (
                <Link to={`/category/${tool.Categories?.[0]?.id}`} className="ai-tools-section-more">
                  查看更多&gt;&gt;
                </Link>
              ) : null} */}
            </div>

            {recommend.length === 0 ? (
              <Text type="secondary">暂无推荐工具。</Text>
            ) : (
              <div className="ai-tools-grid">
                {recommend.map((t: any) => (
                  <div
                    key={t.id}
                    className="ai-tools-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => history.push(`/tool/${t.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && history.push(`/tool/${t.id}`)}
                  >
                    <div className="ai-tools-card-avatar">
                      {t.name?.[0]?.toUpperCase?.() || 'A'}
                    </div>
                    <div className="ai-tools-card-body">
                      <div className="ai-tools-card-name" title={t.name}>
                        {t.name}
                      </div>
                      <div className="ai-tools-card-desc" title={t.description || ''}>
                        {t.description || '暂无简介'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="ai-tools-section ai-comments-section">
            <CommentSection
              title="评论"
              bizId={tool.id}
              storageKey="tool_comment_user"
              getComments={({ page, pageSize }) => getToolComments({ toolId: tool.id, page, pageSize })}
              createComment={({ parentId, content, nickname, email, website }) =>
                createToolComment({
                  toolId: tool.id,
                  parentId,
                  content,
                  nickname,
                  email,
                  website,
                })
              }
              trackSubmit={({ isReply }) => {
                track('comment_submit', { toolId: tool.id, isReply });
              }}
            />
          </section>
        </main>
      </div>
    </Layout>
  );
};

export default ToolDetail;
