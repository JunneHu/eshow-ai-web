import React, { useEffect, useMemo, useState } from 'react';
import { Button, Carousel, Input, Spin, Tag, Typography, message } from 'antd';
import { Link, useHistory, useParams } from 'react-router-dom';
import { LinkOutlined } from '@ant-design/icons';
import BasicLayout from '@/layouts/BasicLayout';
import { createToolComment, getToolComments, getToolDetail, getCategoryDetail, getAdsByPosition } from '@/api/tools';
import { useToolNavItems } from '@/hooks/useToolNavItems';
import './index.less';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

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

function avatarText(nickname: any): string {
  const s = nickname ? String(nickname).trim() : '';
  if (!s) return '访客';
  const first = s.slice(0, 1);
  if (/^[a-zA-Z]$/.test(first)) return s.slice(0, 2).toUpperCase();
  return first;
}

const ToolDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { navItems } = useToolNavItems();

  const [tool, setTool] = useState<ToolDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommend, setRecommend] = useState<any[]>([]);
  const [detailAds, setDetailAds] = useState<any[]>([]);

  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [commentNickname, setCommentNickname] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentWebsite, setCommentWebsite] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

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

  const tags = useMemo(() => parseTags(tool?.tags), [tool?.tags]);
  const contentHtml = useMemo(() => (tool?.content ? String(tool.content) : ''), [tool?.content]);

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

  const fetchComments = async (toolId: number) => {
    setCommentsLoading(true);
    try {
      const res: any = await getToolComments(toolId);
      setComments(res.data || []);
    } catch (e) {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (!tool?.id) return;
    fetchComments(tool.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool?.id]);

  const handleSubmitComment = async (parentId?: number | null) => {
    if (!tool?.id) return;
    const content = (parentId ? replyContent : commentContent).trim();
    const nickname = commentNickname.trim();
    const email = commentEmail.trim();
    const website = commentWebsite.trim();

    if (!content) {
      message.warning('请输入评论内容');
      return;
    }
    if (!nickname) {
      message.warning('请输入昵称');
      return;
    }

    setCommentSubmitting(true);
    try {
      await createToolComment({
        toolId: tool.id,
        parentId: parentId || null,
        content,
        nickname,
        email,
        website,
      });
      message.success('发表成功');
      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setCommentContent('');
      }
      fetchComments(tool.id);
    } catch (e) {
    } finally {
      setCommentSubmitting(false);
    }
  };

  const formatTime = (v: any) => {
    if (!v) return '';
    return String(v).replace('T', ' ').slice(0, 19);
  };

  const renderCommentItem = (item: any, level: number = 0) => {
    const website = item.website ? String(item.website) : '';
    return (
      <div key={item.id} className="ai-comment-item" style={{ marginLeft: level ? 24 : 0 }}>
        <div className="ai-comment-main">
          <div className="ai-comment-avatar">{avatarText(item.nickname)}</div>
          <div className="ai-comment-body">
            <div className="ai-comment-meta">
              <div className="ai-comment-author">
                <span className="ai-comment-nickname">{String(item.nickname || '游客')}</span>
                {website ? (
                  <a className="ai-comment-website" href={website} target="_blank" rel="noreferrer">
                    {website}
                  </a>
                ) : null}
              </div>
              <div className="ai-comment-time">{formatTime(item.createdAt)}</div>
            </div>
            <div className="ai-comment-content">{String(item.content || '')}</div>
            <div className="ai-comment-actions">
              <Button type="link" size="small" onClick={() => setReplyingTo(item.id)} style={{ padding: 0 }}>
                回复
              </Button>
            </div>

            {replyingTo === item.id ? (
              <div className="ai-comment-reply">
                <TextArea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="输入评论内容..."
                  rows={4}
                />
                <div className="ai-comment-form-row">
                  <Input value={commentNickname} onChange={(e) => setCommentNickname(e.target.value)} placeholder="昵称" />
                  <Input value={commentEmail} onChange={(e) => setCommentEmail(e.target.value)} placeholder="邮箱" />
                  <Input value={commentWebsite} onChange={(e) => setCommentWebsite(e.target.value)} placeholder="网址" />
                </div>
                <div className="ai-comment-form-actions">
                  <Button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    再想想
                  </Button>
                  <Button type="primary" loading={commentSubmitting} onClick={() => handleSubmitComment(item.id)}>
                    发表评论
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {Array.isArray(item.replies) && item.replies.length > 0 ? (
          <div className="ai-comment-replies">
            {item.replies.map((r: any) => renderCommentItem(r, level + 1))}
          </div>
        ) : null}
      </div>
    );
  };

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
      headerRight={
        <Text type="secondary">
          {tool.Categories?.[0]?.title ? `${tool.Categories?.[0]?.title} · ` : ''}
          {tool.toolKey}
        </Text>
      }
    >
      <div className="ai-tools-page">
        <main className="ai-tools-content">
          <section className="ai-tool-hero">
            <div className="ai-tool-hero-card">
              <div className="ai-tool-hero-left">
                <div className="ai-tool-hero-mock">
                  <div className="ai-tool-hero-mock-inner">
                    <div className="ai-tool-hero-mock-avatar">
                      {tool.name?.[0]?.toUpperCase?.() || 'A'}
                    </div>
                    <div className="ai-tool-hero-mock-title">{tool.name}</div>
                    <div className="ai-tool-hero-mock-sub">AI工具卡片预览</div>
                  </div>
                </div>
              </div>

              <div className="ai-tool-hero-right">
                <Title level={3} style={{ marginBottom: 8 }}>
                  {tool.name}
                </Title>
                <Paragraph type="secondary" style={{ marginBottom: 12 }}>
                  {tool.description || '暂无简介'}
                </Paragraph>

                <div className="ai-tool-hero-tags">
                  {tags.slice(0, 6).map((t) => {
                    const normalized = String(t).trim().toLowerCase();
                    const label = toZhTag(String(t));
                    return (
                      <Tag
                        key={`${normalized}-${label}`}
                        color={normalized === 'hot' || label === '热门' ? 'magenta' : 'blue'}
                      >
                        {label}
                      </Tag>
                    );
                  })}
                </div>

                <div className="ai-tool-hero-actions">
                  {websiteUrl ? (
                    <Button
                      type="primary"
                      // @ts-expect-error antd icons strict typing
                      icon={<LinkOutlined />}
                      href={websiteUrl}
                      target="_blank"
                    >
                      访问官网
                    </Button>
                  ) : (
                    <Button disabled>暂无官网</Button>
                  )}
                  {/* <Button onClick={() => history.push('/')}>返回首页</Button> */}
                </div>

                {/* {featureChips.length > 0 && (
                  <div className="ai-tool-hero-chips">
                    {featureChips.map((c) => (
                      <span key={c} className="ai-tool-chip" title={c}>
                        {c}
                      </span>
                    ))}
                  </div>
                )} */}
              </div>
            </div>
          </section>

          <section className="ai-tools-section">
            <div className="ai-tools-section-header">
              <Title level={4} className="ai-tools-section-title">
                {tool.name}是什么
              </Title>
            </div>
            <div
              className="ai-tool-rich"
              // 注意：富文本渲染存在 XSS 风险，需确保 content 来源可信或在后端做过净化
              dangerouslySetInnerHTML={{ __html: contentHtml || '' }}
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
                        href={href || undefined}
                        target={href ? "_blank" : undefined}
                        rel={href ? "noreferrer" : undefined}
                      >
                        {img ? <img className="ai-ad-image" src={img} alt={String(ad.name || '')} /> : null}
                      </a>
                    );
                  })}
                </Carousel>
              ) : (
                <div className="ai-ads-grid">
                  {detailAds.map((ad: any) => {
                    const href = ad.linkUrl ? String(ad.linkUrl) : '';
                    const img = ad.imageUrl ? String(ad.imageUrl) : '';
                    return (
                      <a
                        key={ad.id}
                        className="ai-ad-item"
                        href={href || undefined}
                        target={href ? "_blank" : undefined}
                        rel={href ? "noreferrer" : undefined}
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
            <div className="ai-tools-section-header">
              <Title level={4} className="ai-tools-section-title">
                评论
              </Title>
            </div>

            <div className="ai-comment-form">
              <TextArea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="输入评论内容..."
                rows={4}
              />
              <div className="ai-comment-form-row">
                <Input value={commentNickname} onChange={(e) => setCommentNickname(e.target.value)} placeholder="昵称" />
                <Input value={commentEmail} onChange={(e) => setCommentEmail(e.target.value)} placeholder="邮箱" />
                <Input value={commentWebsite} onChange={(e) => setCommentWebsite(e.target.value)} placeholder="网址" />
              </div>
              <div className="ai-comment-form-actions">
                <Button type="primary" loading={commentSubmitting} onClick={() => handleSubmitComment(null)}>
                  发表评论
                </Button>
              </div>
            </div>

            <div className="ai-comment-list">
              {commentsLoading ? (
                <div className="ai-tools-loading" style={{ height: 120 }}>
                  <Spin />
                </div>
              ) : comments.length === 0 ? (
                <Text type="secondary">暂无评论，快来抢沙发吧。</Text>
              ) : (
                comments.map((c: any) => renderCommentItem(c, 0))
              )}
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
};

export default ToolDetail;
