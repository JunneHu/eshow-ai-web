/*
 * 基础布局（C 端）：使用 ProLayout 做左侧导航和头部，不包含登录/注册/用户概念
 * 支持传入 navItems/activeKey/onMenuClick/headerLeft/headerRight 用于 AI 工具集页面的动态导航
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withRouter, Link } from 'react-router-dom';
import ProLayout from '@ant-design/pro-layout';
import { ConfigProvider, theme, Switch, Tooltip } from 'antd';
import { VerticalAlignTopOutlined } from '@ant-design/icons';

interface NavItem {
  key: string;
  label: string;
  /** 有 path 时使用 Link 跳转，否则走 onMenuClick 滚动 */
  path?: string;
  /** 菜单图标，收起时显示 */
  icon?: React.ReactNode;
}

interface BasicLayoutProps {
  location?: any;
  history?: any;
  children?: React.ReactNode;
  /** AI 工具集：左侧导航项（热门/最新/分类） */
  navItems?: NavItem[];
  /** AI 工具集：当前激活的导航 key */
  activeKey?: string;
  /** AI 工具集：点击导航时滚动到对应区块 */
  onMenuClick?: (key: string) => void;
  /** AI 工具集：头部左侧内容 */
  headerLeft?: React.ReactNode;
  /** AI 工具集：头部右侧内容 */
  headerRight?: React.ReactNode;
}

const BasicLayout: React.FC<BasicLayoutProps> = (props) => {
  const {
    location,
    children,
    navItems = [],
    activeKey,
    onMenuClick,
    headerLeft,
    headerRight,
  } = props;

  const isToolsMode = navItems.length > 0 && onMenuClick;

  const ProLayoutAny = ProLayout as any;
  const BackTopIcon: any = VerticalAlignTopOutlined;

  const contentWrapRef = useRef<HTMLDivElement | null>(null);
  const scrollTargetRef = useRef<HTMLElement | Window | null>(null);
  const [showBackTop, setShowBackTop] = useState(false);

  // 主题：深色/浅色
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved ? saved === 'dark' : false;
  });

  const applyThemePersist = (nextDark: boolean) => {
    setIsDark(nextDark);
    localStorage.setItem('themeMode', nextDark ? 'dark' : 'light');
  };

  // ProLayout 需要：父级 path + routes 子项，且子项需有 path 才会渲染到菜单
  const routeConfig = useMemo(() => {
    if (isToolsMode) {
      return {
        path: '/',
        hideInMenu: true,
        routes: navItems.map((item) => ({
          path: item.path || `#section-${item.key}`,
          name: item.label,
          key: item.key,
          icon: item.icon,
        })),
      };
    }
    return { path: '/', routes: [{ path: '/', key: 'home', name: '首页' }] };
  }, [isToolsMode, navItems]);

  const menuItemRenderFn = useCallback(
    (item: any, defaultDom: React.ReactNode) => {
      if (item.path && !item.path.startsWith('#')) {
        return <Link to={item.path}>{defaultDom}</Link>;
      }
      return (
        <div
          role="button"
          tabIndex={0}
          onClick={() => onMenuClick?.(item.key)}
          onKeyDown={(e) => e.key === 'Enter' && onMenuClick?.(item.key)}
          style={{ cursor: 'pointer' }}
        >
          {defaultDom}
        </div>
      );
    },
    [onMenuClick]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const findScrollTarget = () => {
      // ProLayout 内容区优先
      const proContent = document.querySelector('.ant-pro-layout-content') as HTMLElement | null;
      if (proContent) return proContent;

      // 页面内滚动容器（Tools 页/分类页等）
      const local = contentWrapRef.current?.querySelector?.('.ai-tools-page') as HTMLElement | null;
      if (local) return local;

      // antd Layout 容器
      const antdContent = document.querySelector('.ant-layout-content') as HTMLElement | null;
      if (antdContent) return antdContent;

      return window;
    };

    const updateVisible = () => {
      const t = scrollTargetRef.current;
      const threshold = window.innerHeight;
      let top = 0;
      if (!t) return;
      if (t === window) {
        top = window.scrollY || document.documentElement.scrollTop || 0;
      } else {
        top = (t as HTMLElement).scrollTop || 0;
      }
      setShowBackTop(top > threshold);
    };

    // 等 DOM 就绪
    const raf = window.requestAnimationFrame(() => {
      const target = findScrollTarget();
      scrollTargetRef.current = target;

      const listener = () => updateVisible();
      if (target === window) {
        window.addEventListener('scroll', listener, { passive: true } as any);
      } else {
        (target as HTMLElement).addEventListener('scroll', listener, { passive: true } as any);
      }

      updateVisible();

      // cleanup 注册到 ref 上，供 effect return 使用
      (scrollTargetRef.current as any).__backTopCleanup = () => {
        if (target === window) window.removeEventListener('scroll', listener as any);
        else (target as HTMLElement).removeEventListener('scroll', listener as any);
      };
    });

    return () => {
      window.cancelAnimationFrame(raf);
      const t: any = scrollTargetRef.current as any;
      if (t && typeof t.__backTopCleanup === 'function') {
        t.__backTopCleanup();
        delete t.__backTopCleanup;
      }
    };
  }, [location?.pathname]);

  const handleBackTop = useCallback(() => {
    const t = scrollTargetRef.current;
    try {
      if (!t || t === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      (t as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore
    }
  }, []);

  const isNewsPage = (location?.pathname || '').startsWith('/news');

  // 头部左侧：仅 logo/标题
  const titleNode = useMemo(() => {
    return (
      <Link to="/" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
        AI工具集
      </Link>
    );
  }, []);

  // 头部右侧：AI资讯 入口（红块处移到右侧）
  const headerRightContent = useMemo(
    () => (
      <span className="ai-header-right-group" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {isToolsMode && (
          <Link
            to="/news"
            style={{
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: isNewsPage ? 600 : 400,
              opacity: isNewsPage ? 1 : 0.9,
            }}
            className="ai-header-news-link"
          >
            AI资讯
          </Link>
        )}
        {isToolsMode && headerRight}
      </span>
    ),
    [isToolsMode, isNewsPage, headerRight]
  );

  const rightContentRenderFn = useCallback(
    () => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {headerRightContent}
        <Tooltip title={isDark ? '深色主题' : '浅色主题'}>
          <Switch
            checkedChildren="暗"
            unCheckedChildren="亮"
            checked={isDark}
            onChange={applyThemePersist}
          />
        </Tooltip>
      </div>
    ),
    [headerRightContent, isDark, applyThemePersist]
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: isDark
          ? {
              colorBgLayout: '#0b1f2a',
              colorText: '#ffffff',
              colorTextSecondary: '#c9d1d9',
            }
          : {
              colorBgLayout: '#f5f7fa',
              colorText: '#1f1f1f',
              colorTextSecondary: '#555',
            },
      }}
    >
      <ProLayoutAny
        title={titleNode as any}
        pageTitleRender={() => (isToolsMode ? '' : 'AI工具集')}
        layout="mix"
        fixSiderbar
        fixedHeader
        headerTheme={isDark ? 'dark' : 'light' as any}
        menu={{
          theme: isDark ? 'dark' : 'light',
          selectedKeys: isToolsMode && activeKey ? [activeKey] : [],
        } as any}
        token={{
          ...(isDark
            ? {
                colorBgHeader: '#001529',
                colorBgMenu: '#001529',
                colorTextMenu: '#ffffff',
                colorTextMenuActive: '#ffffff',
                colorTextMenuSelected: '#ffffff',
                colorBgMenuItemHover: '#0b2a4a',
                sider: { colorBgCollapsedButton: '#001529' },
                pageContainer: { colorBgPageContainer: '#0e2438' },
              }
            : {
                colorBgHeader: '#ffffff',
                colorBgMenu: '#ffffff',
                colorTextMenu: '#1f1f1f',
                colorTextMenuActive: '#1f1f1f',
                colorTextMenuSelected: '#1677ff',
                colorBgMenuItemHover: '#f5f7fa',
                sider: { colorBgCollapsedButton: '#ffffff' },
                pageContainer: { colorBgPageContainer: '#ffffff' },
              }),
        } as any}
        route={routeConfig as any}
        location={{ pathname: location?.pathname || '/' }}
        menuDataRender={
          isToolsMode
            ? () =>
                navItems.map((item) => ({
                  path: item.path || `#section-${item.key}`,
                  name: item.label,
                  key: item.key,
                  icon: item.icon,
                }))
            : undefined
        }
        menuItemRender={isToolsMode ? menuItemRenderFn : undefined}
        rightContentRender={rightContentRenderFn}
      >
        <div
          ref={contentWrapRef}
          style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}
        >
          {children}

          {showBackTop ? (
            <Tooltip title="回到顶部">
              <button type="button" className="ai-back-top" onClick={handleBackTop} aria-label="back-to-top">
                <BackTopIcon />
              </button>
            </Tooltip>
          ) : null}
        </div>
      </ProLayoutAny>
    </ConfigProvider>
  );
};

export default withRouter(BasicLayout as any);


