import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Typography, Spin, Carousel, Input } from 'antd';
import {
  FireOutlined,
  ClockCircleOutlined,
  EditOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  RobotOutlined,
  MessageOutlined,
  CodeOutlined,
  CloudOutlined,
  AppstoreOutlined,
  SoundOutlined,
  SearchOutlined,
  ReadOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  AuditOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { Link, useHistory, useLocation } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout';
import { getAdsByPosition, getCategories, getCategoryDetail } from '@/api/tools';
import { track } from '@/utils/tracking';
import './index.less';

const { Title, Paragraph, Text } = Typography;

const HOME_CATEGORY_LIMIT = 10;

// 分类 key -> 图标映射（收起时显示）
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  writing: React.createElement(EditOutlined),
  image: React.createElement(PictureOutlined),
  video: React.createElement(VideoCameraOutlined),
  office: React.createElement(FileTextOutlined),
  agent: React.createElement(RobotOutlined),
  chat: React.createElement(MessageOutlined),
  coding: React.createElement(CodeOutlined),
  platform: React.createElement(CloudOutlined),
  design: React.createElement(AppstoreOutlined),
  audio: React.createElement(SoundOutlined),
  search: React.createElement(SearchOutlined),
  learn: React.createElement(ReadOutlined),
  models: React.createElement(DatabaseOutlined),
  eval: React.createElement(BarChartOutlined),
  'content-detect': React.createElement(AuditOutlined),
  prompt: React.createElement(BulbOutlined),
};

interface ToolItem {
  id: number;
  toolKey: string;
  name: string;
  description?: string;
  tags?: string[];
  // 方便做统计和展示：附带分类信息
  categoryKey?: string;
  categoryTitle?: string;
}

interface CategoryWithTools {
  id: number;
  categoryKey: string;
  title: string;
  tools: ToolItem[];
}

const ToolsPage: React.FC = () => {
  const location = useLocation<{ scrollTo?: string }>();
  const history = useHistory();
  const [categories, setCategories] = useState<CategoryWithTools[]>([]);
  const [activeKey, setActiveKey] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [homeAds, setHomeAds] = useState<any[]>([]);

  const [keyword, setKeyword] = useState('');

  const [adExposedSet] = useState(() => new Set<string>());

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  // 查找实际滚动容器（支持 overflow: auto/scroll/overlay/clip）
  const findScrollParent = (el: HTMLElement | null): HTMLElement | null => {
    if (!el || el === document.body) return null;
    const style = getComputedStyle(el);
    const overflow = (style.overflow || '') + (style.overflowY || '');
    if (/(auto|scroll|overlay|clip)/.test(overflow)) return el;
    return findScrollParent(el.parentElement);
  };

  const handleNavClick = (categoryKey: string) => {
    // 优先用 ref，其次用 id 查找（避免 ref 未及时更新）
    const targetEl =
      sectionRefs.current[categoryKey] ||
      document.getElementById(`section-${categoryKey}`);
    if (!targetEl) return;

    const headerOffset = 120;

    // 使用 requestAnimationFrame 确保 DOM 就绪后再滚动
    requestAnimationFrame(() => {
      // 策略1：从目标元素向上找滚动容器
      let scrollParent =
        findScrollParent(targetEl) ||
        (contentRef.current ? findScrollParent(contentRef.current) : null);

      // 策略2：尝试 ProLayout / antd Layout 的 content 容器
      if (!scrollParent) {
        scrollParent =
          document.querySelector('.ant-pro-layout-content') as HTMLElement ||
          document.querySelector('.ant-layout-content') as HTMLElement;
      }

      if (scrollParent) {
        // 在内部滚动容器中滚动
        const parentRect = scrollParent.getBoundingClientRect();
        const elRect = targetEl.getBoundingClientRect();
        const elementTopInContent =
          scrollParent.scrollTop + (elRect.top - parentRect.top);
        const targetScrollTop = Math.max(0, elementTopInContent - headerOffset);
        scrollParent.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      } else {
        // 策略3：使用 window 滚动（页面级滚动）
        const docTop =
          targetEl.getBoundingClientRect().top +
          (window.scrollY ?? document.documentElement.scrollTop);
        const targetScrollTop = Math.max(0, docTop - headerOffset);
        window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      }
    });
  };

  useEffect(() => {
    getAdsByPosition('home_top')
      .then((res: any) => {
        setHomeAds(res.data || []);
      })
      .catch(() => {
        setHomeAds([]);
      });

    const fetchData = async () => {
      setLoading(true);
      try {
        const res: any = await getCategories();
        const list = res.data || [];

        const withTools: CategoryWithTools[] = await Promise.all(
          list.map(async (c: any) => {
            try {
              const detail: any = await getCategoryDetail(c.id);
              const data = detail.data || {};
              const tools: ToolItem[] = (data.Tools || data.tools || []).map((t: any) => {
                let tags: string[] = [];
                if (Array.isArray(t.tags)) tags = t.tags;
                else if (typeof t.tags === 'string') {
                  try {
                    const parsed = JSON.parse(t.tags);
                    tags = Array.isArray(parsed) ? parsed : [t.tags];
                  } catch {
                    tags = t.tags ? [t.tags] : [];
                  }
                }
                return {
                  id: t.id,
                  toolKey: t.toolKey,
                  name: t.name,
                  description: t.description,
                  tags,
                };
              });
              return {
                id: c.id,
                categoryKey: c.categoryKey,
                title: c.title,
                tools,
              };
            } catch {
              return {
                id: c.id,
                categoryKey: c.categoryKey,
                title: c.title,
                tools: [],
              };
            }
          })
        );

        setCategories(withTools);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!homeAds || homeAds.length === 0) return;
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
            position: position || 'home_top',
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
  }, [homeAds.length]);

  // 内容加载完成后：从分类页跳转则滚动到目标区块，否则滚动到顶部
  useEffect(() => {
    if (loading) return;
    const scrollTo = (location.state as any)?.scrollTo;
    if (scrollTo) {
      setActiveKey(scrollTo);
      const t = setTimeout(() => handleNavClick(scrollTo), 150);
      return () => clearTimeout(t);
    }
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    const scrollParent =
      contentRef.current ? findScrollParent(contentRef.current) : null;
    const target =
      scrollParent ||
      (document.querySelector('.ant-pro-layout-content') as HTMLElement);
    if (target && typeof target.scrollTo === 'function') {
      target.scrollTo(0, 0);
    }
    window.scrollTo(0, 0);
  }, [loading, (location.state as any)?.scrollTo]);

  // 扁平化所有工具并去重（同一工具可能属于多个分类）
  const flatTools: ToolItem[] = useMemo(() => {
    const seen = new Set<number>();
    const result: ToolItem[] = [];
    for (const c of categories) {
      for (const t of c.tools) {
        if (seen.has(t.id)) continue;
        seen.add(t.id);
        result.push({ ...t, categoryKey: c.categoryKey, categoryTitle: c.title });
      }
    }
    return result;
  }, [categories]);

  const flatToolCount = flatTools.length;

  const filteredTools = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return [] as ToolItem[];
    return flatTools.filter((t) => {
      const name = (t.name || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      const tags = (t.tags || []).map((x) => String(x).toLowerCase());
      const cat = (t.categoryTitle || '').toLowerCase();
      return (
        name.includes(kw) ||
        desc.includes(kw) ||
        cat.includes(kw) ||
        tags.some((tag) => tag.includes(kw))
      );
    });
  }, [flatTools, keyword]);

  // 热门工具：优先按 tags 包含 hot/热门 过滤；若无则取前 16 个作为兜底
  const hotTools = useMemo(() => {
    const byTag = flatTools.filter((t) =>
      (t.tags || []).some((tag) =>
        ['hot', 'Hot', 'HOT', '热门'].includes(String(tag))
      )
    );
    if (byTag.length > 0) return byTag.slice(0, 16);
    return flatTools.slice(0, 16);
  }, [flatTools]);

  // 最新收录：优先按 tags 包含 最新/new 过滤；若无则按 id 降序取前 16 个
  const latestTools = useMemo(() => {
    const byTag = flatTools.filter((t) =>
      (t.tags || []).some((tag) =>
        ['最新', 'new', 'New', 'NEW'].includes(String(tag))
      )
    );
    if (byTag.length > 0) return byTag.slice(0, 16);
    return [...flatTools].sort((a, b) => b.id - a.id).slice(0, 16);
  }, [flatTools]);

  // 左侧导航项：热门 / 最新 / 各分类（含 icon，收起时显示）
  const navItems = useMemo(() => {
    const items: { key: string; label: string; icon?: React.ReactNode }[] = [];
    if (hotTools.length > 0) {
      items.push({ key: 'hot', label: '热门工具', icon: React.createElement(FireOutlined) });
    }
    if (latestTools.length > 0) {
      items.push({ key: 'latest', label: '最新收录', icon: React.createElement(ClockCircleOutlined) });
    }
    categories.forEach((c) => {
      items.push({
        key: c.categoryKey,
        label: c.title,
        icon: CATEGORY_ICONS[c.categoryKey] ?? React.createElement(AppstoreOutlined),
      });
    });
    return items;
  }, [categories, hotTools.length, latestTools.length]);

  // 监听滚动，更新当前激活的分类（支持 window 或 ProLayout 内容区滚动）
  useEffect(() => {
    const handleScroll = () => {
      const offset = 120;
      let currentKey: string | undefined;
      let bestTop = -Infinity;

      // 按 navItems 顺序遍历，找到「最靠近顶部且已进入视口」的区块（rect.top 最大且 <= offset）
      for (const item of navItems) {
        const el = sectionRefs.current[item.key];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= offset && rect.top > bestTop) {
          bestTop = rect.top;
          currentKey = item.key;
        }
      }
      // 若没有区块进入视口，选顶部最近的（rect.top 最小的）
      if (!currentKey && navItems.length > 0) {
        let topmost = Infinity;
        for (const item of navItems) {
          const el = sectionRefs.current[item.key];
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top < topmost) {
            topmost = rect.top;
            currentKey = item.key;
          }
        }
      }
      if (currentKey && currentKey !== activeKey) {
        setActiveKey(currentKey);
      }
    };

    const scrollEl =
      contentRef.current ? findScrollParent(contentRef.current) : null;
    const target =
      scrollEl ||
      (document.querySelector('.ant-pro-layout-content') as HTMLElement) ||
      window;

    target.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始化
    return () => target.removeEventListener('scroll', handleScroll);
  }, [activeKey, navItems]);

  // 初始化激活项：优先热门，其次最新，再次第一个分类
  useEffect(() => {
    if (!navItems.length) return;
    if (hotTools.length > 0) {
      setActiveKey('hot');
    } else if (latestTools.length > 0) {
      setActiveKey('latest');
    } else {
      setActiveKey(navItems[0].key);
    }
  }, [navItems.length, hotTools.length, latestTools.length]);


  const Layout = BasicLayout as any;

  const homeAdsDisplayType = useMemo(() => {
    const first = homeAds && homeAds[0];
    return first && first.displayType ? String(first.displayType) : 'tile';
  }, [homeAds]);

  return (
    <Layout
      navItems={navItems}
      activeKey={activeKey}
      onMenuClick={handleNavClick}
      headerLeft="AI工具集"
      headerRight={null}
    >
      <div ref={contentRef} className="ai-tools-page">
        <main className="ai-tools-content">
          <div className="ai-tools-search-bar">
            <Input.Search
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              placeholder="搜索工具名称/简介/标签"
              size="large"
            />
          </div>

          {!loading && keyword.trim() ? (
            <section className="ai-tools-section">
              <div className="ai-tools-section-header ai-tools-section-header-circle">
                <span className="ai-tools-section-header-left">
                  <span className="ai-tools-section-header-dot" />
                  <Title level={4} className="ai-tools-section-title">
                    搜索结果
                  </Title>
                </span>
                <Text type="secondary" className="ai-tools-section-count">
                  {filteredTools.length} / {flatToolCount}
                </Text>
              </div>

              {filteredTools.length === 0 ? (
                <div className="ai-tools-empty">
                  <Paragraph>没有找到匹配的工具。</Paragraph>
                </div>
              ) : (
                <div className="ai-tools-grid">
                  {filteredTools.map((tool) => (
                    <div
                      key={`search-${tool.id}`}
                      className="ai-tools-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => history.push(`/tool/${tool.id}`)}
                      onKeyDown={(e) => e.key === 'Enter' && history.push(`/tool/${tool.id}`)}
                    >
                      <div className="ai-tools-card-avatar">
                        {tool.name?.[0]?.toUpperCase?.() || 'A'}
                      </div>
                      <div className="ai-tools-card-body">
                        <div className="ai-tools-card-name" title={tool.name}>
                          {tool.name}
                        </div>
                        <div className="ai-tools-card-desc" title={tool.description || ''}>
                          {tool.description || '暂无简介'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {!loading && homeAds.length > 0 && (
            <section className="ai-tools-section ai-ads-section">
              {homeAdsDisplayType === 'carousel' && homeAds.length > 1 ? (
                <Carousel autoplay dots>
                  {homeAds.map((ad: any) => {
                    const href = ad.linkUrl ? String(ad.linkUrl) : '';
                    const img = ad.imageUrl ? String(ad.imageUrl) : '';
                    return (
                      <a
                        key={ad.id}
                        className="ai-ad-item"
                        data-ad-id={String(ad.id)}
                        data-ad-position="home_top"
                        href={href || undefined}
                        target={href ? "_blank" : undefined}
                        rel={href ? "noreferrer" : undefined}
                        onClick={() => {
                          track('ad_click', {
                            adId: ad.id,
                            position: 'home_top',
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
                    homeAds.length === 1 ? 'ai-ads-grid-1' : homeAds.length === 2 ? 'ai-ads-grid-2' : ''
                  }`}
                >
                  {homeAds.map((ad: any) => {
                    const href = ad.linkUrl ? String(ad.linkUrl) : '';
                    const img = ad.imageUrl ? String(ad.imageUrl) : '';
                    return (
                      <a
                        key={ad.id}
                        className="ai-ad-item"
                        data-ad-id={String(ad.id)}
                        data-ad-position="home_top"
                        href={href || undefined}
                        target={href ? "_blank" : undefined}
                        rel={href ? "noreferrer" : undefined}
                        onClick={() => {
                          track('ad_click', {
                            adId: ad.id,
                            position: 'home_top',
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
            {loading && (
              <div className="ai-tools-loading">
                <Spin size="large" />
              </div>
            )}

            {!loading && categories.length === 0 && (
              <div className="ai-tools-empty">
                <Paragraph>暂无可用工具，请先在后台录入工具和分类。</Paragraph>
              </div>
            )}

          {/* 顶部：热门工具 */}
          {!loading && !keyword.trim() && hotTools.length > 0 && (
            <section
              id="section-hot"
              ref={(el) => {
                sectionRefs.current.hot = el;
              }}
              className="ai-tools-section ai-tools-section-special"
            >
              <div className="ai-tools-section-header ai-tools-section-header-filled">
                <span className="ai-tools-section-header-icon">
                  {/* @ts-expect-error antd icons strict typing */}
                  <FireOutlined />
                </span>
                <span className="ai-tools-section-header-text">热门工具</span>
              </div>
              <div className="ai-tools-grid ai-tools-grid-row">
                {hotTools.map((tool) => (
                  <div
                    key={`hot-${tool.id}`}
                    className="ai-tools-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => history.push(`/tool/${tool.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && history.push(`/tool/${tool.id}`)}
                  >
                    <div className="ai-tools-card-avatar">
                      {tool.name?.[0]?.toUpperCase?.() || 'A'}
                    </div>
                    <div className="ai-tools-card-body">
                      <div className="ai-tools-card-name" title={tool.name}>{tool.name}</div>
                      <div className="ai-tools-card-desc" title={tool.description || ''}>
                        {tool.description || '暂无简介'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 顶部：最新收录 */}
          {!loading && !keyword.trim() && latestTools.length > 0 && (
            <section
              id="section-latest"
              ref={(el) => {
                sectionRefs.current.latest = el;
              }}
              className="ai-tools-section ai-tools-section-special"
            >
              <div className="ai-tools-section-header ai-tools-section-header-filled">
                <span className="ai-tools-section-header-icon">
                  {/* @ts-expect-error antd icons strict typing */}
                  <ClockCircleOutlined />
                </span>
                <span className="ai-tools-section-header-text">最新收录</span>
              </div>
              <div className="ai-tools-grid ai-tools-grid-row">
                {latestTools.map((tool) => (
                  <div
                    key={`latest-${tool.id}`}
                    className="ai-tools-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => history.push(`/tool/${tool.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && history.push(`/tool/${tool.id}`)}
                  >
                    <div className="ai-tools-card-avatar">
                      {tool.name?.[0]?.toUpperCase?.() || 'A'}
                    </div>
                    <div className="ai-tools-card-body">
                      <div className="ai-tools-card-name" title={tool.name}>{tool.name}</div>
                      <div className="ai-tools-card-desc" title={tool.description || ''}>
                        {tool.description || '暂无简介'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

            {/* 按分类分组展示 */}
            {!loading && !keyword.trim() &&
              categories.map((c) => {
                const displayTools = c.tools.slice(0, HOME_CATEGORY_LIMIT);
                const hasMore = c.tools.length > HOME_CATEGORY_LIMIT;
                return (
                <section
                  key={c.categoryKey}
                  id={`section-${c.categoryKey}`}
                  ref={(el) => {
                    sectionRefs.current[c.categoryKey] = el;
                  }}
                  className="ai-tools-section"
                >
                  <div className="ai-tools-section-header ai-tools-section-header-circle">
                    <span className="ai-tools-section-header-left">
                      <span className="ai-tools-section-header-dot" />
                      <Title level={4} className="ai-tools-section-title">
                        {c.title}
                      </Title>
                    </span>
                    {hasMore ? (
                      <Link
                        to={`/category/${c.id}`}
                        className="ai-tools-section-more"
                      >
                        查看更多&gt;&gt;
                      </Link>
                    ) : (
                      <Text type="secondary" className="ai-tools-section-count">
                        {c.tools.length} 个工具
                      </Text>
                    )}
                  </div>

                  <div className="ai-tools-grid">
                    {displayTools.map((tool) => (
                      <div
                        key={tool.id}
                        className="ai-tools-card"
                        role="button"
                        tabIndex={0}
                        onClick={() => history.push(`/tool/${tool.id}`)}
                        onKeyDown={(e) => e.key === 'Enter' && history.push(`/tool/${tool.id}`)}
                      >
                        <div className="ai-tools-card-avatar">
                          {tool.name?.[0]?.toUpperCase?.() || 'A'}
                        </div>
                        <div className="ai-tools-card-body">
                          <div className="ai-tools-card-name" title={tool.name}>{tool.name}</div>
                          <div className="ai-tools-card-desc" title={tool.description || ''}>
                            {tool.description || '暂无简介'}
                          </div>
                        </div>
                      </div>
                    ))}

                    {displayTools.length === 0 && (
                      <div className="ai-tools-section-empty">
                        <Text type="secondary">该分类下暂时没有工具。</Text>
                      </div>
                    )}
                  </div>
                </section>
              );
              })}
        </main>
      </div>
    </Layout>
  );
};

export default ToolsPage;

