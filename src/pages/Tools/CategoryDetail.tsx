import React, { useEffect, useState } from 'react';
import { Typography, Spin } from 'antd';
import { useParams, Link, useHistory } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout';
import { getCategoryDetail } from '@/api/tools';
import { useToolNavItems } from '@/hooks/useToolNavItems';
import './index.less';

const { Title, Paragraph, Text } = Typography;

interface ToolItem {
  id: number;
  toolKey: string;
  name: string;
  description?: string;
}

const CategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { navItems } = useToolNavItems();
  const [title, setTitle] = useState<string>('');
  const [categoryKey, setCategoryKey] = useState<string>('');
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res: any = await getCategoryDetail(Number(id));
        const data = res.data || {};
        setTitle(data.title || '分类详情');
        setCategoryKey(data.categoryKey || data.category_key || '');
        const list = data.Tools || data.tools || [];
        setTools(
          list.map((t: any) => ({
            id: t.id,
            toolKey: t.toolKey,
            name: t.name,
            description: t.description,
          }))
        );
      } catch {
        setTools([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 点击菜单：跳转首页并滚动到对应区块
  const handleMenuClick = (key: string) => {
    history.push('/', { state: { scrollTo: key } });
  };

  const Layout = BasicLayout as any;
  return (
    <Layout
      navItems={navItems}
      activeKey={categoryKey}
      onMenuClick={handleMenuClick}
      headerLeft={
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          AI工具集
        </Link>
      }
      headerRight={
        <Text type="secondary">
          {title} · 共 {tools.length} 个工具
        </Text>
      }
    >
      <div className="ai-tools-page">
        <main className="ai-tools-content">
          {loading && (
            <div className="ai-tools-loading">
              <Spin size="large" />
            </div>
          )}

          {!loading && (
            <section className="ai-tools-section">
              <div className="ai-tools-section-header">
                <Title level={4} className="ai-tools-section-title">
                  {title}
                </Title>
                <Text type="secondary" className="ai-tools-section-count">
                  共 {tools.length} 个工具
                </Text>
              </div>

              {tools.length === 0 ? (
                <div className="ai-tools-empty">
                  <Paragraph>该分类下暂无工具。</Paragraph>
                </div>
              ) : (
                <div className="ai-tools-grid">
                  {tools.map((tool) => (
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
          )}
        </main>
      </div>
    </Layout>
  );
};

export default CategoryDetail;
